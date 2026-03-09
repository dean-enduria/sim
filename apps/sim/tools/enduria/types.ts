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
}

export interface EnduriaCreateIncidentResponse extends ToolResponse {
  output: {
    incident: Record<string, any>
    metadata: {
      incidentId: string
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

// Get Asset
export interface EnduriaGetAssetParams extends EnduriaBaseParams {
  assetId: string
}

export interface EnduriaGetAssetResponse extends ToolResponse {
  output: {
    asset: Record<string, any>
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
