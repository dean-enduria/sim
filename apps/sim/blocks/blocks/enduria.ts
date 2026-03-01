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
        { label: 'Get Asset', id: 'enduria_get_asset' },
      ],
      value: () => 'enduria_create_ticket',
    },
    // API URL
    {
      id: 'apiUrl',
      title: 'API URL',
      type: 'short-input',
      placeholder: 'https://your-enduria-instance.com',
      required: true,
      description: 'Enduria API base URL (ENDURIA_API_URL)',
    },
    // API Secret
    {
      id: 'apiSecret',
      title: 'API Secret',
      type: 'short-input',
      placeholder: 'Enter INTERNAL_API_SECRET',
      password: true,
      required: true,
      description: 'Internal API secret for service-to-service auth',
    },
    // Org ID
    {
      id: 'orgId',
      title: 'Organization ID',
      type: 'short-input',
      placeholder: 'Enter organization ID',
      required: true,
      description: 'Organization ID to scope the request',
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
  ],
  tools: {
    access: [
      'enduria_create_ticket',
      'enduria_update_ticket',
      'enduria_get_ticket',
      'enduria_search_knowledge_base',
      'enduria_create_incident',
      'enduria_get_asset',
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
    apiUrl: { type: 'string', description: 'Enduria API base URL' },
    apiSecret: { type: 'string', description: 'Internal API secret' },
    orgId: { type: 'string', description: 'Organization ID' },
    title: { type: 'string', description: 'Title for ticket or incident' },
    description: { type: 'string', description: 'Description for ticket or incident' },
    priority: { type: 'string', description: 'Ticket priority' },
    category: { type: 'string', description: 'Ticket category or KB filter' },
    assignee: { type: 'string', description: 'User to assign ticket to' },
    ticketId: { type: 'string', description: 'Ticket ID' },
    fields: { type: 'json', description: 'Fields to update as JSON' },
    query: { type: 'string', description: 'Search query string' },
    limit: { type: 'number', description: 'Result limit' },
    severity: { type: 'string', description: 'Incident severity' },
    affectedService: { type: 'string', description: 'Affected service name or ID' },
    reportedBy: { type: 'string', description: 'Reporter user ID or email' },
    assetId: { type: 'string', description: 'Asset ID' },
  },
  outputs: {
    ticket: { type: 'json', description: 'Enduria ticket data' },
    incident: { type: 'json', description: 'Enduria incident data' },
    asset: { type: 'json', description: 'Enduria asset data' },
    results: { type: 'json', description: 'Knowledge base search results' },
    metadata: { type: 'json', description: 'Operation metadata' },
  },
}
