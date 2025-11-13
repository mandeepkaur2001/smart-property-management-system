// // src/api/axios.js
// import axios from "axios";

// const instance = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_BASE,
//   withCredentials: true,
// });

// instance.interceptors.response.use(
//   res => res,
//   err => {
//     console.error("API Error:", err.response?.data || err.message);
//     return Promise.reject(err);
//   }
// );

// export default instance;


// src/lib/axios.js
import axios from "axios";

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE, // ✅ from .env.local
  withCredentials: true, // for cookies if needed
});

export default instance;
