import axios from "axios";

// Mendapatkan API key dan Base ID dari .env
const API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY;
const BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;

// Konfigurasi Axios
const airtable = axios.create({
  baseURL: `https://api.airtable.com/v0/${BASE_ID}`,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
  },
});

export default airtable;
