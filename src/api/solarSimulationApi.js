import axios from "axios";

const API_URL = "https://energy-app.space/api/api/v1/solar_system";
// const API_URL = "http://localhost:8000/api/v1/solar_system";

export const startSimulation = async (params) => {
  const response = await axios.post(`${API_URL}/`, params);
  return response.data;
};

export const getSimulationStatus = async (taskId) => {
  const response = await axios.get(`${API_URL}/${taskId}`);
  return response.data;
};

export const getSimulationResult = async (taskId) => {
  const response = await axios.get(`${API_URL}/${taskId}`);
  return response.data;
};
