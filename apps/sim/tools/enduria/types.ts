import type { ToolResponse } from '@/tools/types'

// Base params shared by all Enduria tools
export interface EnduriaBaseParams {
  apiUrl: string
  apiSecret: string
  orgId: string
}

// Create Ticket
export interface EnduriaCreateTicketParams extends EnduriaBaseParams {
  title: string
  description: string
  priority?: string
  category?: string
  assignee?: string
}

export interface EnduriaCreateTicketResponse extends ToolResponse {
  output: {
    ticket: Record<string, any>
    metadata: {
      ticketId: string
    }
  }
}

// Update Ticket
export interface EnduriaUpdateTicketParams extends EnduriaBaseParams {
  ticketId: string
  fields: Record<string, any>
}

export interface EnduriaUpdateTicketResponse extends ToolResponse {
  output: {
    ticket: Record<string, any>
    metadata: {
      ticketId: string
      updatedFields: string[]
    }
  }
}

// Get Ticket
export interface EnduriaGetTicketParams extends EnduriaBaseParams {
  ticketId: string
}

export interface EnduriaGetTicketResponse extends ToolResponse {
  output: {
    ticket: Record<string, any>
  }
}

// Search Knowledge Base
export interface EnduriaSearchKBParams extends EnduriaBaseParams {
  query: string
  limit?: number
  category?: string
}

export interface EnduriaSearchKBResponse extends ToolResponse {
  output: {
    results: Record<string, any>[]
    metadata: {
      resultCount: number
    }
  }
}

// Create Incident
export interface EnduriaCreateIncidentParams extends EnduriaBaseParams {
  title: string
  description: string
  severity?: string
  affectedService?: string
  reportedBy?: string
  impact?: string
  urgency?: string
}

export interface EnduriaCreateIncidentResponse extends ToolResponse {
  output: {
    incident: Record<string, any>
    metadata: {
      incidentId: string
    }
  }
}

// Update Incident
export interface EnduriaUpdateIncidentParams extends EnduriaBaseParams {
  incidentId: string
  fields: Record<string, any>
}

export interface EnduriaUpdateIncidentResponse extends ToolResponse {
  output: {
    incident: Record<string, any>
    metadata: {
      incidentId: string
      updatedFields: string[]
    }
  }
}

// Get Incident
export interface EnduriaGetIncidentParams extends EnduriaBaseParams {
  incidentId: string
}

export interface EnduriaGetIncidentResponse extends ToolResponse {
  output: {
    incident: Record<string, any>
  }
}

// List Incidents
export interface EnduriaListIncidentsParams extends EnduriaBaseParams {
  severity?: string
  status?: string
  limit?: number
}

export interface EnduriaListIncidentsResponse extends ToolResponse {
  output: {
    incidents: Record<string, any>[]
    metadata: {
      totalCount: number
    }
  }
}

// Create Change Request
export interface EnduriaCreateChangeRequestParams extends EnduriaBaseParams {
  title: string
  description: string
  changeType?: string
  priority?: string
  riskLevel?: string
}

export interface EnduriaCreateChangeRequestResponse extends ToolResponse {
  output: {
    changeRequest: Record<string, any>
    metadata: {
      changeRequestId: string
    }
  }
}

// Update Change Request
export interface EnduriaUpdateChangeRequestParams extends EnduriaBaseParams {
  changeRequestId: string
  fields: Record<string, any>
}

export interface EnduriaUpdateChangeRequestResponse extends ToolResponse {
  output: {
    changeRequest: Record<string, any>
    metadata: {
      changeRequestId: string
      updatedFields: string[]
    }
  }
}

// Get Change Request
export interface EnduriaGetChangeRequestParams extends EnduriaBaseParams {
  changeRequestId: string
}

export interface EnduriaGetChangeRequestResponse extends ToolResponse {
  output: {
    changeRequest: Record<string, any>
  }
}

