'use client';

import React from 'react';
import { DNSRecordType } from '@/types/record';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

interface DynamicRecordFieldsProps {
  type: DNSRecordType;
  value: string;
  onChangeValue: (val: string) => void;
  priority?: number | null;
  onChangePriority?: (val: number | null) => void;
  weight?: number | null;
  onChangeWeight?: (val: number | null) => void;
  port?: number | null;
  onChangePort?: (val: number | null) => void;
  flag?: string | null;
  onChangeFlag?: (val: string | null) => void;
  tag?: string | null;
  onChangeTag?: (val: string | null) => void;
  errors?: Record<string, string>;
}

export function DynamicRecordFields({
  type,
  value,
  onChangeValue,
  priority,
  onChangePriority,
  weight,
  onChangeWeight,
  port,
  onChangePort,
  flag,
  onChangeFlag,
  tag,
  onChangeTag,
  errors = {},
}: DynamicRecordFieldsProps) {
  switch (type) {
    case 'A':
      return (
        <Input
          label="Value / IP Address"
          placeholder="e.g. 192.168.1.10"
          value={value}
          onChange={(e) => onChangeValue(e.target.value)}
          helperText="Enter a valid IPv4 address (e.g. 192.0.2.1)."
          error={errors.value}
          required
        />
      );

    case 'AAAA':
      return (
        <Input
          label="Value / IPv6 Address"
          placeholder="e.g. 2001:0db8:85a3:0000:0000:8a2e:0370:7334"
          value={value}
          onChange={(e) => onChangeValue(e.target.value)}
          helperText="Enter a valid IPv6 address."
          error={errors.value}
          required
        />
      );

    case 'CNAME':
      return (
        <Input
          label="Value / Target Hostname"
          placeholder="e.g. example.com"
          value={value}
          onChange={(e) => onChangeValue(e.target.value)}
          helperText="Enter a fully qualified domain name (e.g. example.com)."
          error={errors.value}
          required
        />
      );

    case 'MX':
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Input
              label="Priority"
              type="number"
              min="0"
              max="65535"
              placeholder="e.g. 10"
              value={priority !== null && priority !== undefined ? priority : ''}
              onChange={(e) =>
                onChangePriority &&
                onChangePriority(e.target.value ? parseInt(e.target.value) : null)
              }
              helperText="0 to 65535 (lower = higher priority)."
              error={errors.priority}
              required
            />
          </div>
          <div className="md:col-span-2">
            <Input
              label="Mail Server Hostname"
              placeholder="e.g. mail.example.com"
              value={value}
              onChange={(e) => onChangeValue(e.target.value)}
              helperText="Enter the mail server hostname."
              error={errors.value}
              required
            />
          </div>
        </div>
      );

    case 'TXT':
      return (
        <div className="flex flex-col gap-1">
          <Input
            label="Value / Text Content"
            placeholder='"v=spf1 include:_spf.google.com ~all"'
            value={value}
            onChange={(e) => onChangeValue(e.target.value)}
            helperText="Enter text record value enclosed in double quotes."
            error={errors.value}
            required
          />
        </div>
      );

    case 'SRV':
      return (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Priority"
              type="number"
              placeholder="e.g. 10"
              value={priority !== null && priority !== undefined ? priority : ''}
              onChange={(e) =>
                onChangePriority &&
                onChangePriority(e.target.value ? parseInt(e.target.value) : null)
              }
              error={errors.priority}
              required
            />
            <Input
              label="Weight"
              type="number"
              placeholder="e.g. 5"
              value={weight !== null && weight !== undefined ? weight : ''}
              onChange={(e) =>
                onChangeWeight &&
                onChangeWeight(e.target.value ? parseInt(e.target.value) : null)
              }
              error={errors.weight}
              required
            />
            <Input
              label="Port"
              type="number"
              placeholder="e.g. 5060"
              value={port !== null && port !== undefined ? port : ''}
              onChange={(e) =>
                onChangePort &&
                onChangePort(e.target.value ? parseInt(e.target.value) : null)
              }
              error={errors.port}
              required
            />
          </div>
          <Input
            label="Target Hostname"
            placeholder="e.g. sip.example.com"
            value={value}
            onChange={(e) => onChangeValue(e.target.value)}
            helperText="Enter target domain name."
            error={errors.value}
            required
          />
        </div>
      );

    case 'CAA':
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Flag"
            value={flag || '0'}
            onChange={(e) => onChangeFlag && onChangeFlag(e.target.value)}
            options={[
              { value: '0', label: '0 (Non-critical)' },
              { value: '128', label: '128 (Critical)' },
            ]}
          />
          <Select
            label="Tag"
            value={tag || 'issue'}
            onChange={(e) => onChangeTag && onChangeTag(e.target.value)}
            options={[
              { value: 'issue', label: 'issue (Authorize CA for domain)' },
              { value: 'issuewild', label: 'issuewild (Authorize wildcard CA)' },
              { value: 'iodef', label: 'iodef (Report URL for violations)' },
            ]}
          />
          <Input
            label="Value / CA Name or URL"
            placeholder='e.g. "letsencrypt.org"'
            value={value}
            onChange={(e) => onChangeValue(e.target.value)}
            error={errors.value}
            required
          />
        </div>
      );

    case 'NS':
    case 'PTR':
    default:
      return (
        <Input
          label="Value"
          placeholder="e.g. ns-123.awsdns-45.com"
          value={value}
          onChange={(e) => onChangeValue(e.target.value)}
          helperText={`Enter the target hostname for ${type} record.`}
          error={errors.value}
          required
        />
      );
  }
}
