import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // สำคัญ! ให้ส่ง cookie (JWT) ไปด้วย
});

export default API;