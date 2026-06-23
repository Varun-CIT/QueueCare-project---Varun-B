'use client';

import { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Plus, MoreVertical, Clock, User, Loader2 } from 'lucide-react';

// Import real-time backend infrastructure
import { patientService } from '@/lib/patientService';
import { socket } from '@/lib/socket';

interface Patient {
  id: string;
  name: string;
  priority: 'critical' | 'high' | 'normal' | 'low';
  checkInTime: string;
  estimatedWait: number;
  department: string;
  status: 'waiting' | 'in-progress' | 'completed';
}

interface BackendPatient {
  token: string;
  name: string;
  priority?: 'critical' | 'high' | 'normal' | 'low';
  joinedAt: string;
  estimatedWait?: number;
  doctor?: string;
  status: string;
}

const priorityColors = {
  critical: 'bg-red-50 text-red-700 border-red-200',
  high: 'bg-orange-50 text-orange-700 border-orange-200',
  normal: 'bg-blue-50 text-blue-700 border-blue-200',
  low: 'bg-slate-100 text-slate-700 border-slate-200',
};

const statusColors = {
  waiting: 'bg-amber-50 text-amber-700 border-amber-200',
  'in-progress': 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export default function QueuePage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Load Data from Live API Stream
  const loadPatients = async () => {
    try {
      const response = await patientService.getPatients();
      
      const mapped: Patient[] = response.patients.map((p: BackendPatient) => ({
        id: p.token,
        name: p.name,
        priority: p.priority || 'normal',
        checkInTime: new Date(p.joinedAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        estimatedWait: p.estimatedWait || 15,
        department: p.doctor || 'General Medicine',
        status:
          p.status === 'Consulting'
            ? 'in-progress'
            : p.status === 'Completed'
            ? 'completed'
            : 'waiting',
      }));

      setPatients(mapped);
    } catch (err) {
      console.error('Queue Page sync failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Dynamic Real-Time Socket Lifecycle
  useEffect(() => {
    loadPatients();
    socket.on('queueUpdated', loadPatients);

    return () => {
      socket.off('queueUpdated', loadPatients);
    };
  }, []);

  // 3. Dynamic Client-Side Filters over Live State
  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const matchesSearch = 
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPriority =
        selectedPriority === null || patient.priority === selectedPriority;
        
      return matchesSearch && matchesPriority;
    });
  }, [patients, searchTerm, selectedPriority]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

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
              Queue Management
            </h1>
            <p className="text-muted-foreground">
              {patients.filter(p => p.status !== 'completed').length} active records dynamically synced via Socket.IO
            </p>
          </div>
          <motion.button
            onClick={() => window.dispatchEvent(new CustomEvent('open-add-patient-modal'))}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold shadow-sm hover:brightness-105 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-5 h-5" />
            Add Patient
          </motion.button>
        </div>

        {/* Search */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by patient name or token ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>
      </motion.div>

      {/* Priority Pill Filters */}
      <motion.div
        className="flex gap-2 mb-6 flex-wrap"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {['critical', 'high', 'normal', 'low'].map((priority) => (
          <motion.button
            key={priority}
            onClick={() => setSelectedPriority(selectedPriority === priority ? null : priority)}
            className={`px-4 py-2 rounded-lg font-medium text-sm capitalize transition-all border ${
              selectedPriority === priority
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white border-border hover:bg-slate-50 text-foreground'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {priority}
          </motion.button>
        ))}
      </motion.div>

      {/* Synchronized Queue List */}
      <motion.div
        className="space-y-3"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <AnimatePresence mode="popLayout">
          {filteredPatients.map((patient) => (
            <motion.div
              key={patient.id}
              variants={item}
              layout
              exit={{ opacity: 0, x: -30 }}
              className="bg-white border border-border rounded-xl p-4 hover:shadow-sm transition-all duration-200 group"
            >
              <div className="flex items-center justify-between gap-4">
                {/* Left Section */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-border flex items-center justify-center flex-shrink-0 font-mono font-bold text-sm text-blue-600">
                    {patient.id}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">
                      {patient.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {patient.department}
                    </p>
                  </div>
                </div>

                {/* Center Metrics Section */}
                <div className="hidden md:flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-0.5">Check-in</p>
                    <p className="font-semibold text-sm text-foreground">{patient.checkInTime}</p>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-0.5">Est. Wait</p>
                    <div className="flex items-center gap-1 justify-center">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      <p className="font-semibold text-sm text-foreground">
                        {patient.status === 'completed' ? '0m' : `${patient.estimatedWait}m`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Badges Section */}
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${priorityColors[patient.priority]}`}>
                    {patient.priority.charAt(0).toUpperCase() + patient.priority.slice(1)}
                  </div>

                  <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[patient.status]}`}>
                    {patient.status === 'in-progress'
                      ? 'In Progress'
                      : patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                  </div>

                  <div className="p-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <MoreVertical className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty Fallback Screen */}
      {filteredPatients.length === 0 && (
        <motion.div
          className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-border"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-sm text-muted-foreground font-medium">No live patient records match the selected query criteria.</p>
        </motion.div>
      )}
    </DashboardLayout>
  );
}