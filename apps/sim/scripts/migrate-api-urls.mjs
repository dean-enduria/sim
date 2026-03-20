#!/usr/bin/env node
/**
 * Codemod: Migrate bare fetch('/api/...') calls to fetch(apiUrl('/api/...'))
 *
 * This script finds all client-side TypeScript/TSX files that call
 * fetch('/api/...') or fetch(`/api/...`) without the apiUrl() wrapper,
 * adds the import, and wraps the URL argument.
 *
 * Safe to run multiple times — skips files that already use apiUrl.
 *
 * Usage: node scripts/migrate-api-urls.mjs [--dry-run]
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join, relative } from 'path'

const ROOT = new URL('..', import.meta.url).pathname
const DRY_RUN = process.argv.includes('--dry-run')

// Directories to process (client-side code only)
const INCLUDE_DIRS = [
  'app',
  'components',
  'hooks',
  'stores',
  'lib',
  'triggers',
]

// Patterns to skip
const SKIP_PATTERNS = [
  /node_modules/,
  /\.next/,
  /app\/api\//,           // Server-side route handlers
  /lib\/api\/fetcher\.ts/, // The utility itself
  /scripts\//,
]

function shouldProcess(filePath) {
  if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) return false
  return !SKIP_PATTERNS.some(p => p.test(filePath))
}

function* walkDir(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.next') continue
      yield* walkDir(fullPath)
    } else {
      yield fullPath
    }
  }
}

/**
 * Transform a file's content to wrap fetch('/api/...') calls with apiUrl().
 * Handles:
 *   fetch('/api/...')           → fetch(apiUrl('/api/...'))
 *   fetch('/api/...', opts)     → fetch(apiUrl('/api/...'), opts)
 *   fetch(`/api/...`)           → fetch(apiUrl(`/api/...`))
 *   fetch(`/api/...`, opts)     → fetch(apiUrl(`/api/...`), opts)
 */
function transformContent(content) {
  // Skip if file already imports apiUrl
  if (content.includes("from '@/lib/api/fetcher'") || content.includes('from "@/lib/api/fetcher"')) {
    // File already imports from fetcher — still check if there are unfixed calls
  }

  let modified = content
  let changeCount = 0

  // Pattern 1: fetch('/api/...')  or  fetch('/api/...', ...)
  // Match: fetch('/api/ ... ')  where the string is single-quoted
  modified = modified.replace(
    /fetch\(\s*'(\/api\/[^']*)'/g,
    (match, url) => {
      changeCount++
      return `fetch(apiUrl('${url}')`
    }
  )

  // Pattern 2: fetch("/api/...")  or  fetch("/api/...", ...)
  modified = modified.replace(
    /fetch\(\s*"(\/api\/[^"]*)"/g,
    (match, url) => {
      changeCount++
      return `fetch(apiUrl("${url}")`
    }
  )

  // Pattern 3: fetch(`/api/...`)  or  fetch(`/api/...`, ...)
  // This is trickier because template literals can contain ${} expressions.
  // We match fetch(`/api/ ... `)  up to the closing backtick.
  modified = modified.replace(
    /fetch\(\s*`(\/api\/[^`]*)`/g,
    (match, url) => {
      changeCount++
      return `fetch(apiUrl(\`${url}\`)`
    }
  )

  if (changeCount === 0) return null // No changes needed

  // Add import if not already present
  if (!modified.includes("from '@/lib/api/fetcher'") && !modified.includes('from "@/lib/api/fetcher"')) {
    // Find the right place to insert the import
    // Insert after the last import statement
    const importLines = modified.split('\n')
    let lastImportIdx = -1
    for (let i = 0; i < importLines.length; i++) {
      if (importLines[i].match(/^import\s/) || importLines[i].match(/^} from /)) {
        lastImportIdx = i
      }
      // Stop scanning after we pass the import section
      if (lastImportIdx >= 0 && !importLines[i].match(/^import\s/) && !importLines[i].match(/^} from /) && importLines[i].trim() !== '' && !importLines[i].match(/^\s*\/\//)) {
        break
      }
    }

    const importStatement = "import { apiUrl } from '@/lib/api/fetcher'"

    if (lastImportIdx >= 0) {
      importLines.splice(lastImportIdx + 1, 0, importStatement)
    } else {
      // No imports found, add at top
      importLines.unshift(importStatement)
    }
    modified = importLines.join('\n')
  } else {
    // Import exists but might not include apiUrl
    if (!modified.includes('apiUrl')) {
      // The import is there but apiUrl isn't imported — need to add it
      modified = modified.replace(
        /import\s*{([^}]*)}\s*from\s*['"]@\/lib\/api\/fetcher['"]/,
        (match, imports) => {
          if (imports.includes('apiUrl')) return match
          return `import {${imports}, apiUrl } from '@/lib/api/fetcher'`
        }
      )
    }
  }

  return { content: modified, changeCount }
}

// Main
let totalFiles = 0
let totalChanges = 0
const changedFiles = []

for (const dir of INCLUDE_DIRS) {
  const fullDir = join(ROOT, dir)
  try {
    statSync(fullDir)
  } catch {
    continue
  }

  for (const filePath of walkDir(fullDir)) {
    const relPath = relative(ROOT, filePath)
    if (!shouldProcess(relPath)) continue

    const content = readFileSync(filePath, 'utf-8')

    // Quick check: does this file even have fetch('/api/ or fetch(`/api/?
    if (!content.match(/fetch\(\s*['"`]\/api\//)) continue

    // Skip if already fully migrated (all fetch calls use apiUrl)
    if (!content.match(/fetch\(\s*['"`]\/api\//) || content.match(/fetch\(\s*apiUrl\(/)) {
      // Has some apiUrl calls — check if there are STILL bare calls
      const bareCallCount = (content.match(/fetch\(\s*['"`]\/api\//g) || []).length
      const wrappedCallCount = (content.match(/fetch\(\s*apiUrl\(/g) || []).length
      if (bareCallCount === 0) continue
    }

    const result = transformContent(content)
    if (!result) continue

    totalFiles++
    totalChanges += result.changeCount
    changedFiles.push({ path: relPath, changes: result.changeCount })

    if (!DRY_RUN) {
      writeFileSync(filePath, result.content, 'utf-8')
    }
  }
}

console.log(`\n${DRY_RUN ? '[DRY RUN] ' : ''}Migration complete:`)
console.log(`  Files modified: ${totalFiles}`)
console.log(`  fetch() calls wrapped: ${totalChanges}`)
console.log('')

if (changedFiles.length > 0) {
  console.log('Changed files:')
  for (const f of changedFiles.sort((a, b) => b.changes - a.changes)) {
    console.log(`  ${f.changes} changes: ${f.path}`)
  }
}
