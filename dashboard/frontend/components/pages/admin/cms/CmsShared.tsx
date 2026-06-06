import type React from 'react';
import type { CmsStatus } from '@/lib/cms/types';
import { CMS_STATUS_LABEL } from '@/lib/cms/types';
import { cn } from '@/lib/utils';
import { MediaPicker } from '@/components/pages/admin/site-content/MediaPicker';

export function cmsStatusBadge(status: CmsStatus) {
  return cn(
    'inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide',
    status === 'active' && 'bg-green-500/10 text-green-600',
    status === 'draft' && 'bg-muted text-muted-foreground',
  );
}

export function cmsStatusLabel(status: CmsStatus): string {
  return CMS_STATUS_LABEL[status];
}

export function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-1.5 block text-sm font-semibold text-foreground">
      {children}
      {required ? <span className="text-destructive"> *</span> : null}
    </label>
  );
}

export function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h2 className="mb-5 flex items-center gap-2 text-lg font-bold font-heading">
        <Icon size={18} className="text-muted-foreground" aria-hidden />
        {title}
      </h2>
      {children}
    </section>
  );
}

export function FeatureImageField({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const displayValue = value.startsWith('data:') ? '' : value;

  return (
    <MediaPicker
      label="Feature image"
      value={displayValue}
      onChange={onChange}
    />
  );
}
