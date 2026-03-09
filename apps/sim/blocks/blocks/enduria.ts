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
        { label: 'Update Incident', id: 'enduria_update_incident' },
        { label: 'Get Incident', id: 'enduria_get_incident' },
        { label: 'List Incidents', id: 'enduria_list_incidents' },
        { label: 'List Tickets', id: 'enduria_list_tickets' },
        { label: 'Create Change Request', id: 'enduria_create_change_request' },
        { label: 'Update Change Request', id: 'enduria_update_change_request' },
        { label: 'Get Change Request', id: 'enduria_get_change_request' },
        { label: 'List Change Requests', id: 'enduria_list_change_requests' },
        { label: 'Get Asset', id: 'enduria_get_asset' },
        { label: 'List Assets', id: 'enduria_list_assets' },
        { label: 'Update Asset', id: 'enduria_update_asset' },
        { label: 'Get KB Article', id: 'enduria_get_article' },
        { label: 'Delete Ticket', id: 'enduria_delete_ticket' },
        { label: 'Add Comment', id: 'enduria_add_comment' },
        { label: 'Get User', id: 'enduria_get_user' },
        { label: 'List Users', id: 'enduria_list_users' },
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

    // -- Update Incident fields --
    {
      id: 'incidentId',
      title: 'Incident ID',
      type: 'short-input',
      placeholder: 'Incident ID to update',
      condition: {
        field: 'operation',
        value: 'enduria_update_incident',
      },
      required: true,
    },
    {
      id: 'fields',
      title: 'Fields to Update (JSON)',
      type: 'code',
      language: 'json',
      placeholder: '{\n  "status": "resolved",\n  "severity": "low"\n}',
      condition: {
        field: 'operation',
        value: 'enduria_update_incident',
      },
      required: true,
    },

    // -- Get Incident fields --
    {
      id: 'incidentId',
      title: 'Incident ID',
      type: 'short-input',
      placeholder: 'Incident ID to retrieve',
      condition: {
        field: 'operation',
        value: 'enduria_get_incident',
      },
      required: true,
    },

    // -- List Incidents fields --
    {
      id: 'severity',
      title: 'Severity Filter',
      type: 'dropdown',
      options: [
        { label: 'All', id: '' },
        { label: 'Low', id: 'low' },
        { label: 'Medium', id: 'medium' },
        { label: 'High', id: 'high' },
        { label: 'Critical', id: 'critical' },
      ],
      condition: { field: 'operation', value: 'enduria_list_incidents' },
    },
    {
      id: 'status',
      title: 'Status Filter',
      type: 'short-input',
      placeholder: 'open, investigating, resolved, closed',
      condition: { field: 'operation', value: 'enduria_list_incidents' },
    },
    {
      id: 'limit',
      title: 'Limit',
      type: 'short-input',
      placeholder: '25',
      condition: { field: 'operation', value: 'enduria_list_incidents' },
      mode: 'advanced',
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

    // -- Create Change Request fields --
    {
      id: 'title',
      title: 'Title',
      type: 'short-input',
      placeholder: 'Change request title',
      condition: {
        field: 'operation',
        value: 'enduria_create_change_request',
      },
      required: true,
    },
    {
      id: 'description',
      title: 'Description',
      type: 'long-input',
      placeholder: 'Detailed description of the change request',
      condition: {
        field: 'operation',
        value: 'enduria_create_change_request',
      },
      required: true,
    },
    {
      id: 'changeType',
      title: 'Change Type',
      type: 'dropdown',
      options: [
        { label: 'Normal', id: 'normal' },
        { label: 'Standard', id: 'standard' },
        { label: 'Emergency', id: 'emergency' },
      ],
      condition: {
        field: 'operation',
        value: 'enduria_create_change_request',
      },
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
        value: 'enduria_create_change_request',
      },
    },
    {
      id: 'riskLevel',
      title: 'Risk Level',
      type: 'dropdown',
      options: [
        { label: 'Low', id: 'low' },
        { label: 'Medium', id: 'medium' },
        { label: 'High', id: 'high' },
      ],
      condition: {
        field: 'operation',
        value: 'enduria_create_change_request',
      },
    },

    // -- Update Change Request fields --
    {
      id: 'changeRequestId',
      title: 'Change Request ID',
      type: 'short-input',
      placeholder: 'Change request ID to update',
      condition: {
        field: 'operation',
        value: 'enduria_update_change_request',
      },
      required: true,
    },
    {
      id: 'fields',
      title: 'Fields to Update (JSON)',
      type: 'code',
      language: 'json',
      placeholder: '{\n  "status": "approved",\n  "riskLevel": "low"\n}',
      condition: {
        field: 'operation',
        value: 'enduria_update_change_request',
      },
      required: true,
    },

    // -- Get Change Request fields --
    {
      id: 'changeRequestId',
      title: 'Change Request ID',
      type: 'short-input',
      placeholder: 'Change request ID to retrieve',
      condition: {
        field: 'operation',
        value: 'enduria_get_change_request',
      },
      required: true,
    },

    // -- List Change Requests fields --
    {
      id: 'status',
      title: 'Status Filter',
      type: 'short-input',
      placeholder: 'draft, submitted, approved, implemented, closed',
      condition: { field: 'operation', value: 'enduria_list_change_requests' },
    },
    {
      id: 'priority',
      title: 'Priority Filter',
      type: 'short-input',
      placeholder: 'low, medium, high, critical',
      condition: { field: 'operation', value: 'enduria_list_change_requests' },
    },
    {
      id: 'limit',
      title: 'Limit',
      type: 'short-input',
      placeholder: '25',
      condition: { field: 'operation', value: 'enduria_list_change_requests' },
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

    // -- List Assets fields --
    {
      id: 'category',
      title: 'Category Filter',
      type: 'short-input',
      placeholder: 'hardware, software, network',
      condition: { field: 'operation', value: 'enduria_list_assets' },
    },
    {
      id: 'status',
      title: 'Status Filter',
      type: 'short-input',
      placeholder: 'active, retired, maintenance',
      condition: { field: 'operation', value: 'enduria_list_assets' },
    },
    {
      id: 'assignedTo',
      title: 'Assigned To',
      type: 'short-input',
      placeholder: 'User ID to filter by',
      condition: { field: 'operation', value: 'enduria_list_assets' },
    },
    {
      id: 'search',
      title: 'Search',
      type: 'short-input',
      placeholder: 'Search term',
      condition: { field: 'operation', value: 'enduria_list_assets' },
    },
    {
      id: 'limit',
      title: 'Limit',
      type: 'short-input',
      placeholder: '25',
      condition: { field: 'operation', value: 'enduria_list_assets' },
      mode: 'advanced',
    },

    // -- Update Asset fields --
    {
      id: 'assetId',
      title: 'Asset ID',
      type: 'short-input',
      placeholder: 'Asset ID to update',
      condition: {
        field: 'operation',
        value: 'enduria_update_asset',
      },
      required: true,
    },
    {
      id: 'fields',
      title: 'Fields to Update (JSON)',
      type: 'code',
      language: 'json',
      placeholder: '{\n  "status": "retired",\n  "assignedTo": "user123"\n}',
      condition: {
        field: 'operation',
        value: 'enduria_update_asset',
      },
      required: true,
    },

    // -- Get KB Article fields --
    {
      id: 'articleId',
      title: 'Article ID',
      type: 'short-input',
      placeholder: 'Knowledge base article ID',
      condition: {
        field: 'operation',
        value: 'enduria_get_article',
      },
      required: true,
    },

    // -- Get User fields --
    {
      id: 'lookupUserId',
      title: 'User ID',
      type: 'short-input',
      placeholder: 'User ID to retrieve',
      condition: {
        field: 'operation',
        value: 'enduria_get_user',
      },
      required: true,
    },

    // -- List Users fields --
    {
      id: 'role',
      title: 'Role Filter',
      type: 'short-input',
      placeholder: 'admin, agent, user',
      condition: { field: 'operation', value: 'enduria_list_users' },
    },
    {
      id: 'isActive',
      title: 'Active Status',
      type: 'dropdown',
      options: [
        { label: 'All', id: '' },
        { label: 'Active', id: 'true' },
        { label: 'Inactive', id: 'false' },
      ],
      condition: { field: 'operation', value: 'enduria_list_users' },
    },
    {
      id: 'search',
      title: 'Search',
      type: 'short-input',
      placeholder: 'Search by name or email',
      condition: { field: 'operation', value: 'enduria_list_users' },
    },
    {
      id: 'limit',
      title: 'Limit',
      type: 'short-input',
      placeholder: '25',
      condition: { field: 'operation', value: 'enduria_list_users' },
      mode: 'advanced',
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
      'enduria_update_incident',
      'enduria_get_incident',
      'enduria_list_incidents',
      'enduria_create_change_request',
      'enduria_update_change_request',
      'enduria_get_change_request',
      'enduria_list_change_requests',
      'enduria_get_asset',
      'enduria_list_assets',
      'enduria_update_asset',
      'enduria_get_article',
      'enduria_list_tickets',
      'enduria_delete_ticket',
      'enduria_add_comment',
      'enduria_get_user',
      'enduria_list_users',
    ],
    config: {
      tool: (params) => params.operation,
      params: (params) => {
        const { operation, fields, lookupUserId, ...rest } = params

        // For update ticket/incident, parse the JSON fields
        if ((operation === 'enduria_update_ticket' || operation === 'enduria_update_incident' || operation === 'enduria_update_change_request' || operation === 'enduria_update_asset') && fields) {
          const parsedFields = typeof fields === 'string' ? JSON.parse(fields) : fields
          return { ...rest, fields: parsedFields }
        }

        // Map lookupUserId to userId for get_user operation
        if (operation === 'enduria_get_user' && lookupUserId) {
          return { ...rest, userId: lookupUserId }
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
    incidentId: { type: 'string', description: 'Incident ID' },
    changeRequestId: { type: 'string', description: 'Change request ID' },
    changeType: { type: 'string', description: 'Change type (normal, standard, emergency)' },
    riskLevel: { type: 'string', description: 'Risk level (low, medium, high)' },
    fields: { type: 'json', description: 'Fields to update as JSON' },
    query: { type: 'string', description: 'Search query string' },
    limit: { type: 'number', description: 'Result limit' },
    severity: { type: 'string', description: 'Incident severity' },
    affectedService: { type: 'string', description: 'Affected service name or ID' },
    reportedBy: { type: 'string', description: 'Reporter user ID or email' },
    assetId: { type: 'string', description: 'Asset ID' },
    articleId: { type: 'string', description: 'Knowledge base article ID' },
    search: { type: 'string', description: 'Search term for filtering' },
    content: { type: 'string', description: 'Comment content' },
    isInternal: { type: 'boolean', description: 'Whether comment is internal' },
    lookupUserId: { type: 'string', description: 'User ID to look up' },
    role: { type: 'string', description: 'User role filter' },
    isActive: { type: 'string', description: 'Active status filter' },
  },
  outputs: {
    ticket: { type: 'json', description: 'Enduria ticket data' },
    incident: { type: 'json', description: 'Enduria incident data' },
    asset: { type: 'json', description: 'Enduria asset data' },
    tickets: { type: 'json', description: 'Array of Enduria tickets' },
    incidents: { type: 'json', description: 'Array of Enduria incidents' },
    changeRequest: { type: 'json', description: 'Enduria change request data' },
    changeRequests: { type: 'json', description: 'Array of Enduria change requests' },
    assets: { type: 'json', description: 'Array of Enduria assets' },
    article: { type: 'json', description: 'Enduria knowledge base article' },
    results: { type: 'json', description: 'Knowledge base search results' },
    comment: { type: 'json', description: 'Enduria ticket comment data' },
    user: { type: 'json', description: 'Enduria user data' },
    users: { type: 'json', description: 'Array of Enduria users' },
    metadata: { type: 'json', description: 'Operation metadata' },
  },
}
