import React from 'react';
import { IssuePriority, IssueStatus, Role } from '../../types';
import { getPriorityBadgeStyle, getStatusBadgeStyle } from '../../lib/utils';

export const StatusBadge: React.FC<{ status: IssueStatus; className?: string }> = ({ status, className = '' }) => {
  const style = getStatusBadgeStyle(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${style.bg} ${style.text} ${style.border} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot} animate-pulse`} />
      {status}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: IssuePriority; showScore?: number; className?: string }> = ({
  priority,
  showScore,
  className = '',
}) => {
  const style = getPriorityBadgeStyle(priority);
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold border ${style.bg} ${style.text} ${style.border} ${className}`}
    >
      <span>{priority}</span>
      {typeof showScore === 'number' && (
        <span className="opacity-80 font-mono text-[10px]">({showScore} pts)</span>
      )}
    </span>
  );
};

export const RoleBadge: React.FC<{ role: Role; className?: string }> = ({ role, className = '' }) => {
  const map: Record<Role, { bg: string; text: string; label: string }> = {
    CITIZEN: { bg: 'bg-blue-100 border-blue-300', text: 'text-blue-800', label: 'Citizen' },
    AUTHORITY: { bg: 'bg-indigo-100 border-indigo-300', text: 'text-indigo-800', label: 'Authority (Admin/IAS)' },
    FIELD_WORKER: { bg: 'bg-emerald-100 border-emerald-300', text: 'text-emerald-800', label: 'Field Officer' },
    ADMIN: { bg: 'bg-purple-100 border-purple-300', text: 'text-purple-800', label: 'Super Admin' },
  };
  const config = map[role] || map.CITIZEN;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded border text-[11px] font-bold uppercase tracking-wider ${config.bg} ${config.text} ${className}`}
    >
      {config.label}
    </span>
  );
};
