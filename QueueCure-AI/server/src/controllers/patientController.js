const { emitQueueUpdate } = require("../services/socketService");

const {
  addConsultationTime,
  calculateWaitTime,
  getAverageConsultationTime,
} = require("../services/predictionService");

let currentToken = 3;

// Used for automatic consultation time calculation
let lastNextButtonClick = null;

let patients = [
  {
    token: "QC001",
    name: "Rahul",
    age: 35,
    weight: "72 kg",
    doctor: "Dr. Sarah Johnson",
    consultationType: "General",
    status: "Consulting",
    joinedAt: new Date(),
    estimatedWait: 0,
    actualConsultationTime: null,
  },
  {
    token: "QC002",
    name: "Priya",
    age: 29,
    weight: "58 kg",
    doctor: "Dr. Michael Chen",
    consultationType: "General",
    status: "Waiting",
    joinedAt: new Date(),
    estimatedWait: 5,
    actualConsultationTime: null,
  },
  {
    token: "QC003",
    name: "Kumar",
    age: 42,
    weight: "81 kg",
    doctor: "Dr. Emma Williams",
    consultationType: "General",
    status: "Waiting",
    joinedAt: new Date(),
    estimatedWait: 10,
    actualConsultationTime: null,
  },
];

// --------------------------------------
// Recalculate ETA
// --------------------------------------

const updateEstimatedWaitTimes = () => {
  let position = 1;

  patients.forEach((patient) => {
    if (patient.status === "Waiting") {
      patient.estimatedWait = calculateWaitTime(position);
      position++;
    } else if (patient.status === "Consulting") {
      patient.estimatedWait = 0;
    }
  });
};

// --------------------------------------
// GET /api/patients
// --------------------------------------

const getPatients = (req, res) => {
  updateEstimatedWaitTimes();

  res.json({
    averageConsultationTime: getAverageConsultationTime(),
    patients,
  });
};

// --------------------------------------
// POST /api/patients
// --------------------------------------

const addPatient = (req, res) => {
  const {
    name,
    age = "",
    weight = "",
    doctor = "",
    consultationType = "General",
  } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({
      message: "Patient name is required",
    });
  }

  currentToken++;

  const waitingPatients = patients.filter(
    (patient) => patient.status === "Waiting"
  );

  const patient = {
    token: `QC${String(currentToken).padStart(3, "0")}`,
    name: name.trim(),
    age,
    weight,
    doctor,
    consultationType,
    status: "Waiting",
    joinedAt: new Date(),
    estimatedWait: calculateWaitTime(waitingPatients.length + 1),
    actualConsultationTime: null,
  };

  patients.push(patient);

  updateEstimatedWaitTimes();

  emitQueueUpdate({
    averageConsultationTime: getAverageConsultationTime(),
    patients,
  });

  res.status(201).json(patient);
};

// --------------------------------------
// POST /api/patients/next
// --------------------------------------

const callNext = (req, res) => {
  const now = Date.now();

  // AI automatically learns consultation duration
  if (lastNextButtonClick) {
    const durationSeconds = Math.floor(
      (now - lastNextButtonClick) / 1000
    );

    if (durationSeconds > 0) {
      addConsultationTime(durationSeconds);
    }
  }

  lastNextButtonClick = now;

  // Complete current consultation

  const consultingPatient = patients.find(
    (patient) => patient.status === "Consulting"
  );

  if (consultingPatient) {
    consultingPatient.status = "Completed";
    consultingPatient.actualConsultationTime =
      getAverageConsultationTime();
  }

  // Call next patient

  const nextPatient = patients.find(
    (patient) => patient.status === "Waiting"
  );

  if (nextPatient) {
    nextPatient.status = "Consulting";
    nextPatient.estimatedWait = 0;
  }

  updateEstimatedWaitTimes();

  emitQueueUpdate({
    averageConsultationTime: getAverageConsultationTime(),
    patients,
  });

  res.json({
    message: "Next patient called successfully",
    averageConsultationTime: getAverageConsultationTime(),
    patients,
  });
};

// --------------------------------------
// POST /api/patients/finish
// (Optional - kept for compatibility)
// --------------------------------------

const finishConsultation = (req, res) => {
  updateEstimatedWaitTimes();

  emitQueueUpdate({
    averageConsultationTime: getAverageConsultationTime(),
    patients,
  });

  res.json({
    message: "Consultation completed",
    averageConsultationTime: getAverageConsultationTime(),
    patients,
  });
};

module.exports = {
  getPatients,
  addPatient,
  callNext,
  finishConsultation,
};