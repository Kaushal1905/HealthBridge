import axios from "axios";

const BASE_URL = (process.env.REACT_APP_API_URL || "http://localhost:5001") + "/api";

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const registerPatient = async (formData) => {
  const response = await api.post("/patients/register", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const getAllPatients = async (page = 1, limit = 20) => {
  const response = await api.get(`/patients/?page=${page}&limit=${limit}`);
  return response.data;
};

export const getPatientById = async (patientId) => {
  const response = await api.get(`/patients/${patientId}`);
  return response.data;
};

export const searchPatient = async (query) => {
  const response = await api.get(`/patients/search?q=${encodeURIComponent(query)}`);
  return response.data;
};

export const updatePatient = async (patientId, updateData) => {
  const response = await api.put(`/patients/${patientId}`, updateData);
  return response.data;
};

export const deletePatient = async (patientId) => {
  const response = await api.delete(`/patients/${patientId}`);
  return response.data;
};

export const getPatientBasicInfo = async (patientId) => {
  const response = await api.get(`/patients/${patientId}/basic`);
  return response.data;
};
