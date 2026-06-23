'use client';

import { Search, Bell, Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

const breadcrumbs: Record<string, string> = {
  '/': 'Dashboard',
  '/queue': 'Queue Management',
  '/patients': 'Patients',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
};

export function Header({ onMobileMenuToggle }: { onMobileMenuToggle?: () => void }) {
  const pathname = usePathname();
  const currentPage = breadcrumbs[pathname] || 'Dashboard';
  const [isFocused, setIsFocused] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-border z-40 md:pl-64">
      <div className="flex items-center justify-between h-full px-6 gap-4">
        {/* Left Section - Title and Search */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex flex-col min-w-0">
            <h1 className="text-xl font-bold text-foreground truncate">
              {currentPage}
            </h1>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Right Section - Search, Notifications, Profile */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <motion.div
            className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              isFocused ? 'bg-primary/10 ring-2 ring-primary' : 'bg-secondary'
            }`}
            whileFocus={{ scale: 1.02 }}
          >
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search patients, queues..."
              className="bg-transparent text-sm placeholder-muted-foreground focus:outline-none w-48"
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
          </motion.div>

          {/* Notifications */}
          <motion.button
            className="relative p-2 hover:bg-secondary rounded-lg transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell className="w-5 h-5 text-foreground" />
            <motion.span
              className="absolute top-1 right-1 w-2 h-2 bg-status-active rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.button>

          {/* Profile */}
          <motion.div
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary transition-all duration-200 cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold text-xs">
              JD
            </div>
            <div className="hidden sm:flex flex-col min-w-0">
              <p className="text-xs font-semibold text-foreground">Dr. Jane</p>
              <p className="text-xs text-muted-foreground">Admin</p>
            </div>
          </motion.div>
        </div>
      </div>
    </header>
  );
}
