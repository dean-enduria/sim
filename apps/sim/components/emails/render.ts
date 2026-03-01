import { render } from '@react-email/components'
import { OTPVerificationEmail, ResetPasswordEmail, WelcomeEmail } from '@/components/emails/auth'
import {
  BatchInvitationEmail,
  InvitationEmail,
  PollingGroupInvitationEmail,
  WorkspaceInvitationEmail,
} from '@/components/emails/invitations'
import {
  WorkflowNotificationEmail,
  type WorkflowNotificationEmailProps,
} from '@/components/emails/notifications'
import { HelpConfirmationEmail } from '@/components/emails/support'

export type { EmailSubjectType } from './subjects'
export { getEmailSubject } from './subjects'

interface WorkspaceInvitation {
  workspaceId: string
  workspaceName: string
  permission: 'admin' | 'write' | 'read'
}

export async function renderOTPEmail(
  otp: string,
  email: string,
  type: 'sign-in' | 'email-verification' | 'forget-password' = 'email-verification',
  chatTitle?: string
): Promise<string> {
  return await render(OTPVerificationEmail({ otp, email, type, chatTitle }))
}

export async function renderPasswordResetEmail(
  username: string,
  resetLink: string
): Promise<string> {
  return await render(ResetPasswordEmail({ username, resetLink }))
}

export async function renderInvitationEmail(
  inviterName: string,
  organizationName: string,
  invitationUrl: string
): Promise<string> {
  return await render(
    InvitationEmail({
      inviterName,
      organizationName,
      inviteLink: invitationUrl,
    })
  )
}

export async function renderBatchInvitationEmail(
  inviterName: string,
  organizationName: string,
  organizationRole: 'admin' | 'member',
  workspaceInvitations: WorkspaceInvitation[],
  acceptUrl: string
): Promise<string> {
  return await render(
    BatchInvitationEmail({
      inviterName,
      organizationName,
      organizationRole,
      workspaceInvitations,
      acceptUrl,
    })
  )
}

export async function renderHelpConfirmationEmail(
  type: 'bug' | 'feedback' | 'feature_request' | 'other',
  attachmentCount = 0
): Promise<string> {
  return await render(
    HelpConfirmationEmail({
      type,
      attachmentCount,
      submittedDate: new Date(),
    })
  )
}

export async function renderWelcomeEmail(userName?: string): Promise<string> {
  return await render(WelcomeEmail({ userName }))
}

export async function renderWorkspaceInvitationEmail(
  inviterName: string,
  workspaceName: string,
  invitationLink: string
): Promise<string> {
  return await render(
    WorkspaceInvitationEmail({
      inviterName,
      workspaceName,
      invitationLink,
    })
  )
}

export async function renderPollingGroupInvitationEmail(params: {
  inviterName: string
  organizationName: string
  pollingGroupName: string
  provider: 'google-email' | 'outlook'
  inviteLink: string
}): Promise<string> {
  return await render(
    PollingGroupInvitationEmail({
      inviterName: params.inviterName,
      organizationName: params.organizationName,
      pollingGroupName: params.pollingGroupName,
      provider: params.provider,
      inviteLink: params.inviteLink,
    })
  )
}

export async function renderWorkflowNotificationEmail(
  params: WorkflowNotificationEmailProps
): Promise<string> {
  return await render(WorkflowNotificationEmail(params))
}

// Billing email render functions - stubbed out (billing handled by Enduria)
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

// Careers email render functions - stubbed out (careers handled by Enduria)
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
