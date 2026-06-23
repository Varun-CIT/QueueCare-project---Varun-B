'use client';

import { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { Calendar, Download, Loader2, Users, CheckCircle, Clock, Hourglass } from 'lucide-react';

// Import live backend utilities
import { patientService } from '@/lib/patientService';
import { socket } from '@/lib/socket';

interface Patient {
  id: string;
  token: string;
  name: string;
  status: 'serving' | 'waiting' | 'completed';
  joinedAt: string;
  updatedAt: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
}

interface BackendPatient {
  token: string;
  name: string;
  status: string;
  joinedAt: string;
  updatedAt: string;
  priority?: 'low' | 'normal' | 'high' | 'critical';
}

export default function AnalyticsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Real-Time Data Stream
  const loadPatients = async () => {
    try {
      const response = await patientService.getPatients();
      const mapped: Patient[] = response.patients.map((p: BackendPatient) => ({
        id: p.token,
        token: p.token,
        name: p.name,
        status:
          p.status === 'Consulting'
            ? 'serving'
            : p.status === 'Completed'
            ? 'completed'
            : 'waiting',
        joinedAt: p.joinedAt,
        updatedAt: p.updatedAt,
        priority: p.priority || 'normal',
      }));
      setPatients(mapped);
    } catch (err) {
      console.error('Failed to update analytics stream:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
    socket.on('queueUpdated', loadPatients);

    return () => {
      socket.off('queueUpdated', loadPatients);
    };
  }, []);

  // 2. Compute Metrics On the Fly
  const metrics = useMemo(() => {
    const total = patients.length;
    const waiting = patients.filter((p) => p.status === 'waiting').length;
    const serving = patients.filter((p) => p.status === 'serving').length;
    const completed = patients.filter((p) => p.status === 'completed').length;

    // Completion Rate
    const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : '0.0';

    // Average Consultation Time (Diff between joinedAt/updatedAt for completed ones, fallback to 15m)
    let totalConsultationTime = 0;
    let completedWithTime = 0;

    patients.forEach((p) => {
      if (p.status === 'completed' && p.updatedAt && p.joinedAt) {
        const duration = (new Date(p.updatedAt).getTime() - new Date(p.joinedAt).getTime()) / 60000;
        if (duration > 0) {
          totalConsultationTime += duration;
          completedWithTime++;
        }
      }
    });

    const avgConsultation = completedWithTime > 0 
      ? `${Math.round(totalConsultationTime / completedWithTime)} mins` 
      : '15 mins';

    // Priority Distribution Breakdown
    const priorityCounts = { critical: 0, high: 0, normal: 0, low: 0 };
    patients.forEach((p) => {
      if (priorityCounts[p.priority] !== undefined) {
        priorityCounts[p.priority]++;
      }
    });

    const totalPriority = total || 1;
    const priorityDistribution = [
      { name: 'Critical Priority', value: Math.round((priorityCounts.critical / totalPriority) * 100), color: 'from-red-500 to-orange-500' },
      { name: 'High Priority', value: Math.round((priorityCounts.high / totalPriority) * 100), color: 'from-orange-500 to-yellow-500' },
      { name: 'Normal Priority', value: Math.round((priorityCounts.normal / totalPriority) * 100), color: 'from-blue-500 to-indigo-500' },
      { name: 'Routine Checkup', value: Math.round((priorityCounts.low / totalPriority) * 100), color: 'from-slate-400 to-slate-500' },
    ];

    return {
      total,
      waiting,
      serving,
      completed,
      completionRate,
      avgConsultation,
      priorityDistribution,
    };
  }, [patients]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Clinic Performance Dashboard
            </h1>
            <p className="text-muted-foreground">
              Live service status and real-time operational capacity
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-border rounded-lg font-semibold shadow-sm hover:bg-slate-50 transition-all text-sm"
          >
            <Download className="w-4 h-4" />
            Print Status
          </button>
        </div>
      </motion.div>

      {/* Real-time Dynamic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Registrations', value: metrics.total, sub: 'Today overall', icon: Users, color: 'text-blue-600' },
          { label: 'Active Queue Loading', value: metrics.waiting, sub: 'Patients waiting', icon: Hourglass, color: 'text-amber-500' },
          { label: 'Completion Rate', value: `${metrics.completionRate}%`, sub: 'Of total patients', icon: CheckCircle, color: 'text-emerald-500' },
          { label: 'Avg Consultation Time', value: metrics.avgConsultation, sub: 'Calculated resolution', icon: Clock, color: 'text-indigo-500' },
        ].map((m, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white border border-border rounded-2xl p-6 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{m.label}</p>
              <h3 className="text-3xl font-bold text-foreground mb-1">{m.value}</h3>
              <p className="text-xs text-muted-foreground">{m.sub}</p>
            </div>
            <div className={`p-3 bg-slate-50 rounded-xl ${m.color}`}>
              <m.icon className="w-6 h-6" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Dynamic Queue Distribution Status Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-border rounded-2xl p-6 shadow-sm"
        >
          <h3 className="text-lg font-bold text-foreground mb-2">Live Queue State Comparison</h3>
          <p className="text-xs text-muted-foreground mb-6">Current volume ratio across lifecycle states</p>
          
          <div className="h-56 flex items-end justify-center gap-8 px-4 pt-4 border-b border-slate-100">
            {[
              { label: 'Waiting', count: metrics.waiting, color: 'bg-amber-500' },
              { label: 'Consulting', count: metrics.serving, color: 'bg-blue-600' },
              { label: 'Completed', count: metrics.completed, color: 'bg-emerald-500' },
            ].map((bar, idx) => {
              const maxCount = Math.max(metrics.waiting, metrics.serving, metrics.completed, 1);
              const heightPct = (bar.count / maxCount) * 100;
              
              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  <span className="text-xs font-bold mb-2 text-slate-700">{bar.count}</span>
                  <motion.div
                    className={`w-full rounded-t-lg ${bar.color}`}
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPct || 5}%` }} // Minimal height for visibility if 0
                    transition={{ type: 'spring', damping: 20 }}
                  />
                  <span className="text-xs font-medium text-muted-foreground mt-2 pt-2 whitespace-nowrap">{bar.label}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Dynamic Priority Triage Spectrum */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-border rounded-2xl p-6 shadow-sm"
        >
          <h3 className="text-lg font-bold text-foreground mb-2">Patient Triage Breakdown</h3>
          <p className="text-xs text-muted-foreground mb-6">Live allocation of caseload grouped by priority tags</p>
          
          <div className="space-y-5">
            {metrics.priorityDistribution.map((dept, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-foreground">{dept.name}</span>
                  <span className="text-sm font-bold text-slate-700">{patients.length ? `${dept.value}%` : '0%'}</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${dept.color} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: patients.length ? `${dept.value}%` : '0%' }}
                    transition={{ duration: 0.6, delay: idx * 0.05 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}