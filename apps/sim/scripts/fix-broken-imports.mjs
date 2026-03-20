#!/usr/bin/env node
/**
 * Fix broken imports where "import { apiUrl } from '@/lib/api/fetcher'"
 * was inserted inside a multi-line import block.
 *
 * Detects pattern:
 *   import {                          ← or "import type {"
 *   import { apiUrl } from '...'      ← WRONG: inserted inside the block
 *     SomeType,
 *   } from 'some-module'
 *
 * Fixes to:
 *   import {
 *     SomeType,
 *   } from 'some-module'
 *   import { apiUrl } from '@/lib/api/fetcher'
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join, relative } from 'path'

const ROOT = new URL('..', import.meta.url).pathname

const INCLUDE_DIRS = ['app', 'components', 'hooks', 'stores', 'lib', 'triggers']

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

const API_URL_IMPORT = "import { apiUrl } from '@/lib/api/fetcher'"
let fixCount = 0

for (const dir of INCLUDE_DIRS) {
  const fullDir = join(ROOT, dir)
  try { statSync(fullDir) } catch { continue }

  for (const filePath of walkDir(fullDir)) {
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) continue

    const content = readFileSync(filePath, 'utf-8')
    if (!content.includes(API_URL_IMPORT)) continue

    const lines = content.split('\n')
    const apiUrlLineIdx = lines.findIndex(l => l.trim() === API_URL_IMPORT)
    if (apiUrlLineIdx < 0) continue

    // Check if the previous line is an incomplete import (no "from" keyword)
    const prevLine = lines[apiUrlLineIdx - 1] || ''
    const isInsideImport = /^import\s+(type\s+)?{/.test(prevLine.trim()) &&
                           !prevLine.includes(' from ')

    if (!isInsideImport) continue

    // Remove the misplaced apiUrl import line
    lines.splice(apiUrlLineIdx, 1)

    // Find the end of the current multi-line import block (line with "} from '...")
    let endIdx = -1
    for (let i = apiUrlLineIdx; i < lines.length; i++) {
      if (/^\s*}\s*from\s+['"]/.test(lines[i])) {
        endIdx = i
        break
      }
    }

    if (endIdx >= 0) {
      // Insert the apiUrl import AFTER the closing of the multi-line import
      lines.splice(endIdx + 1, 0, API_URL_IMPORT)
    } else {
      // Fallback: insert after all imports
      let lastImport = 0
      for (let i = 0; i < lines.length; i++) {
        if (/^import\s/.test(lines[i]) || /^}\s*from\s/.test(lines[i])) {
          lastImport = i
        }
      }
      lines.splice(lastImport + 1, 0, API_URL_IMPORT)
    }

    writeFileSync(filePath, lines.join('\n'), 'utf-8')
    const relPath = relative(ROOT, filePath)
    console.log(`Fixed: ${relPath}`)
    fixCount++
  }
}

console.log(`\nFixed ${fixCount} files.`)
