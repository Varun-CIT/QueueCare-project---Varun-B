import { useEffect, useState } from "react";
import axios from "axios";
import socket from "../socket/socket";

export default function DisplayBoard() {
  const API = "http://localhost:5000/api/patients";

  const [patients, setPatients] = useState([]);
  const [averageTime, setAverageTime] = useState(5);

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

  const current = patients.find(
    (p) => p.status === "Consulting"
  );

  const next = patients.find(
    (p) => p.status === "Waiting"
  );

  return (
    <div
      style={{
        background: "#0f172a",
        color: "white",
        minHeight: "100vh",
        textAlign: "center",
        padding: "40px",
      }}
    >
      <h1 style={{ fontSize: 60 }}>
        🏥 QueueCure AI
      </h1>

      <h2>NOW SERVING</h2>

      <h1 style={{ fontSize: 90 }}>
        {current?.token || "--"}
      </h1>

      <h2>{current?.name}</h2>

      <br />

      <h2>NEXT</h2>

      <h1>{next?.token || "--"}</h1>

      <h3>
        Estimated Wait : {next?.estimatedWait || 0} mins
      </h3>

      <br />

      <h3>
        🤖 Adaptive AI ETA : {averageTime} mins
      </h3>
    </div>
  );
}