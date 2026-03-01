/**
 * Stubbed email template module.
 * Transactional email templates have been removed — Enduria handles notifications.
 * All render functions return empty strings (no-ops).
 * All React components return null.
 */

import { getBrandConfig } from '@/lib/branding'

// ---- Subjects ----

export type EmailSubjectType =
  | 'sign-in'
  | 'email-verification'
  | 'forget-password'
  | 'reset-password'
  | 'invitation'
  | 'batch-invitation'
  | 'polling-group-invitation'
  | 'help-confirmation'
  | 'enterprise-subscription'
  | 'usage-threshold'
  | 'free-tier-upgrade'
  | 'plan-welcome-pro'
  | 'plan-welcome-team'
  | 'credit-purchase'
  | 'welcome'

export function getEmailSubject(type: EmailSubjectType): string {
  const brandName = getBrandConfig().name

  switch (type) {
    case 'sign-in':
      return `Sign in to ${brandName}`
    case 'email-verification':
      return `Verify your email for ${brandName}`
    case 'forget-password':
    case 'reset-password':
      return `Reset your ${brandName} password`
    case 'invitation':
      return `You've been invited to join a team on ${brandName}`
    case 'batch-invitation':
      return `You've been invited to join a team and workspaces on ${brandName}`
    case 'polling-group-invitation':
      return `You've been invited to join an email polling group on ${brandName}`
    case 'help-confirmation':
      return 'Your request has been received'
    case 'enterprise-subscription':
      return `Your Enterprise Plan is now active on ${brandName}`
    case 'usage-threshold':
      return `You're nearing your monthly budget on ${brandName}`
    case 'free-tier-upgrade':
      return `You're at 90% of your free credits on ${brandName}`
    case 'plan-welcome-pro':
      return `Your Pro plan is now active on ${brandName}`
    case 'plan-welcome-team':
      return `Your Team plan is now active on ${brandName}`
    case 'credit-purchase':
      return `Credits added to your ${brandName} account`
    case 'welcome':
      return `Welcome to ${brandName}`
    default:
      return brandName
  }
}

// ---- Render functions (all stubbed to return empty strings) ----

export async function renderOTPEmail(
  _otp: string,
  _email: string,
  _type?: 'sign-in' | 'email-verification' | 'forget-password',
  _chatTitle?: string
): Promise<string> {
  return ''
}

export async function renderPasswordResetEmail(
  _username: string,
  _resetLink: string
): Promise<string> {
  return ''
}

export async function renderInvitationEmail(
  _inviterName: string,
  _organizationName: string,
  _invitationUrl: string
): Promise<string> {
  return ''
}

export async function renderBatchInvitationEmail(
  _inviterName: string,
  _organizationName: string,
  _organizationRole: 'admin' | 'member',
  _workspaceInvitations: Array<{
    workspaceId: string
    workspaceName: string
    permission: 'admin' | 'write' | 'read'
  }>,
  _acceptUrl: string
): Promise<string> {
  return ''
}

export async function renderHelpConfirmationEmail(
  _type: 'bug' | 'feedback' | 'feature_request' | 'other',
  _attachmentCount?: number
): Promise<string> {
  return ''
}

export async function renderWelcomeEmail(_userName?: string): Promise<string> {
  return ''
}

export async function renderWorkspaceInvitationEmail(
  _inviterName: string,
  _workspaceName: string,
  _invitationLink: string
): Promise<string> {
  return ''
}

export async function renderPollingGroupInvitationEmail(_params: {
  inviterName: string
  organizationName: string
  pollingGroupName: string
  provider: 'google-email' | 'outlook'
  inviteLink: string
}): Promise<string> {
  return ''
}

export interface EmailRateLimitStatus {
  requestsPerMinute: number
  remaining: number
  maxBurst?: number
  resetAt?: string
}

export interface EmailRateLimitsData {
  sync?: EmailRateLimitStatus
  async?: EmailRateLimitStatus
}

export interface EmailUsageData {
  currentPeriodCost: number
  limit: number
  percentUsed: number
  isExceeded?: boolean
}

export interface WorkflowNotificationEmailProps {
  workflowName: string
  status: 'success' | 'error'
  trigger: string
  duration: string
  cost: string
  logUrl: string
  alertReason?: string
  finalOutput?: unknown
  rateLimits?: EmailRateLimitsData
  usageData?: EmailUsageData
}

export async function renderWorkflowNotificationEmail(
  _params: WorkflowNotificationEmailProps
): Promise<string> {
  return ''
}

export async function renderEnterpriseSubscriptionEmail(_userName: string): Promise<string> {
  return ''
}

export async function renderUsageThresholdEmail(_params: {
  userName?: string
  planName: string
  percentUsed: number
  currentUsage: number
  limit: number
  ctaLink: string
}): Promise<string> {
  return ''
}

export async function renderFreeTierUpgradeEmail(_params: {
  userName?: string
  percentUsed: number
  currentUsage: number
  limit: number
  upgradeLink: string
}): Promise<string> {
  return ''
}

export async function renderPlanWelcomeEmail(_params: {
  planName: 'Pro' | 'Team'
  userName?: string
  loginLink?: string
}): Promise<string> {
  return ''
}

export async function renderCreditPurchaseEmail(_params: {
  userName?: string
  amount: number
  newBalance: number
}): Promise<string> {
  return ''
}

export async function renderPaymentFailedEmail(_params: {
  userName?: string
  amountDue: number
  lastFourDigits?: string
  billingPortalUrl: string
  failureReason?: string
}): Promise<string> {
  return ''
}

export async function renderCareersConfirmationEmail(
  _name: string,
  _position: string
): Promise<string> {
  return ''
}

export async function renderCareersSubmissionEmail(_params: {
  name: string
  email: string
  phone?: string
  position: string
  linkedin?: string
  portfolio?: string
  experience: string
  location: string
  message: string
}): Promise<string> {
  return ''
}
