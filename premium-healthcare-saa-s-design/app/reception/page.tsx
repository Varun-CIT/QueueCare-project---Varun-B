'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Clock,
  Activity,
  AlertCircle,
  Printer,
  Share2,
  CheckCircle2,
  Trash2,
  Eye,
  Volume2,
} from 'lucide-react';

import { MetricCard } from '@/components/MetricCard';
import { patientService } from '@/lib/patientService';
import { socket } from '@/lib/socket';
import { announcePatient } from "@/lib/voiceAnnouncement";

interface Token {
  id: string;
  number: string;
  patientName: string;
  doctor: string;
  status: 'waiting' | 'serving' | 'completed';
  estimatedWait: number;
  createdAt: Date;
}

interface BackendPatient {
  token: string;
  name: string;
  age: number | string;
  weight: number | string;
  status: string;
  estimatedWait: number;
  joinedAt: string;
  doctor?: string;
}

interface FormData {
  patientName: string;
  age: string;
  weight: string;
  doctor: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
}

export default function ReceptionPage() {
  const [loading, setLoading] = useState(false);
  const [isCallingNext, setIsCallingNext] = useState(false);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    patientName: '',
    age: '',
    weight: '',
    doctor: '',
    priority: 'normal',
  });

  // Track the previous serving token ID to prevent duplicate announcements on unrelated re-renders
  const lastAnnouncedTokenId = useRef<string | null>(null);

  const loadPatients = async () => {
    try {
      const response = await patientService.getPatients();

      const mappedPatients: Token[] = response.patients.map(
        (patient: BackendPatient) => ({
          id: patient.token,
          number: patient.token, // Properly mapping 'token' from backend to 'number' in local state
          patientName: patient.name,
          doctor: patient.doctor || 'General',
          status:
            patient.status === 'Consulting'
              ? 'serving'
              : patient.status === 'Completed'
              ? 'completed'
              : 'waiting',
          estimatedWait: patient.estimatedWait,
          createdAt: new Date(patient.joinedAt),
        })
      );

      setTokens(mappedPatients);
    } catch (err) {
      console.error("Failed to load queue data:", err);
    }
  };

  // Core Queue Synchronization
  useEffect(() => {
    loadPatients();
    socket.on('queueUpdated', loadPatients);

    return () => {
      socket.off('queueUpdated', loadPatients);
    };
  }, []);

  // Reactive Voice Announcement System
  // This triggers beautifully whenever the state resolves a new 'serving' token
  useEffect(() => {
    const currentServingPatient = tokens.find((t) => t.status === 'serving');

    if (currentServingPatient && currentServingPatient.id !== lastAnnouncedTokenId.current) {
      announcePatient(
        currentServingPatient.number, // Uses the freshly synchronized state token
        currentServingPatient.estimatedWait ?? 0
      );
      lastAnnouncedTokenId.current = currentServingPatient.id;
    } else if (!currentServingPatient) {
      lastAnnouncedTokenId.current = null;
    }
  }, [tokens]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGenerateToken = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.patientName ||
      !formData.age ||
      !formData.weight ||
      !formData.doctor
    ) {
      alert('Please fill all fields');
      return;
    }

    try {
      setLoading(true);

      const patient = await patientService.addPatient({
        name: formData.patientName,
        age: formData.age,
        weight: formData.weight,
        doctor: formData.doctor,
      });

      setGeneratedToken(patient.token);
      setShowSuccess(true);
      await loadPatients();

      setFormData({
        patientName: '',
        age: '',
        weight: '',
        doctor: '',
        priority: 'normal',
      });

      setTimeout(() => {
        setShowSuccess(false);
      }, 4000);
    } catch (error) {
      console.error(error);
      alert('Unable to generate token');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteToken = (id: string) => {
    setTokens((prev) => prev.filter((token) => token.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'serving':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'waiting':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'completed':
        return 'bg-green-50 text-green-700 border border-green-200';
      default:
        return 'bg-slate-50 text-slate-700 border border-slate-200';
    }
  };

  const getStatusLabel = (status: string) => {
    if (!status) return '';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const todayPatients = tokens.length;
  const waiting = tokens.filter((t) => t.status === 'waiting').length;
  const serving = tokens.filter((t) => t.status === 'serving').length;

  const avgWait =
    tokens.length > 0
      ? Math.round(
          tokens.reduce((sum, token) => sum + token.estimatedWait, 0) /
            tokens.length
        )
      : 0;

  const currentPatient = tokens.find((t) => t.status === 'serving');
  const nextPatient = tokens.find((t) => t.status === 'waiting');

  return (
    <div className="flex-1 md:ml-64 bg-slate-50/50 min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-border/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-5xl font-bold text-foreground mb-2">
              Good Morning 👋
            </h1>
            <p className="text-base text-muted-foreground font-medium">
              Manage today's clinic effortlessly.
            </p>
          </motion.div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        
        {/* Reception Controls Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Live Announcement Board */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black rounded-3xl p-8 border-4 border-red-600 shadow-2xl"
            >
              <h2 className="text-center text-red-500 text-xl md:text-2xl font-bold tracking-widest mb-6">
                LIVE ANNOUNCEMENT BOARD
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="text-center md:border-r md:border-red-900/50 md:pr-6">
                  <p className="text-gray-400 text-sm font-semibold tracking-wider uppercase mb-1">
                    NOW CONSULTING
                  </p>
                  <h1 className="text-5xl font-extrabold text-red-500 animate-pulse">
                    {currentPatient?.number || "--"}
                  </h1>
                  <p className="text-xl text-white mt-2 truncate font-medium">
                    {currentPatient?.patientName || "Waiting..."}
                  </p>
                </div>

                <div className="text-center pt-6 md:pt-0">
                  <p className="text-gray-400 text-sm font-semibold tracking-wider uppercase mb-1">
                    NEXT TOKEN
                  </p>
                  <h2 className="text-4xl font-bold text-yellow-400">
                    {nextPatient?.number || "--"}
                  </h2>
                  <p className="text-base text-gray-300 mt-2">
                    Estimated Wait: <span className="text-white font-semibold">{nextPatient?.estimatedWait ?? 0} mins</span>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Action Button Container */}
          <div className="flex h-full lg:items-center justify-center lg:justify-start">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={isCallingNext}
              onClick={async () => {
                try {
                  setIsCallingNext(true);
                  const patientData = await patientService.callNext();
                  
                  // Debug logging to track backend response payload shape
                  console.log("Backend response for callNext():", patientData);

                  // Update application state
                  await loadPatients();
                } catch (err) {
                  console.error("Error updating patient queue:", err);
                } finally {
                  setIsCallingNext(false);
                }
              }}
              className="flex items-center justify-center gap-3 w-full sm:w-auto lg:w-full px-8 py-6 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-500 text-white font-bold text-xl shadow-xl hover:shadow-green-900/20 transition-all disabled:opacity-50"
            >
              <Volume2 className="w-7 h-7 shrink-0" />
              {isCallingNext ? 'PROCESSING...' : 'CALL NEXT PATIENT'}
            </motion.button>
          </div>

        </div>

        {/* Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <MetricCard
            title="Today's Patients"
            value={todayPatients.toString()}
            icon={Users}
            trend="Live Queue"
            trendPositive
          />
          <MetricCard
            title="Waiting"
            value={waiting.toString()}
            icon={Clock}
            trend="In Queue"
            trendPositive
          />
          <MetricCard
            title="Currently Serving"
            value={serving.toString()}
            icon={Activity}
            trend="Active Consultation"
            trendPositive
          />
          <MetricCard
            title="Average Wait"
            value={`${avgWait} min`}
            icon={AlertCircle}
            trend="AI Estimated"
            trendPositive
          />
        </motion.div>

        {/* Generate Token Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl shadow-sm p-8 border border-border/50"
        >
          <h2 className="text-3xl font-bold mb-2">Generate Token</h2>
          <p className="text-muted-foreground mb-8">
            Register a new patient into today's queue
          </p>

          <form onSubmit={handleGenerateToken} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-3">
                  Patient Name
                </label>
                <input
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Enter patient name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3">Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Age"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Weight"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3">Doctor</label>
                <select
                  name="doctor"
                  value={formData.doctor}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-primary/20 outline-none bg-white"
                >
                  <option value="">Select Doctor</option>
                  <option value="Dr. Sarah Johnson">Dr. Sarah Johnson</option>
                  <option value="Dr. Michael Chen">Dr. Michael Chen</option>
                  <option value="Dr. Emma Williams">Dr. Emma Williams</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-primary/20 outline-none bg-white"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              type="submit"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Token'}
            </motion.button>
          </form>
        </motion.div>

        {/* Success Card */}
        <AnimatePresence>
          {showSuccess && generatedToken && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-green-50 border border-green-200 rounded-2xl p-8"
            >
              <div className="flex gap-5">
                <CheckCircle2 className="w-10 h-10 text-green-600 shrink-0" />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-green-700 mb-4">
                    Token Generated Successfully
                  </h3>

                  <div className="grid sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-4 border">
                      <p className="text-sm text-muted-foreground">Token</p>
                      <p className="text-4xl font-bold text-blue-600">
                        {generatedToken}
                      </p>
                    </div>

                    <div className="bg-white rounded-xl p-4 border">
                      <p className="text-sm text-muted-foreground">
                        Estimated Wait
                      </p>
                      <p className="text-4xl font-bold text-amber-500">
                        {avgWait} min
                      </p>
                    </div>

                    <div className="bg-white rounded-xl p-4 border">
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="text-lg font-bold text-green-600 mt-2">Waiting</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-5 py-3 rounded-xl border bg-white hover:bg-slate-50 font-medium transition-colors">
                      <Printer className="w-5 h-5" />
                      Print
                    </button>
                    <button className="flex items-center gap-2 px-5 py-3 rounded-xl border bg-white hover:bg-slate-50 font-medium transition-colors">
                      <Share2 className="w-5 h-5" />
                      Share
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Queue Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl shadow-sm border border-border/50 overflow-hidden"
        >
          <div className="px-8 py-6 border-b border-border/50">
            <h2 className="text-3xl font-bold text-foreground">Today's Queue</h2>
            <p className="text-muted-foreground mt-1">
              Live queue powered by QueueCure AI
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Token
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Patient
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Doctor
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    ETA
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {tokens.length > 0 ? (
                  tokens.map((token, index) => (
                    <motion.tr
                      key={token.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-border/30 hover:bg-slate-50/50 transition-all"
                    >
                      <td className="px-8 py-5">
                        <span className="font-bold text-blue-600 text-lg">
                          {token.number}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <p className="font-semibold">{token.patientName}</p>
                      </td>
                      <td className="px-8 py-5 text-muted-foreground">
                        {token.doctor}
                      </td>
                      <td className="px-8 py-5">
                        <span
                          className={`px-4 py-2 rounded-lg text-sm font-semibold inline-block ${getStatusColor(
                            token.status
                          )}`}
                        >
                          {getStatusLabel(token.status)}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="font-semibold">
                          {token.estimatedWait > 0
                            ? `${token.estimatedWait} min`
                            : 'Now'}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 rounded-lg hover:bg-slate-100 transition-all"
                          >
                            <Eye className="w-5 h-5 text-slate-600" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDeleteToken(token.id)}
                            className="p-2 rounded-lg hover:bg-red-50 transition-all"
                          >
                            <Trash2 className="w-5 h-5 text-red-500" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Clock className="w-16 h-16 text-muted-foreground/30 mb-4" />
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                          No Patients in Queue
                        </h3>
                        <p className="text-muted-foreground">
                          Generate a new token to get started.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>
    </div>
  );
}