import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import HospitalDashboard from "./pages/HospitalDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import HospitalDetails from "./pages/HospitalDetails";
import ManageDoctors from "./pages/ManageDoctors";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route
        path="hospital-dashboard"
        element={<HospitalDashboard />}
      />

      <Route
        path="/doctor/dashboard"
        element={<DoctorDashboard />}
      />
      <Route
        path="/hospital-details"
        element={<HospitalDetails />}
      />
      hospital-dashboard
      <Route
        path="/manage-doctors"
        element={<ManageDoctors />}
      />

    </Routes>
  );
}

export default App;