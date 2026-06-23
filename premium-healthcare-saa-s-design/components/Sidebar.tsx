'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Clock,
  BarChart3,
  Settings,
  LogOut,
  Activity,
  Phone,
  Stethoscope,
  Heart,
} from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/doctor', label: 'Doctor', icon: Stethoscope },
  { href: '/reception', label: 'Reception', icon: Phone },
  { href: '/patient-portal', label: 'Patient Portal', icon: Heart },
  { href: '/queue', label: 'Queue Management', icon: Clock },
  { href: '/patients', label: 'Patients', icon: Users },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
];

const bottomItems = [
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 bg-white border-r border-border flex-col fixed h-screen z-50">
      {/* Logo Section */}
      <div className="p-6 border-b border-border">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-premium">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-foreground leading-tight">
              QueueCure
            </span>
            <span className="text-xs text-muted-foreground font-medium">AI</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                className={`relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-foreground hover:bg-secondary'
                }`}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-lg"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 380, damping: 40 }}
                  />
                )}
                <Icon className="w-5 h-5 relative z-10" />
                <span className="font-medium text-sm relative z-10">
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-border space-y-2">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-foreground hover:bg-secondary'
                }`}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}

        {/* User Profile Section */}
        <div className="pt-4 mt-4 border-t border-border">
          <motion.div
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary cursor-pointer transition-all duration-200"
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold text-sm">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                Dr. Jane Doe
              </p>
              <p className="text-xs text-muted-foreground truncate">
                Hospital Admin
              </p>
            </div>
          </motion.div>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-secondary transition-all duration-200 mt-2">
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
