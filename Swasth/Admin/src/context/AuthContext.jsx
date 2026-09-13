import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [doctor, setDoctor] = useState(
    JSON.parse(localStorage.getItem("doctor")) || null
  );

  const [hospital, setHospital] = useState(
    JSON.parse(localStorage.getItem("hospital")) || null
  );

  const navigate = useNavigate();

  // ================================
  // DOCTOR LOGIN
  // ================================
  const loginDoctor = async (formData) => {
    try {
      const res = await api.post("/doctors/login", formData);

      setDoctor(res.data.doctor);

      localStorage.setItem(
        "doctor",
        JSON.stringify(res.data.doctor)
      );

      localStorage.setItem(
        "doctorToken",
        res.data.token
      );

      // Attach doctor token to api
      api.setToken(res.data.token);

      // Remove hospital session
      localStorage.removeItem("hospital");
      localStorage.removeItem("hospitalToken");

      navigate("/doctor/dashboard");

      return res.data;
    } catch (error) {
      throw error;
    }
  };

  // ================================
  // HOSPITAL LOGIN
  // ================================
  const loginHospital = async (formData) => {
    try {
      const res = await api.post("/hospital/login", formData);

      setHospital(res.data.hospital);

      localStorage.setItem(
        "hospital",
        JSON.stringify(res.data.hospital)
      );

      localStorage.setItem(
        "hospitalToken",
        res.data.token
      );

      // Attach hospital token to api
      api.setToken(res.data.token);

      // Remove doctor session
      localStorage.removeItem("doctor");
      localStorage.removeItem("doctorToken");

      navigate("/hospital-dashboard");

      return res.data;
    } catch (error) {
      throw error;
    }
  };

  // ================================
  // DOCTOR LOGOUT
  // ================================
  const logoutDoctor = () => {
    setDoctor(null);

    localStorage.removeItem("doctor");
    localStorage.removeItem("doctorToken");

    api.setToken(null);

    navigate("/");
  };

  // ================================
  // HOSPITAL LOGOUT
  // ================================
  const logoutHospital = () => {
    setHospital(null);

    localStorage.removeItem("hospital");
    localStorage.removeItem("hospitalToken");

    api.setToken(null);

    navigate("/");
  };

  return (
    <AuthContext.Provider
      value={{
        doctor,
        hospital,
        loginDoctor,
        loginHospital,
        logoutDoctor,
        logoutHospital,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);