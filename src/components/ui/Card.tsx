import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  badge?: React.ReactNode;
  footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  header,
  badge,
  footer,
  ...props
}) => {
  return (
    <div
      className={cn(
        'bg-industrial-900/90 border border-industrial-700/60 rounded-lg shadow-panel backdrop-blur-sm overflow-hidden flex flex-col',
        className
      )}
      {...props}
    >
      {(header || badge) && (
        <div className="px-4 py-3 border-b border-industrial-800/90 flex items-center justify-between bg-industrial-950/40">
          <div className="text-sm font-semibold text-industrial-100 tracking-wide font-sans">{header}</div>
          {badge && <div>{badge}</div>}
        </div>
      )}
      <div className="p-4 flex-1">{children}</div>
      {footer && (
        <div className="px-4 py-2.5 border-t border-industrial-800/90 bg-industrial-950/30 text-xs font-mono text-industrial-400">
          {footer}
        </div>
      )}
    </div>
  );
};
