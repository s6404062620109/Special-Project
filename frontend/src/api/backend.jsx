import axios from 'axios';

const backend = axios.create({
  baseURL: `http://${import.meta.env.VITE_DEV_URL}:${import.meta.env.VITE_BACKEND_PORT}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default backend;