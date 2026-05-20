import axios from "axios";

const BASE_URL = (process.env.REACT_APP_API_URL || "http://localhost:5001") + "/api";

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Emergency endpoint is public – no auth header needed
const publicApi = axios.create({ baseURL: BASE_URL });

export const uploadFingerprint = async (patientId, file) => {
  const formData = new FormData();
  formData.append("patient_id", patientId);
  formData.append("fingerprint", file);
  const response = await api.post("/fingerprint/upload-fingerprint", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const matchFingerprint = async (file) => {
  const formData = new FormData();
  formData.append("fingerprint", file);
  const response = await api.post("/fingerprint/match-fingerprint", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const emergencyIdentify = async (file) => {
  const formData = new FormData();
  formData.append("fingerprint", file);
  const response = await publicApi.post("/emergency/identify", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};
