'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { socket } from '@/lib/socket';
import { patientService } from '@/lib/patientService';

interface QueuePatient {
  token: string;
  name: string;
  doctor: string;
  eta: number;
}

export default function DisplayPage() {
  const [time, setTime] = useState(new Date());
  const [nowServing, setNowServing] = useState<QueuePatient | null>(null);
  const [nextPatients, setNextPatients] = useState<QueuePatient[]>([]);
  const [announcement, setAnnouncement] = useState('');
  
  // Real-time calculated telemetry from your backend
  const [stats, setStats] = useState({ avgWait: 15, totalToday: 0, activeDocs: 1 });

  // 1. Live Ambient Clock Engine
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // 2. Real-Time Telemetry & State Synchronizer
  const syncDisplayBoard = async () => {
    try {
      const response = await patientService.getPatients();
      const allPatients = response.patients || [];

      // Find the single patient currently marked as "Consulting"
      const consulting = allPatients.find(
        (p: any) => p.status === 'Consulting' || p.status === 'in-progress'
      );
      
      if (consulting) {
        setNowServing({
          token: consulting.token || consulting.id,
          name: consulting.name,
          doctor: consulting.doctor || consulting.department || 'General Medicine',
          eta: 0,
        });
      } else {
        setNowServing(null);
      }

      // Filter and map the next 3 patients waiting in line
      const waiting = allPatients
        .filter((p: any) => p.status === 'Waiting' || p.status === 'waiting' || !p.status)
        .slice(0, 3)
        .map((p: any, idx: number) => ({
          token: p.token || p.id,
          name: p.name,
          doctor: p.doctor || p.department || 'General Medicine',
          eta: p.estimatedWait || (idx + 1) * 15,
        }));

      setNextPatients(waiting);

      // Extract raw metrics out of backend data structures
      const uniqueDocs = new Set(allPatients.map((p: any) => p.doctor || p.department).filter(Boolean));
      setStats({
        avgWait: response.analytics?.averageWaitTime || 12,
        totalToday: allPatients.length,
        activeDocs: uniqueDocs.size || 1,
      });
    } catch (err) {
      console.error('Display pipeline syncing exception:', err);
    }
  };

  // 3. Mount Actual Socket.IO Events (No Simulation!)
  useEffect(() => {
    // Initial fetch on mount
    syncDisplayBoard();

    // Listen to global queue changes across the clinic
    socket.on('queueUpdated', syncDisplayBoard);

    // Explicit hook matching your Doctor Dashboard's "Call Next" event trigger
    socket.on('patientCalled', (data: { token: string; name: string; doctor: string }) => {
      // Force an immediate UI re-sync
      syncDisplayBoard();

      // Trigger Text-to-Speech Voice Engine
      const english = `Token ${data.token}, please proceed to consultation room.`;
      const hindi = `टोकन ${data.token} कृपया डॉक्टर के कक्ष में आएं`;
      setAnnouncement(`${english} • ${hindi}`);

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Clear audio buffer queue
        
        const englishVoice = new SpeechSynthesisUtterance(english);
        englishVoice.lang = 'en-IN';
        
        const hindiVoice = new SpeechSynthesisUtterance(hindi);
        hindiVoice.lang = 'hi-IN';

        window.speechSynthesis.speak(englishVoice);
        setTimeout(() => {
          window.speechSynthesis.speak(hindiVoice);
        }, 2000);
      }
    });

    return () => {
      socket.off('queueUpdated', syncDisplayBoard);
      socket.off('patientCalled');
    };
  }, []);

  const formattedTime = useMemo(() => {
    return time.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }, [time]);

  const formattedDate = useMemo(() => {
    return time.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [time]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-950 text-white overflow-hidden">
      {/* Dynamic Background Glow Vectors */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute h-[500px] w-[500px] rounded-full bg-cyan-500 blur-[140px] -top-24 -left-24" />
        <div className="absolute h-[400px] w-[400px] rounded-full bg-indigo-500 blur-[130px] bottom-0 right-0" />
      </div>

      <div className="relative z-10 p-6 lg:p-10">
        {/* Top Header Grid */}
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-center gap-5"
        >
          <div>
            <h1 className="text-6xl font-black tracking-wide bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
              QueueCare
            </h1>
            <p className="text-xl text-slate-300 mt-2">
              Smart Hospital Public Display Board
            </p>
          </div>

          <motion.div
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="rounded-3xl bg-white/10 backdrop-blur-xl px-8 py-5 border border-white/20 shadow-2xl text-center lg:text-left"
          >
            <p className="text-lg text-slate-300">Current Time</p>
            <h2 className="text-5xl font-bold mt-2 font-mono">{formattedTime}</h2>
            <p className="text-slate-400 mt-2">{formattedDate}</p>
          </motion.div>
        </motion.div>

        {/* Live Active Patient Hero Card */}
        <motion.div
          layout
          className="mt-10 rounded-[40px] bg-gradient-to-r from-cyan-500/20 to-blue-600/20 backdrop-blur-2xl border border-cyan-400/30 p-10 shadow-[0_0_80px_rgba(6,182,212,0.2)]"
        >
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <div>
              <p className="text-2xl text-cyan-200 uppercase tracking-[6px] text-center lg:text-left">
                NOW SERVING
              </p>
              <AnimatePresence mode="wait">
                <motion.h1
                  key={nowServing?.token || 'idle'}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  transition={{ duration: 0.5 }}
                  className="text-[110px] lg:text-[140px] font-black text-white font-mono leading-none tracking-tight text-center lg:text-left"
                >
                  {nowServing?.token || '----'}
                </motion.h1>
              </AnimatePresence>
            </div>

            <div className="space-y-4 text-center lg:text-right">
              <div>
                <p className="text-slate-300 text-lg">Patient Name</p>
                <h2 className="text-4xl font-bold">{nowServing?.name || 'Lounge Area Clear'}</h2>
              </div>
              <div>
                <p className="text-slate-300 text-lg">Consulting Room</p>
                <h2 className="text-3xl font-semibold text-cyan-300">{nowServing?.doctor || 'No Active Session'}</h2>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Upcoming Next Queue Cards */}
        <div className="grid lg:grid-cols-3 gap-6 mt-10">
          <AnimatePresence mode="popLayout">
            {nextPatients.map((patient, index) => (
              <motion.div
                key={patient.token}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.4 }}
                className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 p-7 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <p className="text-cyan-300 text-sm font-bold tracking-wider">
                    UP NEXT #{index + 1}
                  </p>
                  <h2 className="text-5xl font-black mt-2 font-mono">{patient.token}</h2>
                  <p className="text-xl mt-2 font-semibold truncate">{patient.name}</p>
                  <p className="text-sm text-slate-400 mt-1">{patient.doctor}</p>
                </div>
                <div className="mt-6 flex justify-between items-center border-t border-white/10 pt-4">
                  <span className="text-slate-300 text-sm">Estimated Wait</span>
                  <span className="text-2xl font-bold text-green-400">{patient.eta} min</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Live Audio Broadcast Ticker */}
        <motion.div
          animate={{ opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mt-10 rounded-3xl bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-400/20 backdrop-blur-xl p-6 overflow-hidden"
        >
          <div className="flex items-center gap-4">
            <div className="h-3 w-3 rounded-full bg-green-400 animate-pulse" />
            <h2 className="text-xl font-bold tracking-wider">AUDIO DISPATCH TICKER</h2>
          </div>
          <div className="relative mt-4 h-10 overflow-hidden flex items-center">
            <motion.div
              key={announcement}
              animate={{ x: ['100%', '-100%'] }}
              transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
              className="whitespace-nowrap text-2xl font-medium text-cyan-200 absolute"
            >
              {announcement || 'Welcome to QueueCare • Please wait your token deployment announcement comfortably.'}
            </motion.div>
          </div>
        </motion.div>

        {/* Dynamic Aggregated Footer Stats Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <div className="rounded-2xl bg-white/5 p-5 border border-white/5 backdrop-blur-lg">
            <p className="text-slate-400 text-sm">Average Wait</p>
            <h3 className="text-3xl font-bold text-green-400 mt-1 font-mono">{stats.avgWait} min</h3>
          </div>
          <div className="rounded-2xl bg-white/5 p-5 border border-white/5 backdrop-blur-lg">
            <p className="text-slate-400 text-sm">Patients Today</p>
            <h3 className="text-3xl font-bold text-cyan-400 mt-1 font-mono">{stats.totalToday}</h3>
          </div>
          <div className="rounded-2xl bg-white/5 p-5 border border-white/5 backdrop-blur-lg">
            <p className="text-slate-400 text-sm">Active Practitioners</p>
            <h3 className="text-3xl font-bold text-blue-400 mt-1 font-mono">{stats.activeDocs}</h3>
          </div>
          <div className="rounded-2xl bg-white/5 p-5 border border-white/5 backdrop-blur-lg flex items-center">
            <span className="text-xs font-bold text-emerald-400 tracking-wider bg-emerald-500/10 py-2 px-4 rounded-xl border border-emerald-500/20 w-full text-center uppercase animate-pulse">
              ● Socket Live
            </span>
          </div>
        </motion.div>
      </div>
    </main>
  );
}