'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { Search, Plus, MoreVertical, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { patientService } from '@/lib/patientService';
import { socket } from '@/lib/socket';

interface PatientRecord {
  id: string;
  name: string;
  age: number;
  gender: string;
  lastVisit: string;
  status: 'active' | 'inactive';
  visits: number;
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch directory from the backend
  const loadPatientsDirectory = async () => {
    try {
      const response = await patientService.getPatients();
      // Handle mapping backend keys to directory structure if needed
      setPatients(response.patients || []);
    } catch (err) {
      console.error('Failed to load patient directory:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Live Sync Setup
  useEffect(() => {
    loadPatientsDirectory();

    // Re-fetch directory if any queue registration occurs
    socket.on('queueUpdated', loadPatientsDirectory);
    socket.on('directoryUpdated', loadPatientsDirectory);

    return () => {
      socket.off('queueUpdated', loadPatientsDirectory);
      socket.off('directoryUpdated', loadPatientsDirectory);
    };
  }, []);

  const filteredPatients = patients.filter((patient) =>
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Patients Directory
            </h1>
            <p className="text-muted-foreground">
              Manage all registered patients ({patients.length})
            </p>
          </div>
          <motion.button
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold shadow-premium hover:shadow-premium-lg transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-5 h-5" />
            Add Patient
          </motion.button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search patients by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
        </div>
      </motion.div>

      {/* Table Section */}
      <motion.div
        className="bg-white border border-border rounded-2xl shadow-premium overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Patient Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Age
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Gender
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Last Visit
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Total Visits
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      Loading records...
                    </div>
                  </td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    No matching patient records found.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient, index) => (
                  <motion.tr
                    key={patient.id || patient.token || index}
                    className="hover:bg-secondary/30 transition-colors"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.03, 0.3) }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-medium text-foreground">
                          {patient.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {patient.age || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {patient.gender || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {patient.lastVisit || 'Today'}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-foreground">
                      {patient.visits ?? 1}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          patient.status !== 'inactive'
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : 'bg-muted/50 text-muted-foreground'
                        }`}
                      >
                        {patient.status !== 'inactive' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <motion.button
                        className="p-2 hover:bg-secondary rounded-lg transition-colors"
                        whileHover={{ scale: 1.1 }}
                      >
                        <MoreVertical className="w-5 h-5 text-muted-foreground" />
                      </motion.button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}