'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Bell,
  Share2,
  Download,
  ChevronRight,
} from 'lucide-react';
import { patientService } from '@/lib/patientService';
import { socket } from '@/lib/socket';

interface Patient {
  token: string;
  name: string;
  doctor: string;
  status: string;
  estimatedWait: number;
  joinedAt: string;
}

export default function PatientPortal() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load backend data
  const loadPatients = async () => {
    try {
      const response = await patientService.getPatients();
      setPatients(response.patients || []);
    } catch (err) {
      console.error('Failed to fetch patients:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Socket synchronization
  useEffect(() => {
    loadPatients();

    socket.on("queueUpdated", loadPatients);

    return () => {
      socket.off("queueUpdated", loadPatients);
    };
  }, []);

  // Filter down to just the waiting room queue
  const waitingPatients = useMemo(() => {
    return patients.filter((p) => p.status === "Waiting");
  }, [patients]);

  // Select current patient for demo purposes (first waiting, or fallback to first overall)
  const patient = useMemo(() => {
    return waitingPatients[0] || patients[0];
  }, [waitingPatients, patients]);

  // Derived metrics based strictly on the waiting queue
  const totalPatients = waitingPatients.length;

  const currentPosition = useMemo(() => {
    if (!patient) return 0;
    const index = waitingPatients.findIndex((p) => p.token === patient.token);
    return index !== -1 ? index + 1 : 1;
  }, [waitingPatients, patient]);

  const progressPercentage = totalPatients > 0 
    ? ((totalPatients - currentPosition + 1) / totalPatients) * 100 
    : 0;

  // Mocked recent updates for UI consistency (can be dynamic if backend supports logs)
  const recentUpdates = [
    {
      id: 1,
      timestamp: 'Just now',
      message: 'Queue synchronized live via WebSocket',
      status: 'active',
    },
    {
      id: 2,
      timestamp: 'Live',
      message: patient ? `Position updated to #${currentPosition}` : 'Waiting for connection',
      status: 'confirmed',
    },
  ];

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground font-medium">Connecting to clinic ecosystem...</p>
        </div>
      </main>
    );
  }

  if (!patient) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-1">No Active Patients</h2>
          <p className="text-sm text-muted-foreground">
            The waiting room is currently empty. New token updates will stream here automatically.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 md:ml-64">
      {/* Mobile Header */}
      <motion.div
        className="md:hidden sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-border p-4 shadow-premium"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Welcome back</p>
            <h1 className="text-lg font-semibold text-foreground">{patient.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 hover:bg-secondary rounded-full transition-colors"
            >
              <Bell className="w-5 h-5 text-foreground" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        className="p-4 md:p-8 max-w-2xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Desktop Greeting */}
        <motion.div variants={itemVariants} className="hidden md:block mb-8">
          <p className="text-sm text-muted-foreground font-medium mb-1">Welcome back</p>
          <h1 className="text-4xl font-bold text-foreground">
            Hello, {patient.name?.split(' ')[0] || 'Patient'}
          </h1>
        </motion.div>

        {/* Large Token Display Card */}
        <motion.div variants={itemVariants} className="mb-6">
          <motion.div
            className="bg-white rounded-3xl shadow-premium-lg p-8 md:p-12 border border-white/50"
            whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(91, 92, 235, 0.15)' }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-sm text-muted-foreground font-medium mb-4">Your Token</p>
            <motion.div
              className="text-center mb-8"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="text-7xl md:text-8xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
                {patient.token}
              </div>
              <p className="text-lg text-muted-foreground font-medium">Your queue token</p>
            </motion.div>

            {/* Quick Actions */}
            <div className="flex gap-3 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-3 bg-secondary hover:bg-secondary/80 rounded-xl transition-colors font-medium text-sm"
              >
                <Share2 className="w-4 h-4" /> Share
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-3 bg-secondary hover:bg-secondary/80 rounded-xl transition-colors font-medium text-sm"
              >
                <Download className="w-4 h-4" /> Download
              </motion.button>
            </div>
          </motion.div>
        </motion.div>

        {/* Current Position & Wait Time */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-premium p-6 border border-white/50">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground font-medium">Your Position</p>
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <motion.p
              key={currentPosition}
              className="text-5xl font-bold text-foreground"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              #{currentPosition}
            </motion.p>
            <p className="text-xs text-muted-foreground mt-2">of {totalPatients} waiting patients</p>
          </div>

          <div className="bg-white rounded-2xl shadow-premium p-6 border border-white/50">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground font-medium">Estimated Wait</p>
              <Clock className="w-5 h-5 text-accent" />
            </div>
            <motion.div
              key={patient.estimatedWait}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-5xl font-bold text-foreground">{patient.estimatedWait}</p>
              <p className="text-xs text-muted-foreground mt-2">minutes</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Doctor Information */}
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl shadow-premium p-6 border border-primary/20 mb-6"
        >
          <p className="text-sm text-muted-foreground font-medium mb-3">Consulting With</p>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg">
              {patient.doctor?.split(' ').pop()?.substring(0, 2).toUpperCase() || 'MD'}
            </div>
            <div>
              <p className="font-semibold text-foreground text-lg">{patient.doctor}</p>
              <p className="text-sm text-muted-foreground">Clinical Specialist</p>
            </div>
          </div>
        </motion.div>

        {/* Animated Progress Bar */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-premium p-6 border border-white/50 mb-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground font-medium">Queue Progress</p>
            <span className="text-sm font-bold text-primary">{Math.round(progressPercentage)}%</span>
          </div>

          {/* Progress Bar Container */}
          <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
              animate={{ x: ['0%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              style={{ width: '100%' }}
            />
          </div>

          <div className="flex justify-between mt-4 text-xs text-muted-foreground">
            <span>Checked in</span>
            <span>Next Up</span>
            <span>Serving</span>
          </div>
        </motion.div>

        {/* Live Status Messaging */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-premium p-6 border border-white/50 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              className="w-3 h-3 rounded-full bg-emerald-500"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <p className="text-sm font-semibold text-foreground">Live Sync Active</p>
          </div>
          <p className="text-base text-muted-foreground leading-relaxed">
            {currentPosition === 1 
              ? "You are next in line! Please prepare to head to the examination room." 
              : `You are currently in the queue. There are ${currentPosition - 1} patient(s) ahead of you. This screen updates automatically.`}
          </p>
        </motion.div>

        {/* Recent Updates */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-premium p-6 border border-white/50">
          <h2 className="text-lg font-semibold text-foreground mb-6">Connection History</h2>
          <div className="space-y-4">
            {recentUpdates.map((update, index) => (
              <motion.div
                key={update.id}
                className="flex gap-4 pb-4 border-b border-border last:border-0"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
              >
                <div className="flex-shrink-0 mt-1">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">{update.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{update.timestamp}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="h-8" />
      </motion.div>
    </main>
  );
}