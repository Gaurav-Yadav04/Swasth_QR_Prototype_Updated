import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import DoctorDashboard from "./pages/DoctorDashboard";
import HospitalDetails from "./pages/HospitalDetails";
import ManageDoctors from "./pages/ManageDoctors";
import HospitalKiosk from "./pages/HospitalKiosk";

function HomeRedirect() {
  const doctorToken = localStorage.getItem("doctorToken");
  const hospitalToken = localStorage.getItem("hospitalToken");

  // Doctor already logged in
  if (doctorToken) {
    return <Navigate to="/doctor/dashboard" replace />;
  }

  // Hospital already logged in
  if (hospitalToken) {
    return <Navigate to="/hospital-details" replace />;
  }

  // No login
  return <Login />;
}

function App() {
  return (
    <Routes>
      {/* ==================================================
          HOME / LOGIN
      ================================================== */}

      <Route path="/" element={<HomeRedirect />} />

      {/* ==================================================
          DOCTOR
      ================================================== */}

      <Route
        path="/doctor/dashboard"
        element={<DoctorDashboard />}
      />

      {/* ==================================================
          HOSPITAL
      ================================================== */}

      <Route
        path="/hospital-details"
        element={<HospitalDetails />}
      />

      {/* ==================================================
          HOSPITAL KIOSK
      ================================================== */}

      <Route
        path="/hospitalKisok"
        element={<HospitalKiosk />}
      />

      {/* ==================================================
          MANAGE DOCTORS
      ================================================== */}

      <Route
        path="/manage-doctors"
        element={<ManageDoctors />}
      />

      {/* ==================================================
          UNKNOWN ROUTE
      ================================================== */}

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}

export default App;