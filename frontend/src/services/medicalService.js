import axios from "axios";

const BASE_URL = (process.env.REACT_APP_API_URL || "http://localhost:5001") + "/api";

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getPatientHistory = async (patientId) => {
  const response = await api.get(`/medical/history/${patientId}`);
  return response.data;
};

export const addMedicalRecord = async (data) => {
  const response = await api.post("/medical/add", data);
  return response.data;
};
