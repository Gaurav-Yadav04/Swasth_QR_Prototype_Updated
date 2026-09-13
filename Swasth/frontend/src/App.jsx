import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Scan from "./pages/Scan";
import AppointmentPage from "./pages/AppointmentPage";
import PatientQueue from "./pages/PatientQueue";
import HospitalKiosk from "./pages/HospitalKiosk";


import PatientReview from "./pages/PatientReview";
import Slip from "./pages/Slip";
import SlipPreview from "./pages/SlipPreview";
import "./App.css";
import Profile from "./pages/Profile";
import Footer from "./components/Footer";
import AmbulancePrototype from './pages/AmbulancePrototype';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/patient" element={<PatientQueue />} />
        <Route path="/kiosk" element={<HospitalKiosk />} />
        <Route path="/register" element={<Register />} />
        <Route path="/scan" element={<Scan />} />
        <Route path="/patient-review" element={<PatientReview />} />
        <Route path="/slip-preview" element={<SlipPreview />} />
        <Route path="/slip" element={<Slip />} />
        <Route path="/appo" element={<AppointmentPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/ambulance" element={<AmbulancePrototype />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
