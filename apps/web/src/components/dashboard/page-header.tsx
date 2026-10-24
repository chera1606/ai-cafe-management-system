"use client";

import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  children?: React.ReactNode; // Tabs or filter bar
}

export function PageHeader({
  title,
  description,
  badge,
  action,
  children,
}: PageHeaderProps) {
  return (
    <div className="space-y-4 pb-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black font-display text-forest dark:text-white tracking-tight">
              {title}
            </h1>
            {badge}
          </div>
          {description && (
            <p className="text-xs text-sage dark:text-stone-400 mt-1 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
      </div>

      {children && <div className="pt-1">{children}</div>}
    </div>
  );
}
