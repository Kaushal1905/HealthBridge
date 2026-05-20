import axios from "axios";

const BASE_URL = (process.env.REACT_APP_API_URL || "http://localhost:5001") + "/api";

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getQueue = async () => {
  const response = await api.get("/queue/list");
  return response.data;
};

export const addToQueue = async (patientId, name, priority = "normal") => {
  const response = await api.post("/queue/add", { patient_id: patientId, name, priority });
  return response.data;
};

export const callNext = async () => {
  const response = await api.post("/queue/next");
  return response.data;
};