// List Change Requests
export interface EnduriaListChangeRequestsParams extends EnduriaBaseParams {
  status?: string
  priority?: string
  limit?: number
}

export interface EnduriaListChangeRequestsResponse extends ToolResponse {
  output: {
    changeRequests: Record<string, any>[]
    metadata: {
      totalCount: number
    }
  }
}

// List Tickets
export interface EnduriaListTicketsParams extends EnduriaBaseParams {
  status?: string
  priority?: string
  assignedTo?: string
  limit?: number
}

export interface EnduriaListTicketsResponse extends ToolResponse {
  output: {
    tickets: Record<string, any>[]
    metadata: {
      totalCount: number
    }
  }
}

// Get User
export interface EnduriaGetUserParams extends EnduriaBaseParams {
  userId: string
}

export interface EnduriaGetUserResponse extends ToolResponse {
  output: {
    user: Record<string, any>
  }
}

// List Users
export interface EnduriaListUsersParams extends EnduriaBaseParams {
  role?: string
  isActive?: string
  search?: string
  limit?: number
}

export interface EnduriaListUsersResponse extends ToolResponse {
  output: {
    users: Record<string, any>[]
    metadata: {
      totalCount: number
    }
  }
}

// Get Asset
export interface EnduriaGetAssetParams extends EnduriaBaseParams {
  assetId: string
}

export interface EnduriaGetAssetResponse extends ToolResponse {
  output: {
    asset: Record<string, any>
  }
}

// List Assets
export interface EnduriaListAssetsParams extends EnduriaBaseParams {
  category?: string
  status?: string
  assignedTo?: string
  search?: string
  limit?: number
}

export interface EnduriaListAssetsResponse extends ToolResponse {
  output: {
    assets: Record<string, any>[]
    metadata: {
      totalCount: number
    }
  }
}

// Update Asset
export interface EnduriaUpdateAssetParams extends EnduriaBaseParams {
  assetId: string
  fields: Record<string, any>
}

export interface EnduriaUpdateAssetResponse extends ToolResponse {
  output: {
    asset: Record<string, any>
    metadata: {
      assetId: string
      updatedFields: string[]
    }
  }
}

// Get KB Article
export interface EnduriaGetArticleParams extends EnduriaBaseParams {
  articleId: string
}

export interface EnduriaGetArticleResponse extends ToolResponse {
  output: {
    article: Record<string, any>
  }
}

// Delete Ticket
export interface EnduriaDeleteTicketParams extends EnduriaBaseParams {
  ticketId: string
}

export interface EnduriaDeleteTicketResponse extends ToolResponse {
  output: {
    success: boolean
    metadata: {
      ticketId: string
    }
  }
}

// Add Comment
export interface EnduriaAddCommentParams extends EnduriaBaseParams {
  ticketId: string
  content: string
  isInternal?: boolean | string
}

export interface EnduriaAddCommentResponse extends ToolResponse {
  output: {
    comment: Record<string, any>
    metadata: {
      ticketId: string
      commentId: string
    }
  }
}

export type EnduriaResponse =
  | EnduriaCreateTicketResponse
  | EnduriaUpdateTicketResponse
  | EnduriaGetTicketResponse
  | EnduriaSearchKBResponse
  | EnduriaCreateIncidentResponse
  | EnduriaGetAssetResponse
  | EnduriaListTicketsResponse
  | EnduriaDeleteTicketResponse
  | EnduriaUpdateIncidentResponse
  | EnduriaGetIncidentResponse
  | EnduriaListIncidentsResponse
  | EnduriaAddCommentResponse
  | EnduriaCreateChangeRequestResponse
  | EnduriaUpdateChangeRequestResponse
  | EnduriaGetChangeRequestResponse
  | EnduriaListChangeRequestsResponse
  | EnduriaListAssetsResponse
  | EnduriaUpdateAssetResponse
  | EnduriaGetArticleResponse
  | EnduriaGetUserResponse
  | EnduriaListUsersResponse
