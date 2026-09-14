
import React, { useState } from "react";
import api from "../api/api";
import QrReader from "../../../Admin/src/components/QrReader";
import PatientSlip from "../components/PatientSlip";

const Scan = () => {
  const [patient, setPatient] = useState(null);
  const [mode, setMode] = useState(null);

  const [adhar_no, setAadhaar] = useState("");
  const [scanning, setScanning] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [qrCode, setQrCode] = useState(null);
  const [appointment, setAppointment] = useState(null);

  const [doctors, setDoctors] = useState([]);

  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [staffData, setStaffData] = useState({
    diagnosis: "",
    doctor: "",
    doctorId: "",
    room: "",
  });

  const hospitalCode =
    localStorage.getItem("hospitalCode") || "";

  const hospitalName =
    localStorage.getItem("hospitalName") ||
    "Unknown Hospital";

  /* =====================================================
     NORMALIZE DOCTOR RESPONSE
  ===================================================== */

  const normalizeDoctors = (responseData) => {
    if (Array.isArray(responseData)) {
      return responseData;
    }

    if (Array.isArray(responseData?.doctors)) {
      return responseData.doctors;
    }

    if (Array.isArray(responseData?.data)) {
      return responseData.data;
    }

    if (Array.isArray(responseData?.results)) {
      return responseData.results;
    }

    return [];
  };

  /* =====================================================
     GET PATIENT BY QR
  ===================================================== */

  const handleScan = async (data) => {
    if (!data) return;

    try {
      setError("");
      setMessage("");
      setScanning(false);

      const qrValue = String(data).trim();

      const res = await api.get(
        `/patients/${encodeURIComponent(qrValue)}`
      );

      setPatient(res.data);
      setMode("view");

      setStaffData({
        diagnosis: "",
        doctor: "",
        doctorId: "",
        room: "",
      });

      setDoctors([]);
    } catch (err) {
      console.error("QR patient fetch error:", err);

      setError(
        err.response?.data?.message ||
          "Invalid QR or patient not found."
      );

      setScanning(false);
    }
  };

  /* =====================================================
     QR ERROR
  ===================================================== */

  const handleError = (err) => {
    console.error("QR Scanner Error:", err);
  };

  /* =====================================================
     SEARCH PATIENT BY AADHAAR
  ===================================================== */

  const handleAadhaarSearch = async () => {
    const aadhaar = adhar_no.trim();

    if (!aadhaar) {
      setError("Please enter Aadhaar number.");
      return;
    }

    try {
      setError("");
      setMessage("");

      const res = await api.get(
        `/patients/aadhar/${encodeURIComponent(aadhaar)}`
      );

      setPatient(res.data);
      setMode("view");

      setStaffData({
        diagnosis: "",
        doctor: "",
        doctorId: "",
        room: "",
      });

      setDoctors([]);
    } catch (err) {
      console.error("Aadhaar search error:", err);

      setError(
        err.response?.data?.message ||
          "Patient not found with this Aadhaar number."
      );
    }
  };

  /* =====================================================
     FETCH DOCTORS AFTER DEPARTMENT SELECTION
  ===================================================== */

  const handleDiagnosisChange = async (e) => {
    const value = e.target.value;

    setStaffData({
      diagnosis: value,
      doctor: "",
      doctorId: "",
      room: "",
    });

    setDoctors([]);
    setError("");
    setMessage("");

    if (!value) {
      return;
    }

    try {
      setLoadingDoctors(true);

      const res = await api.get(
        "/doctors/public",
        {
          params: {
            specialization: value,
            hospitalCode: hospitalCode || undefined,
          },
        }
      );

      console.log(
        "PUBLIC DOCTORS RESPONSE:",
        res.data
      );

      const normalizedDoctors =
        normalizeDoctors(res.data);

      console.log(
        "NORMALIZED DOCTORS:",
        normalizedDoctors
      );

      setDoctors(normalizedDoctors);
    } catch (err) {
      console.error("Doctor fetch error:", err);

      setDoctors([]);

      setError(
        err.response?.data?.message ||
          "Unable to load doctors."
      );
    } finally {
      setLoadingDoctors(false);
    }
  };

  /* =====================================================
     SELECT DOCTOR
  ===================================================== */

  const handleDoctorChange = (e) => {
    const selectedId = e.target.value;

    const selectedDoctor = doctors.find(
      (doc) =>
        String(doc._id) === String(selectedId)
    );

    if (!selectedDoctor) {
      setStaffData((prev) => ({
        ...prev,
        doctor: "",
        doctorId: "",
        room: "",
      }));

      return;
    }

    setStaffData((prev) => ({
      ...prev,
      doctor: selectedDoctor.name || "",
      doctorId: selectedDoctor._id || "",
      room:
        selectedDoctor.roomNumber ||
        selectedDoctor.room ||
        "",
    }));
  };

  /* =====================================================
     GENERATE APPOINTMENT
  ===================================================== */

  const handleGenerate = async () => {
    if (!patient) {
      setError("Patient information is missing.");
      return;
    }

    if (!staffData.diagnosis) {
      setError("Please select a department.");
      return;
    }

    if (!staffData.doctorId) {
      setError("Please select a doctor.");
      return;
    }

    try {
      setGenerating(true);
      setError("");
      setMessage("");

      const payload = {
        department: staffData.diagnosis,

        doctorId: staffData.doctorId,

        doctor: staffData.doctor,

        roomNo: staffData.room,

        disease: staffData.diagnosis,

        hospitalCode: hospitalCode,

        adhar_no: patient.adhar_no,
      };

      console.log(
        "CREATE APPOINTMENT PAYLOAD:",
        payload
      );

      const res = await api.post(
        `/patients/${patient._id}/appointment`,
        payload
      );

      console.log(
        "APPOINTMENT RESPONSE:",
        res.data
      );

      const createdAppointment =
        res.data?.appointment ||
        res.data?.data ||
        res.data;

      setAppointment(createdAppointment);

      setMessage(
        "Appointment generated successfully."
      );

      setQrCode(
        res.data?.qrCode ||
          createdAppointment?.qrCode ||
          patient.qrCode ||
          null
      );
    } catch (err) {
      console.error(
        "Appointment generation error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to generate appointment."
      );
    } finally {
      setGenerating(false);
    }
  };

  /* =====================================================
     RESET
  ===================================================== */

  const handleReset = () => {
    setPatient(null);
    setMode(null);

    setAadhaar("");

    setScanning(false);

    setMessage("");
    setError("");

    setQrCode(null);
    setAppointment(null);

    setDoctors([]);

    setStaffData({
      diagnosis: "",
      doctor: "",
      doctorId: "",
      room: "",
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6 space-y-6">

      {/* =================================================
          MAIN CARD
      ================================================= */}

      <div className="bg-white p-6 shadow-xl rounded-2xl w-full max-w-md">

        <h2 className="text-2xl font-bold mb-2 text-center">
          Patient Appointment
        </h2>

        <p className="text-sm text-gray-500 text-center mb-5">
          Scan patient QR or search using Aadhaar number
        </p>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* =================================================
            SUCCESS
        ================================================= */}

        {message && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-600 p-3 rounded-lg text-sm">
            {message}
          </div>
        )}

        {/* =================================================
            INITIAL OPTIONS
        ================================================= */}

        {!mode && (
          <div className="flex flex-col gap-3">

            <button
              onClick={() => {
                setMode("qr");
                setError("");
              }}
              className="bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-semibold"
            >
              Scan Patient QR
            </button>

            <button
              onClick={() => {
                setMode("aadhaar");
                setError("");
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold"
            >
              Search by Aadhaar
            </button>

          </div>
        )}

        {/* =================================================
            QR MODE
        ================================================= */}

        {mode === "qr" && !patient && (
          <div className="mt-4">

            {!scanning && (
              <div className="space-y-3">

                <button
                  onClick={() => {
                    setScanning(true);
                    setError("");
                  }}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-lg font-semibold"
                >
                  Start QR Scanner
                </button>

                <button
                  onClick={handleReset}
                  className="w-full bg-gray-200 hover:bg-gray-300 py-2.5 rounded-lg font-semibold"
                >
                  Back
                </button>

              </div>
            )}

            {scanning && (
              <div className="space-y-3">

                <QrReader
                  delay={0}
                  onError={handleError}
                  onScan={handleScan}
                />

                <button
                  onClick={() => setScanning(false)}
                  className="w-full bg-gray-200 hover:bg-gray-300 py-2 rounded-lg"
                >
                  Stop Scanner
                </button>

              </div>
            )}

          </div>
        )}

        {/* =================================================
            AADHAAR MODE
        ================================================= */}

        {mode === "aadhaar" && !patient && (
          <div className="mt-4 space-y-3">

            <label className="block text-sm font-semibold text-gray-700">
              Aadhaar Number
            </label>

            <input
              type="text"
              value={adhar_no}
              onChange={(e) =>
                setAadhaar(e.target.value)
              }
              placeholder="Enter Aadhaar number"
              maxLength={12}
              className="w-full border px-3 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={handleAadhaarSearch}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold"
            >
              Search Patient
            </button>

            <button
              onClick={handleReset}
              className="w-full bg-gray-200 hover:bg-gray-300 py-2.5 rounded-lg font-semibold"
            >
              Back
            </button>

          </div>
        )}

        {/* =================================================
            PATIENT FOUND
        ================================================= */}

        {mode === "view" && patient && (
          <div className="mt-4 space-y-4">

            {/* Patient Details */}

            <div className="bg-gray-50 p-4 rounded-xl border">

              <h3 className="font-bold text-gray-800 mb-3">
                Patient Information
              </h3>

              <div className="space-y-1.5 text-sm">

                <p>
                  <b>Name:</b>{" "}
                  {patient.name || "-"}
                </p>

                <p>
                  <b>Age:</b>{" "}
                  {patient.age || "-"}
                </p>

                <p>
                  <b>Gender:</b>{" "}
                  {patient.gender || "-"}
                </p>

                <p>
                  <b>Aadhaar:</b>{" "}
                  {patient.adhar_no || "-"}
                </p>

                <p>
                  <b>Phone:</b>{" "}
                  {patient.phone || "-"}
                </p>

              </div>

            </div>

            {/* =================================================
                DEPARTMENT
            ================================================= */}

            <div>

              <label className="block text-sm font-semibold mb-1">
                Select Department
              </label>

              <select
                value={staffData.diagnosis}
                onChange={handleDiagnosisChange}
                className="w-full border px-3 py-2.5 rounded-lg"
              >

                <option value="">
                  Select Department
                </option>

                <option value="Cardiology">
                  Cardiology
                </option>

                <option value="Orthopedic">
                  Orthopedic
                </option>

                <option value="Neurology">
                  Neurology
                </option>

                <option value="Pediatrics">
                  Pediatrics
                </option>

                <option value="General Medicine">
                  General Medicine
                </option>

              </select>

            </div>

            {/* =================================================
                DOCTOR
            ================================================= */}

            <div>

              <label className="block text-sm font-semibold mb-1">
                Select Doctor
              </label>

              <select
                value={staffData.doctorId}
                onChange={handleDoctorChange}
                disabled={
                  !staffData.diagnosis ||
                  loadingDoctors
                }
                className="w-full border px-3 py-2.5 rounded-lg disabled:bg-gray-100"
              >

                <option value="">
                  {loadingDoctors
                    ? "Loading doctors..."
                    : "Select Doctor"}
                </option>

                {doctors.map((doc) => (
                  <option
                    key={doc._id}
                    value={doc._id}
                  >
                    {doc.name}
                    {doc.active === false
                      ? " (Inactive)"
                      : ""}
                  </option>
                ))}

              </select>

              {!loadingDoctors &&
                staffData.diagnosis &&
                doctors.length === 0 && (
                  <p className="text-sm text-red-500 mt-1">
                    No doctors available for this department.
                  </p>
                )}

            </div>

            {/* =================================================
                ROOM
            ================================================= */}

            <div>

              <label className="block text-sm font-semibold mb-1">
                Room Number
              </label>

              <input
                value={staffData.room}
                readOnly
                placeholder="Room Number"
                className="w-full border px-3 py-2.5 rounded-lg bg-gray-100"
              />

            </div>

            {/* =================================================
                GENERATE
            ================================================= */}

            <button
              onClick={handleGenerate}
              disabled={
                generating ||
                !staffData.diagnosis ||
                !staffData.doctorId
              }
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white py-2.5 rounded-lg font-semibold"
            >
              {generating
                ? "Generating Appointment..."
                : "Generate Appointment"}
            </button>

            {/* =================================================
                RESET
            ================================================= */}

            <button
              onClick={handleReset}
              className="w-full bg-gray-300 hover:bg-gray-400 py-2.5 rounded-lg font-semibold"
            >
              New Patient
            </button>

          </div>
        )}

      </div>

      {/* =====================================================
          PATIENT SLIP
      ===================================================== */}

      {patient && message && (
        <PatientSlip
          patient={{
            ...patient,
            doctor: staffData.doctor,
            diagnosis: staffData.diagnosis,
            room: staffData.room,
          }}
          appointment={appointment}
          hospitalName={hospitalName}
          qrCodeUrl={qrCode}
        />
      )}

    </div>
  );
};

export default Scan;

