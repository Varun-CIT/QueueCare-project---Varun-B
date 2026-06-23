'use client';

import { motion } from 'framer-motion';
import { Clock, Users, AlertCircle } from 'lucide-react';

interface Queue {
  id: string;
  name: string;
  patients: number;
  avgWaitTime: number;
  status: 'active' | 'idle' | 'busy';
  priority: number;
}

const queues: Queue[] = [
  { id: '1', name: 'Emergency', patients: 8, avgWaitTime: 12, status: 'busy', priority: 1 },
  { id: '2', name: 'General Consultation', patients: 24, avgWaitTime: 45, status: 'active', priority: 2 },
  { id: '3', name: 'Dental', patients: 5, avgWaitTime: 20, status: 'active', priority: 3 },
  { id: '4', name: 'Lab Work', patients: 12, avgWaitTime: 30, status: 'active', priority: 4 },
];

const statusColors = {
  busy: 'bg-error/10 text-error border-error/20',
  active: 'bg-status-active/10 text-status-active border-status-active/20',
  idle: 'bg-muted/50 text-muted-foreground border-border',
};

const statusDots = {
  busy: 'bg-error',
  active: 'bg-status-active',
  idle: 'bg-muted-foreground',
};

export function QueueStatus() {
  return (
    <motion.div
      className="bg-white border border-border rounded-2xl p-6 shadow-premium"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-foreground">Queue Status</h2>
        <motion.button
          className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-semibold hover:bg-primary/20 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          View All
        </motion.button>
      </div>

      <div className="space-y-3">
        {queues.map((queue, index) => (
          <motion.div
            key={queue.id}
            className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-secondary/50 transition-all duration-200"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
            whileHover={{ x: 4 }}
          >
            <div className="flex items-center gap-4 flex-1">
              <div
                className={`w-3 h-3 rounded-full ${statusDots[queue.status]} animate-pulse`}
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground">
                  {queue.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {queue.patients} patients waiting
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">
                  {queue.avgWaitTime}m
                </span>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  statusColors[queue.status]
                }`}
              >
                {queue.status === 'busy'
                  ? 'High Volume'
                  : queue.status === 'active'
                    ? 'Active'
                    : 'Idle'}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Alert Banner */}
      <motion.div
        className="mt-6 p-4 rounded-xl bg-warning/10 border border-warning/20 flex items-start gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-warning">High Wait Time</p>
          <p className="text-xs text-warning/80">
            General Consultation queue exceeds target wait time. Consider adding staff.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
