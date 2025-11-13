// // src/lib/axios.js
// import axios from "axios";

// const api = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
//   withCredentials: true,
// });

// export default api;


// src/lib/axios.js
import axios from "axios";

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE, // ✅ from .env.local
  withCredentials: true, // for cookies if needed
});

export default instance;
