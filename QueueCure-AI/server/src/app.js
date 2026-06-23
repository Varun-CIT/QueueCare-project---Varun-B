const express = require("express");
const cors = require("cors");

const patientRoutes = require("./routes/patientRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/patients", patientRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "QueueCure AI Backend Running",
  });
});

module.exports = app;