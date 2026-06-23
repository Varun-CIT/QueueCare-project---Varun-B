'use client';

import { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';

// Import backend utilities
import { patientService } from '@/lib/patientService';
import { socket } from '@/lib/socket';

interface Patient {
  id: string;
  token: string;
  name: string;
  age: number;
  weight: number;
  status: 'serving' | 'waiting' | 'completed';
  checkInTime: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
}

interface BackendPatient {
  token: string;
  name: string;
  age: number | string;
  weight: number | string;
  status: string;
  joinedAt: string;
  priority?: 'low' | 'normal' | 'high' | 'critical';
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
};

export default function DoctorDashboard() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // 1. Fetch and Map Backend State
  const loadPatients = async () => {
    try {
      const response = await patientService.getPatients();
      
      const mapped: Patient[] = response.patients.map((p: BackendPatient) => ({
        id: p.token,
        token: p.token,
        name: p.name,
        age: Number(p.age),
        weight: Number(p.weight),
        status:
          p.status === 'Consulting'
            ? 'serving'
            : p.status === 'Completed'
            ? 'completed'
            : 'waiting',
        checkInTime: new Date(p.joinedAt).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        priority: p.priority || 'normal',
      }));

      setPatients(mapped);
    } catch (err) {
      console.error('Failed to sync doctor queue:', err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Real-Time Socket Lifecycle
  useEffect(() => {
    loadPatients();
    socket.on('queueUpdated', loadPatients);

    return () => {
      socket.off('queueUpdated', loadPatients);
    };
  }, []);

  // 3. Derive UI States safely from the unified backend array
  const currentPatient = useMemo(() => {
    return patients.find((p) => p.status === 'serving') || null;
  }, [patients]);

  const upcomingQueue = useMemo(() => {
    return patients.filter((p) => p.status === 'waiting');
  }, [patients]);

  // 4. Fire updates directly back to the database
  const handleCompleteConsultation = async () => {
    if (!currentPatient) return;

    try {
      setActionLoading(true);
      
      // Tell the backend to update this specific token to completed
      await patientService.updateStatus(currentPatient.token, 'Completed');
      
      // Auto-call the next patient immediately if one is waiting
      if (upcomingQueue.length > 0) {
        await patientService.callNext();
      }

      // Refresh state locally (which triggers socket emission for everyone else)
      await loadPatients();
    } catch (err) {
      console.error('Failed to transition consultation status:', err);
      alert('Could not update status. Please try again.');
    } finally {
      setActionLoading(false);
    }
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="text-5xl font-bold text-foreground tracking-tight mb-2">
            Consultation
          </h1>
          <p className="text-base text-muted-foreground font-medium">
            Live backend synchronised clinic dashboard
          </p>
        </motion.div>

        {/* Main Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Current Patient Section */}
          <AnimatePresence mode="wait">
            {currentPatient ? (
              <motion.div 
                key={currentPatient.id}
                variants={itemVariants}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="mb-4">
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Current Patient
                  </span>
                </div>

                {/* Token Card */}
                <motion.div
                  className="bg-white rounded-2xl p-8 sm:p-12 shadow-md mb-8 border border-border/50"
                  whileHover={{ y: -2 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                >
                  <div className="flex flex-col items-center text-center space-y-6">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide block mb-3">
                        Token Number
                      </span>
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.4 }}
                        className="text-7xl sm:text-8xl font-light bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight font-mono"
                      >
                        {currentPatient.token}
                      </motion.div>
                    </div>

                    <div className="w-12 h-px bg-border" />

                    {/* Patient Info */}
                    <div className="space-y-6 w-full">
                      <div>
                        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide block mb-2">
                          Patient Name
                        </span>
                        <p className="text-2xl font-light text-foreground">
                          {currentPatient.name}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-2">
                            Age
                          </span>
                          <p className="text-xl font-light text-foreground">
                            {currentPatient.age} years
                          </p>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-2">
                            Weight
                          </span>
                          <p className="text-xl font-light text-foreground">
                            {currentPatient.weight} kg
                          </p>
                        </div>
                      </div>

                      {/* Priority Badge */}
                      <div className="pt-2">
                        <span
                          className={`inline-block px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wide ${
                            currentPatient.priority === 'critical'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : currentPatient.priority === 'high'
                              ? 'bg-orange-50 text-orange-700 border border-orange-200'
                              : currentPatient.priority === 'normal'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-slate-50 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {currentPatient.priority} Priority
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Complete Button */}
                <motion.button
                  variants={itemVariants}
                  disabled={actionLoading}
                  onClick={handleCompleteConsultation}
                  className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white rounded-xl py-4 font-semibold shadow-md hover:shadow-xl hover:brightness-105 transition-all duration-300 disabled:opacity-50"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <span className="flex items-center justify-center gap-2">
                    {actionLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5" />
                    )}
                    {actionLoading ? 'Updating Queue...' : 'Complete Consultation'}
                  </span>
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="empty-state"
                variants={itemVariants}
                className="bg-white rounded-2xl p-12 text-center border border-border/50 shadow-sm"
              >
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  All Caught Up
                </h2>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  No active patients are waiting inside your consulting room right now.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Upcoming Queue */}
          <motion.div variants={itemVariants} className="pt-4">
            <div className="mb-4">
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Upcoming Live Queue ({upcomingQueue.length})
              </span>
            </div>

            {upcomingQueue.length > 0 ? (
              <div className="space-y-3">
                {upcomingQueue.map((patient, idx) => (
                  <motion.div
                    key={patient.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.3 }}
                    className="bg-white rounded-xl p-4 border border-border/50 hover:border-blue-500/30 hover:shadow-sm transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Token */}
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-border/40">
                            <span className="font-bold text-blue-600 text-sm font-mono">
                              {patient.token}
                            </span>
                          </div>
                        </div>

                        {/* Patient Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">
                            {patient.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {patient.age} years • {patient.weight} kg • Checked in {patient.checkInTime}
                          </p>
                        </div>
                      </div>

                      {/* Right Hand Action Status Indicator */}
                      <div className="flex items-center gap-3 ml-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          patient.priority === 'critical' ? 'bg-red-50 text-red-600' :
                          patient.priority === 'high' ? 'bg-orange-50 text-orange-600' : 'bg-slate-50 text-slate-500'
                        }`}>
                          {patient.priority}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic pl-1">
                No subsequent patient entries discovered in this live slice window.
              </p>
            )}
          </motion.div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}