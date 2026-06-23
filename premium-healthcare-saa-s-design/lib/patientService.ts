import { api } from "./api";

export interface Patient {
  token: string;
  name: string;
  age: string | number;
  weight: string;
  status: string;
  estimatedWait: number;
}

export const patientService = {
  async getPatients() {
    const { data } = await api.get("/patients");
    return data;
  },

 async addPatient(patient: {
  name: string;
  age: string;
  weight: string;
  doctor: string;
}) {
    const { data } = await api.post("/patients", {
      ...patient,
      consultationType: "General",
    });

    return data;
  },

  async callNext() {
    const { data } = await api.post("/patients/next");
    return data;
  },
};