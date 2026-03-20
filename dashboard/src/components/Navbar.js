"use client";

import React from 'react';
import { LogOut } from "lucide-react";
import NotificationCenter from './NotificationCenter';

export default function Navbar() {
  return (
    <header className="h-[56px] bg-white sticky top-0 border-b border-slate-100 px-8 flex items-center justify-end z-40 gap-2">
      <NotificationCenter />
      <a
        href="/api/auth/logout"
        className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
        title="Logout"
      >
        <LogOut size={18} />
      </a>
    </header>
  );
}
