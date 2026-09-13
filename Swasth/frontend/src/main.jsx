import React from "react";
import { createRoot } from 'react-dom/client'
import App from "./App";
import "./index.css";
import api from "./api/api";   
import { AuthProvider } from './context/AuthContext'

const token = localStorage.getItem("token");
api.setToken(token);

createRoot(document.getElementById('root')).render(
  <React.StrictMode>

      <AuthProvider>
        <App />
      </AuthProvider>

  </React.StrictMode>
)