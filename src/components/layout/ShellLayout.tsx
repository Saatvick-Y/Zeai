'use client';

import React, { useState } from 'react';
import { LeftNavRail } from './LeftNavRail';
import { TopCommandHud } from './TopCommandHud';

export const ShellLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-industrial-950 font-sans">
      {/* Collapsible Left Nav Rail */}
      <LeftNavRail isCollapsed={isCollapsed} onToggleCollapse={() => setIsCollapsed(!isCollapsed)} />

      {/* Main Content Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <TopCommandHud />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5 bg-industrial-950/60">
          <div className="max-w-[1680px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
