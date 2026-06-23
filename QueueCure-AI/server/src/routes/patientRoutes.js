const express = require("express");

const router = express.Router();

const {
  getPatients,
  addPatient,
  callNext,
  finishConsultation,
} = require("../controllers/patientController");

// Get all patients
router.get("/", getPatients);

// Add patient
router.post("/", addPatient);

// Call next patient
router.post("/next", callNext);

// Doctor finishes consultation (AI learns)
router.post("/finish", finishConsultation);

module.exports = router;