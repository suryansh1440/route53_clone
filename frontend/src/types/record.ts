export type DNSRecordType =
  | 'A'
  | 'AAAA'
  | 'CNAME'
  | 'TXT'
  | 'MX'
  | 'NS'
  | 'PTR'
  | 'SRV'
  | 'CAA'
  | 'SOA';

export interface DNSRecord {
  id: number;
  hosted_zone_id: number;
  name: string;
  type: DNSRecordType;
  ttl: number;
  value: string;
  routing_policy: string;
  priority: number | null;
  weight: number | null;
  port: number | null;
  flag: string | null;
  tag: string | null;
  created_at: string;
  updated_at: string;
}

export interface DNSRecordCreateInput {
  name: string;
  type: DNSRecordType;
  ttl: number;
  value: string;
  routing_policy?: string;
  priority?: number | null;
  weight?: number | null;
  port?: number | null;
  flag?: string | null;
  tag?: string | null;
}

export interface DNSRecordUpdateInput {
  name?: string;
  type?: DNSRecordType;
  ttl?: number;
  value?: string;
  routing_policy?: string;
  priority?: number | null;
  weight?: number | null;
  port?: number | null;
  flag?: string | null;
  tag?: string | null;
}
