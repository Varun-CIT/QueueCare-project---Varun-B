'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { MetricCard } from '@/components/MetricCard';
import { QueueStatus } from '@/components/QueueStatus';
import { motion } from 'framer-motion';
import {
  Users,
  Clock,
  TrendingUp,
  AlertCircle,
  Activity,
  Zap,
} from 'lucide-react';

export default function Page() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back, Dr. Jane
        </h1>
        <p className="text-muted-foreground">
          Here's your healthcare facility overview for today
        </p>
      </motion.div>

      {/* Metrics Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item}>
          <MetricCard
            label="Active Patients"
            value="248"
            change={12}
            trend="up"
            icon={Users}
            color="primary"
          />
        </motion.div>

        <motion.div variants={item}>
          <MetricCard
            label="Avg Wait Time"
            value="32m"
            change={8}
            trend="down"
            icon={Clock}
            color="accent"
          />
        </motion.div>

        <motion.div variants={item}>
          <MetricCard
            label="Queue Efficiency"
            value="94%"
            change={5}
            trend="up"
            icon={TrendingUp}
            color="success"
          />
        </motion.div>

        <motion.div variants={item}>
          <MetricCard
            label="Critical Alerts"
            value="3"
            change={2}
            trend="down"
            icon={AlertCircle}
            color="warning"
          />
        </motion.div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Queue Status */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <QueueStatus />
        </motion.div>

        {/* Right Column - Quick Actions */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          {/* Quick Stats */}
          <div className="bg-white border border-border rounded-2xl p-6 shadow-premium">
            <h3 className="text-lg font-bold text-foreground mb-4">
              Quick Stats
            </h3>
            <div className="space-y-4">
              <div className="flex items-start justify-between pb-4 border-b border-border">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Checked In
                  </p>
                  <p className="text-2xl font-bold text-foreground">156</p>
                </div>
                <Activity className="w-8 h-8 text-primary/40" />
              </div>

              <div className="flex items-start justify-between pb-4 border-b border-border">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    In Progress
                  </p>
                  <p className="text-2xl font-bold text-foreground">42</p>
                </div>
                <Zap className="w-8 h-8 text-accent/40" />
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Completed
                  </p>
                  <p className="text-2xl font-bold text-foreground">210</p>
                </div>
                <Activity className="w-8 h-8 text-status-active/40" />
              </div>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10 rounded-2xl p-6 shadow-premium">
            <h3 className="text-lg font-bold text-foreground mb-4">
              System Health
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">
                    Uptime
                  </span>
                  <span className="text-sm font-bold text-status-active">
                    99.9%
                  </span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-status-active to-primary rounded-full w-[99.9%]" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">
                    Load
                  </span>
                  <span className="text-sm font-bold text-warning">68%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-warning to-accent rounded-full w-[68%]" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">
                    Capacity
                  </span>
                  <span className="text-sm font-bold text-primary">45%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full w-[45%]" />
                </div>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <motion.button
            className="w-full py-4 bg-gradient-to-r from-primary to-accent rounded-xl text-white font-bold text-center transition-all duration-300 shadow-premium hover:shadow-premium-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Generate Daily Report
          </motion.button>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
