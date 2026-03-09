import { EnduriaIcon } from '@/components/icons'
import type { BlockConfig } from '@/blocks/types'
import type { EnduriaResponse } from '@/tools/enduria/types'

export const EnduriaBlock: BlockConfig<EnduriaResponse> = {
  type: 'enduria',
  name: 'Enduria',
  description: 'Manage ITSM tickets, incidents, assets, and knowledge base in Enduria',
  longDescription:
    'Integrate Enduria ITSM into your workflow. Create and manage tickets, track incidents, search the knowledge base, and look up IT assets. Authenticated via internal API secret.',
  docsLink: 'https://docs.enduria.io/tools/sim-integration',
  category: 'tools',
  bgColor: '#1E3A5F',
  icon: EnduriaIcon,
  subBlocks: [
    // Operation selector
    {
      id: 'operation',
      title: 'Operation',
      type: 'dropdown',
      options: [
        { label: 'Create Ticket', id: 'enduria_create_ticket' },
        { label: 'Update Ticket', id: 'enduria_update_ticket' },
        { label: 'Get Ticket', id: 'enduria_get_ticket' },
        { label: 'Search Knowledge Base', id: 'enduria_search_knowledge_base' },
        { label: 'Create Incident', id: 'enduria_create_incident' },
        { label: 'List Tickets', id: 'enduria_list_tickets' },
        { label: 'Get Asset', id: 'enduria_get_asset' },
        { label: 'Delete Ticket', id: 'enduria_delete_ticket' },
        { label: 'Add Comment', id: 'enduria_add_comment' },
      ],
      value: () => 'enduria_create_ticket',
    },
    // -- Create Ticket fields --
    {
      id: 'title',
      title: 'Title',
      type: 'short-input',
      placeholder: 'Ticket title',
      condition: {
        field: 'operation',
        value: 'enduria_create_ticket',
      },
      required: true,
    },
    {
      id: 'description',
      title: 'Description',
      type: 'long-input',
      placeholder: 'Detailed description of the ticket',
      condition: {
        field: 'operation',
        value: 'enduria_create_ticket',
      },
      required: true,
    },
    {
      id: 'priority',
      title: 'Priority',
      type: 'dropdown',
      options: [
        { label: 'Low', id: 'low' },
        { label: 'Medium', id: 'medium' },
        { label: 'High', id: 'high' },
        { label: 'Critical', id: 'critical' },
      ],
      condition: {
        field: 'operation',
        value: 'enduria_create_ticket',
      },
    },
    {
      id: 'category',
      title: 'Category',
      type: 'short-input',
      placeholder: 'hardware, software, network, access',
      condition: {
        field: 'operation',
        value: 'enduria_create_ticket',
      },
    },
    {
      id: 'assignee',
      title: 'Assignee',
      type: 'short-input',
      placeholder: 'User ID or email',
      condition: {
        field: 'operation',
        value: 'enduria_create_ticket',
      },
    },

    // -- Update Ticket fields --
    {
      id: 'ticketId',
      title: 'Ticket ID',
      type: 'short-input',
      placeholder: 'Ticket ID to update',
      condition: {
        field: 'operation',
        value: 'enduria_update_ticket',
      },
      required: true,
    },
    {
      id: 'fields',
      title: 'Fields to Update (JSON)',
      type: 'code',
      language: 'json',
      placeholder: '{\n  "status": "in_progress",\n  "priority": "high"\n}',
      condition: {
        field: 'operation',
        value: 'enduria_update_ticket',
      },
      required: true,
    },

    // -- Get Ticket fields --
    {
      id: 'ticketId',
      title: 'Ticket ID',
      type: 'short-input',
      placeholder: 'Ticket ID to retrieve',
      condition: {
        field: 'operation',
        value: 'enduria_get_ticket',
      },
      required: true,
    },

    // -- Search Knowledge Base fields --
    {
      id: 'query',
      title: 'Search Query',
      type: 'short-input',
      placeholder: 'Search for articles...',
      condition: {
        field: 'operation',
        value: 'enduria_search_knowledge_base',
      },
      required: true,
    },
    {
      id: 'limit',
      title: 'Limit',
      type: 'short-input',
      placeholder: '10',
      condition: {
        field: 'operation',
        value: 'enduria_search_knowledge_base',
      },
      mode: 'advanced',
    },
    {
      id: 'category',
      title: 'Category Filter',
      type: 'short-input',
      placeholder: 'Filter by category',
      condition: {
        field: 'operation',
        value: 'enduria_search_knowledge_base',
      },
      mode: 'advanced',
    },

    // -- Create Incident fields --
    {
      id: 'title',
      title: 'Title',
      type: 'short-input',
      placeholder: 'Incident title',
      condition: {
        field: 'operation',
        value: 'enduria_create_incident',
      },
      required: true,
    },
    {
      id: 'description',
      title: 'Description',
      type: 'long-input',
      placeholder: 'Detailed description of the incident',
      condition: {
        field: 'operation',
        value: 'enduria_create_incident',
      },
      required: true,
    },
    {
      id: 'severity',
      title: 'Severity',
      type: 'dropdown',
      options: [
        { label: 'Low', id: 'low' },
        { label: 'Medium', id: 'medium' },
        { label: 'High', id: 'high' },
        { label: 'Critical', id: 'critical' },
      ],
      condition: {
        field: 'operation',
        value: 'enduria_create_incident',
      },
    },
    {
      id: 'affectedService',
      title: 'Affected Service',
      type: 'short-input',
      placeholder: 'Service name or ID',
      condition: {
        field: 'operation',
        value: 'enduria_create_incident',
      },
    },
    {
      id: 'reportedBy',
      title: 'Reported By',
      type: 'short-input',
      placeholder: 'User ID or email',
      condition: {
        field: 'operation',
        value: 'enduria_create_incident',
      },
    },

    // -- List Tickets fields --
    {
      id: 'status',
      title: 'Status Filter',
      type: 'short-input',
      placeholder: 'open, in_progress, resolved, closed',
      condition: { field: 'operation', value: 'enduria_list_tickets' },
    },
    {
      id: 'priority',
      title: 'Priority Filter',
      type: 'short-input',
      placeholder: 'low, medium, high, critical',
      condition: { field: 'operation', value: 'enduria_list_tickets' },
    },
    {
      id: 'assignedTo',
      title: 'Assigned To',
      type: 'short-input',
      placeholder: 'User ID to filter by',
      condition: { field: 'operation', value: 'enduria_list_tickets' },
    },
    {
      id: 'limit',
      title: 'Limit',
      type: 'short-input',
      placeholder: '25',
      condition: { field: 'operation', value: 'enduria_list_tickets' },
      mode: 'advanced',
    },

    // -- Get Asset fields --
    {
      id: 'assetId',
      title: 'Asset ID',
      type: 'short-input',
      placeholder: 'Asset ID to retrieve',
      condition: {
        field: 'operation',
        value: 'enduria_get_asset',
      },
      required: true,
    },

    // -- Delete Ticket fields --
    {
      id: 'ticketId',
      title: 'Ticket ID',
      type: 'short-input',
      placeholder: 'Ticket ID to delete',
      condition: {
        field: 'operation',
        value: 'enduria_delete_ticket',
      },
      required: true,
    },

    // -- Add Comment fields --
    {
      id: 'ticketId',
      title: 'Ticket ID',
      type: 'short-input',
      placeholder: 'Ticket ID to comment on',
      condition: {
        field: 'operation',
        value: 'enduria_add_comment',
      },
      required: true,
    },
    {
      id: 'content',
      title: 'Comment',
      type: 'long-input',
      placeholder: 'Comment content',
      condition: {
        field: 'operation',
        value: 'enduria_add_comment',
      },
      required: true,
    },
    {
      id: 'isInternal',
      title: 'Internal Comment',
      type: 'dropdown',
      options: [
        { label: 'No', id: 'false' },
        { label: 'Yes', id: 'true' },
      ],
      condition: {
        field: 'operation',
        value: 'enduria_add_comment',
      },
    },
  ],
  tools: {
    access: [
      'enduria_create_ticket',
      'enduria_update_ticket',
      'enduria_get_ticket',
      'enduria_search_knowledge_base',
      'enduria_create_incident',
      'enduria_get_asset',
      'enduria_list_tickets',
      'enduria_delete_ticket',
      'enduria_add_comment',
    ],
    config: {
      tool: (params) => params.operation,
      params: (params) => {
        const { operation, fields, ...rest } = params

        // For update ticket, parse the JSON fields
        if (operation === 'enduria_update_ticket' && fields) {
          const parsedFields = typeof fields === 'string' ? JSON.parse(fields) : fields
          return { ...rest, fields: parsedFields }
        }

        return rest
      },
    },
  },
  inputs: {
    operation: { type: 'string', description: 'Operation to perform' },
    title: { type: 'string', description: 'Title for ticket or incident' },
    description: { type: 'string', description: 'Description for ticket or incident' },
    priority: { type: 'string', description: 'Ticket priority' },
    category: { type: 'string', description: 'Ticket category or KB filter' },
    assignee: { type: 'string', description: 'User to assign ticket to' },
    assignedTo: { type: 'string', description: 'Filter by assigned user' },
    ticketId: { type: 'string', description: 'Ticket ID' },
    fields: { type: 'json', description: 'Fields to update as JSON' },
    query: { type: 'string', description: 'Search query string' },
    limit: { type: 'number', description: 'Result limit' },
    severity: { type: 'string', description: 'Incident severity' },
    affectedService: { type: 'string', description: 'Affected service name or ID' },
    reportedBy: { type: 'string', description: 'Reporter user ID or email' },
    assetId: { type: 'string', description: 'Asset ID' },
    content: { type: 'string', description: 'Comment content' },
    isInternal: { type: 'boolean', description: 'Whether comment is internal' },
  },
  outputs: {
    ticket: { type: 'json', description: 'Enduria ticket data' },
    incident: { type: 'json', description: 'Enduria incident data' },
    asset: { type: 'json', description: 'Enduria asset data' },
    tickets: { type: 'json', description: 'Array of Enduria tickets' },
    results: { type: 'json', description: 'Knowledge base search results' },
    comment: { type: 'json', description: 'Enduria ticket comment data' },
    metadata: { type: 'json', description: 'Operation metadata' },
  },
}
