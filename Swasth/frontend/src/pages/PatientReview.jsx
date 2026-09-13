import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/api";

const PatientReview = () => {
  const { state } = useLocation();
  const patient = state?.patient;
  const navigate = useNavigate();

  const [details, setDetails] = useState({
    doctor: "",
    room: "",
    diagnosis: "",
    bloodPressure: "",
    weight: "",
    sugarLevel: "",
  });

  const handleInput = (e) =>
    setDetails({
      ...details,
      [e.target.name]: e.target.value,
    });

  const handleGenerateSlip = async () => {
    if (!patient?._id) {
      alert("Patient information is missing.");
      return;
    }

    try {
      const token = localStorage.getItem("jwt");

      const res = await api.put(
        `/patients/${patient._id}`,
        details,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate("/slip", {
        state: {
          patient: {
            ...patient,
            ...details,
          },
          qr: res.data.qrCode,
        },
      });
    } catch (error) {
      console.error("Patient update error:", error);

      alert(
        error.response?.data?.message ||
          "Update Failed"
      );
    }
  };

  return (
    <div className="p-10 max-w-lg mx-auto bg-white shadow-xl rounded-xl">
      <h2 className="text-xl font-bold text-center">
        Patient Summary
      </h2>

      <div className="border p-3 rounded mt-3">
        <p>
          <b>Name:</b> {patient?.name || "-"}
        </p>

        <p>
          <b>Father Name:</b>{" "}
          {patient?.fatherName || "-"}
        </p>

        <p>
          <b>Age:</b> {patient?.age || "-"}
        </p>

        <p>
          <b>Gender:</b>{" "}
          {patient?.gender || "-"}
        </p>

        <p>
          <b>Phone:</b>{" "}
          {patient?.phone ||
            patient?.mobile ||
            "-"}
        </p>
      </div>

      {/* Additional typed fields */}

      <input
        name="doctor"
        value={details.doctor}
        className="input mt-3"
        placeholder="Doctor"
        onChange={handleInput}
      />

      <input
        name="room"
        value={details.room}
        className="input mt-3"
        placeholder="Room No"
        onChange={handleInput}
      />

      <input
        name="diagnosis"
        value={details.diagnosis}
        className="input mt-3"
        placeholder="Diagnosis"
        onChange={handleInput}
      />

      <input
        name="bloodPressure"
        value={details.bloodPressure}
        className="input mt-3"
        placeholder="Blood Pressure"
        onChange={handleInput}
      />

      <input
        name="weight"
        value={details.weight}
        className="input mt-3"
        placeholder="Weight"
        onChange={handleInput}
      />

      <input
        name="sugarLevel"
        value={details.sugarLevel}
        className="input mt-3"
        placeholder="Sugar Level"
        onChange={handleInput}
      />

      <button
        onClick={handleGenerateSlip}
        className="w-full bg-indigo-600 text-white py-2 rounded mt-3"
      >
        Generate Slip
      </button>
    </div>
  );
};

export default PatientReview;