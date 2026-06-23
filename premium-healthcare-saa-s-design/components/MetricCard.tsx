'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  color?: 'primary' | 'accent' | 'success' | 'warning' | 'error';
  trend?: 'up' | 'down';
}

const colorMap = {
  primary: 'from-primary/20 to-primary/10',
  accent: 'from-accent/20 to-accent/10',
  success: 'from-status-active/20 to-status-active/10',
  warning: 'from-warning/20 to-warning/10',
  error: 'from-error/20 to-error/10',
};

const iconColorMap = {
  primary: 'text-primary',
  accent: 'text-accent',
  success: 'text-status-active',
  warning: 'text-warning',
  error: 'text-error',
};

export function MetricCard({
  label,
  value,
  change,
  icon: Icon,
  color = 'primary',
  trend,
}: MetricCardProps) {
  return (
    <motion.div
      className="bg-white border border-border rounded-2xl p-6 shadow-premium hover:shadow-premium-lg transition-all duration-300"
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-2">
            {label}
          </p>
          <p className="text-3xl font-bold text-foreground mb-3">{value}</p>

          {change !== undefined && (
            <div className="flex items-center gap-1">
              {trend === 'up' ? (
                <ArrowUpRight className="w-4 h-4 text-status-active" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-error" />
              )}
              <span
                className={`text-xs font-semibold ${
                  trend === 'up' ? 'text-status-active' : 'text-error'
                }`}
              >
                {Math.abs(change)}% vs last week
              </span>
            </div>
          )}
        </div>

        <motion.div
          className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center`}
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          <Icon className={`w-7 h-7 ${iconColorMap[color]}`} />
        </motion.div>
      </div>
    </motion.div>
  );
}
