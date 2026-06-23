import { BrowserRouter, Routes, Route } from "react-router-dom";

import ReceptionPage from "./pages/ReceptionPage";
import WaitingRoomPage from "./pages/WaitingRoomPage";
import DoctorDashboard from "./pages/DoctorDashboard";
import DisplayBoard from "./pages/DisplayBoard";
import PatientStatusPage from "./pages/PatientStatusPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ReceptionPage />} />

        <Route
          path="/waiting"
          element={<WaitingRoomPage />}
        />

        <Route
          path="/doctor"
          element={<DoctorDashboard />}
        />

        <Route
          path="/display"
          element={<DisplayBoard />}
        />

        <Route
  path="/patient/:token"
  element={<PatientStatusPage />}
/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;