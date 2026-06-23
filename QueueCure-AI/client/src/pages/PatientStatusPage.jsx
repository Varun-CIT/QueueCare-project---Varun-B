import { useEffect, useState } from "react";
import axios from "axios";
import socket from "../socket/socket";
import Header from "../components/Header";
import "../styles/dashboard.css";
import { useParams } from "react-router-dom";

export default function PatientStatusPage() {

  const API = "http://localhost:5000/api/patients";

  const [patients, setPatients] = useState([]);
  const [averageTime, setAverageTime] = useState(5);

  const { token } = useParams(); // later this can come from URL

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

  const patient = patients.find(
    p => p.token === token
  );

  const patientsAhead = patients.filter(
    p =>
      p.status === "Waiting" &&
      p.token < token
  ).length;

  if (!patient) {

    return (
      <div className="container">
        <Header />
        <h2>Patient not found</h2>
      </div>
    );

  }

  return (

    <div className="container">

      <Header />

      <div className="card">

        <h2>📱 Patient Live Status</h2>

        <hr />

        <h1>{patient.token}</h1>

        <h2>{patient.name}</h2>

        <br />

        <p>

          Status :
          <strong> {patient.status}</strong>

        </p>

        <p>

          Patients Ahead :
          <strong> {patientsAhead}</strong>

        </p>

        <p>

          Estimated Wait :
          <strong> {patient.estimatedWait} mins</strong>

        </p>

        <p>

          AI Average :
          <strong> {averageTime} mins</strong>

        </p>

      </div>

    </div>

  );

}