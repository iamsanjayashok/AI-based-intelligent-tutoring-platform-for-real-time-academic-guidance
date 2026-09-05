import React from 'react';
import Sidebar from './Sidebar';

export default function Layout({ children, activeTab, setActiveTab, onCreateNew }) {
  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onCreateNew={onCreateNew} />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
