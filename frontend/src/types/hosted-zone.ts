export interface HostedZone {
  id: number;
  zone_id: string;
  name: string;
  type: 'Public' | 'Private';
  comment: string;
  status: 'Active' | 'Inactive';
  name_servers: string; // JSON string array
  record_count: number;
  created_at: string;
  updated_at: string;
}

export interface HostedZoneCreateInput {
  name: string;
  type: 'Public' | 'Private';
  comment?: string;
}

export interface HostedZoneUpdateInput {
  comment?: string;
  status?: 'Active' | 'Inactive';
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}
