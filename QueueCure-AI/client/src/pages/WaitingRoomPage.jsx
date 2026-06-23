import { useEffect, useState } from "react";
import axios from "axios";
import socket from "../socket/socket";

export default function WaitingRoomPage() {
  const [patients, setPatients] = useState([]);

  const API = "http://localhost:5000/api/patients";

  const loadPatients = async () => {
    const res = await axios.get(API);
    setPatients(res.data);
  };

  useEffect(() => {
    loadPatients();

    socket.on("queueUpdated", (updatedPatients) => {
      setPatients(updatedPatients);
    });

    return () => socket.off("queueUpdated");
  }, []);

  const current = patients.find(
    (p) => p.status === "Consulting"
  );

  const waiting = patients.filter(
    (p) => p.status === "Waiting"
  );

  return (
    <div
      style={{
        fontFamily: "Arial",
        padding: "40px",
        textAlign: "center",
      }}
    >
      <h1>🏥 QueueCure AI</h1>

      <h2>Waiting Room Display</h2>

      <hr />

      <h1 style={{ fontSize: "60px" }}>
        {current ? current.token : "--"}
      </h1>

      <h2>
        Now Serving
      </h2>

      <hr />

      <h2>
        Next Token
      </h2>

      <h1>
        {waiting[0]?.token || "--"}
      </h1>

      <h3>
        Estimated Wait :
        {" "}
        {waiting[0]?.estimatedWait || 0}
        {" "}
        mins
      </h3>

      <hr />

      <h3>
        Patients Waiting :
        {" "}
        {waiting.length}
      </h3>
    </div>
  );
}