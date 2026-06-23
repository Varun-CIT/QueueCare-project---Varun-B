import { useEffect, useState } from "react";
import axios from "axios";
import socket from "../socket/socket";

import Header from "../components/Header";
import StatCard from "../components/StatCard";
import AIInsightCard from "../components/AIInsightCard";
import QueueItem from "../components/QueueItem";

import "../styles/dashboard.css";
import { announcePatient } from "../utils/speech";
import AnalyticsCard from "../components/AnalyticsCard";
import ExplainableAI from "../components/ExplainableAI";
export default function ReceptionPage() {

  const API = "http://localhost:5000/api/patients";

  const [patients, setPatients] = useState([]);
  const [averageTime, setAverageTime] = useState(5);

  const [name, setName] = useState("");

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

  const addPatient = async () => {

    if (!name.trim()) return;

    await axios.post(API, {
      name,
    });

    setName("");

    loadPatients();

  };
  const callNext = async () => {

    const response = await axios.post(`${API}/next`);

    const updatedPatients = response.data.patients;

    const current = updatedPatients.find(
        p => p.status === "Consulting"
    );

    const nextWaiting = updatedPatients.find(
        p => p.status === "Waiting"
    );

    if(current){

        announcePatient(

            current.token,

            nextWaiting?.estimatedWait || 0

        );

    }

    loadPatients();

};
  const waitingCount = patients.filter(
    (p) => p.status === "Waiting"
  ).length;

  const currentPatient = patients.find(
    (p) => p.status === "Consulting"
  );

  return (

    <div className="container">

      <Header />

      <div className="cards">

        <StatCard
          title="Patients Waiting"
          value={waitingCount}
          emoji="👥"
        />

        <StatCard
          title="Current Token"
          value={currentPatient?.token || "--"}
          emoji="🎫"
        />

        <StatCard
          title="AI Average"
          value={`${averageTime} mins`}
          emoji="🤖"
        />

      </div>

      <br />

      <AIInsightCard

        averageTime={averageTime}

        waitingCount={waitingCount}

      />
      <br />

<AnalyticsCard

    patients={patients}

    averageTime={averageTime}

/>
<br />

<ExplainableAI

    averageTime={averageTime}

    waitingCount={waitingCount}

/>
      <div className="card">

        <h2>➕ Add Patient</h2>

        <input

          value={name}

          placeholder="Patient Name"

          onChange={(e) => setName(e.target.value)}

          style={{
            padding: "12px",
            width: "60%",
            marginRight: "10px",
          }}

        />

        <button onClick={addPatient}>

          Add Patient

        </button>

      </div>

      <br />

      <div className="card">

        <h2>📋 Live Queue</h2>

        {patients.map((patient) => (

          <QueueItem

            key={patient.token}

            patient={patient}

          />

        ))}

        <br />

        <button onClick={callNext}>

          Call Next Patient

        </button>

      </div>

    </div>

  );

}