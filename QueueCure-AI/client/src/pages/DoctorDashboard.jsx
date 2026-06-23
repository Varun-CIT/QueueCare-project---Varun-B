import { useEffect, useState } from "react";
import axios from "axios";
import socket from "../socket/socket";

import Header from "../components/Header";
import StatCard from "../components/StatCard";
import QueueItem from "../components/QueueItem";

import "../styles/dashboard.css";

export default function DoctorDashboard() {
  const API = "http://localhost:5000/api/patients";

  const [patients, setPatients] = useState([]);
  const [averageTime, setAverageTime] = useState(5);
  const [duration, setDuration] = useState("");

  const loadPatients = async () => {
    const res = await axios.get(API);

    setPatients(res.data.patients);
    setAverageTime(res.data.averageConsultationTime);
  };

  useEffect(() => {
    loadPatients();

    socket.on("queueUpdated", (data) => {
      setPatients(data.patients);
      setAverageTime(data.averageConsultationTime);
    });

    return () => socket.off("queueUpdated");
  }, []);

  const currentPatient = patients.find(
    (p) => p.status === "Consulting"
  );

  const waitingPatients = patients.filter(
    (p) => p.status === "Waiting"
  );

  const completedPatients = patients.filter(
    (p) => p.status === "Completed"
  );

  const updateAI = async () => {
    if (!duration) return;

    await axios.post(`${API}/finish`, {
      duration: Number(duration),
    });

    setDuration("");

    loadPatients();
  };

  const doctorLoad =
    waitingPatients.length < 4
      ? "🟢 Low"
      : waitingPatients.length < 8
      ? "🟡 Moderate"
      : "🔴 High";

  return (
    <div className="container">
      <Header />

      <div className="cards">
        <StatCard
          title="Waiting"
          value={waitingPatients.length}
          emoji="👥"
        />

        <StatCard
          title="Completed"
          value={completedPatients.length}
          emoji="✅"
        />

        <StatCard
          title="AI Average"
          value={`${averageTime} mins`}
          emoji="🤖"
        />
      </div>

      <br />

      <div className="card">
        <h2>👨‍⚕️ Current Patient</h2>

        {currentPatient ? (
          <>
            <h1>{currentPatient.token}</h1>

            <h2>{currentPatient.name}</h2>

            <p>{currentPatient.consultationType}</p>
          </>
        ) : (
          <p>No patient consulting</p>
        )}
      </div>

      <br />

      <div className="card">
        <h2>📊 Doctor Analytics</h2>

        <p>Doctor Load : {doctorLoad}</p>

        <p>Average Consultation : {averageTime} mins</p>

        <p>AI Learning : ✅ Enabled</p>
      </div>

      <br />

      <div className="card">
        <h2>Upcoming Queue</h2>

        {waitingPatients.map((patient) => (
          <QueueItem
            key={patient.token}
            patient={patient}
          />
        ))}
      </div>

      <br />

      <div className="card">
        <h2>🤖 Finish Consultation</h2>

        <input
          type="number"
          placeholder="Duration in minutes"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />

        <br />
        <br />

        <button onClick={updateAI}>
          Update AI
        </button>
      </div>
    </div>
  );
}