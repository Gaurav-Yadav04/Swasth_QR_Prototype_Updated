import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const SlipPreview = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const hospitalName = localStorage.getItem("hospitalName");

  if (!state || !state.patient || !state.appointment) {
    return (
      <div className="text-center mt-10">
        <p>No patient or appointment data found</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 bg-gray-300 px-4 py-2 rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  const { patient, appointment } = state;
  const snap = appointment.patientSnapshot;

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center p-6">
      <div className="bg-white p-6 w-full max-w-lg rounded-xl shadow-lg print:shadow-none">

        {/* Hospital Header */}
        <h2 className="text-xl font-bold text-center">
          🏥 {hospitalName || "Government Hospital"}
        </h2>
        <p className="text-center text-sm mb-4">
          OPD Patient Slip
        </p>

        {/* Patient Basic Info */}
        <div className="text-sm space-y-1 border p-3 rounded-lg">
          <p><b>Name:</b> {patient.name}</p>
          <p><b>Father Name:</b> {patient.fatherName}</p>
          <p><b>Age / Gender:</b> {patient.age} / {patient.gender}</p>
          <p><b>Aadhaar:</b> {patient.adhar_no}</p>
          <p><b>Mobile:</b> {patient.phone}</p>
          <p><b>Address:</b> {patient.address}</p>
          <p>
            <b>Date:</b>{" "}
            {new Date(snap.visitDate).toLocaleDateString()}
          </p>
        </div>

        {/* OPD Details */}
        <div className="text-sm space-y-1 border p-3 rounded-lg mt-3">
          <p><b>Department:</b> {snap.department}</p>
          <p><b>Doctor:</b> {snap.doctor}</p>
          <p><b>Room No:</b> {snap.roomNo}</p>
          <p><b>Diagnosis:</b> {snap.disease}</p>
          <p><b>Token Number:</b> {snap.tokenNumber}</p>
          <p><b>Status:</b> {snap.status}</p>
        </div>

        {/* QR Code */}
        {patient.qrCode && (
          <div className="flex justify-center mt-4">
            <img
              src={patient.qrCode}
              alt="Patient QR"
              className="w-36 h-36"
            />
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 mt-6 print:hidden">
          <button
            onClick={() => window.print()}
            className="w-full bg-green-600 text-white py-2 rounded-lg"
          >
            🖨 Print Slip
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full bg-gray-300 py-2 rounded-lg"
          >
            ⬅ Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default SlipPreview;
