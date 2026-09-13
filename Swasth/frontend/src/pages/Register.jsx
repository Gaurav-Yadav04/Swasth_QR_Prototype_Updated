
import React, { useState } from "react";
import api from "../api/api";
import PatientSlip from "../components/PatientSlip";

const Register = () => {
  const [mode, setMode] = useState("login");

  const [patient, setPatient] = useState({
    name: "",
    fatherName: "",
    age: "",
    gender: "",
    phone: "",
    address: "",
    adhar_no: "",
  });

  const [loginData, setLoginData] = useState({
    name: "",
    adhar_no: "",
  });

  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handlePatientChange = (e) => {
    setPatient({
      ...patient,
      [e.target.name]: e.target.value,
    });
  };

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const savePatientSession = (patientData, token) => {
    localStorage.setItem("swasth_patient_token", token);
    localStorage.setItem("token", token);
    localStorage.setItem("swasth_patient_id", patientData._id);
    localStorage.setItem(
      "swasth_patient_profile",
      JSON.stringify(patientData)
    );
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await api.post(
        "/patients/register",
        patient
      );

      const registeredPatient = res.data.patient;
      const token = res.data.token;

      savePatientSession(registeredPatient, token);

      setQrCode(registeredPatient.qrCode);

      setSuccess(
        "Registration successful. You are now logged in."
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.error ||
          "Patient registration failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await api.post(
        "/patients/login",
        loginData
      );

      const loggedInPatient = res.data.patient;
      const token = res.data.token;

      savePatientSession(loggedInPatient, token);

      setSuccess("Login successful.");

      setTimeout(() => {
        window.location.href = "/profile";
      }, 700);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.error ||
          "Login failed. Please check your details."
      );
    } finally {
      setLoading(false);
    }
  };

  const changeMode = (newMode) => {
    setMode(newMode);
    setError("");
    setSuccess("");
    setQrCode(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto flex max-w-5xl flex-col items-start justify-center gap-6 lg:flex-row">

        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-white p-6 shadow-lg">

            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Swasth QR
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Patient Account
              </p>
            </div>

            <div className="mb-6 flex rounded-xl bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => changeMode("login")}
                className={`w-1/2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                  mode === "login"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500"
                }`}
              >
                Login
              </button>

              <button
                type="button"
                onClick={() => changeMode("register")}
                className={`w-1/2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                  mode === "register"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500"
                }`}
              >
                Register
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-600">
                {success}
              </div>
            )}

            {mode === "login" ? (
              <form
                onSubmit={handleLogin}
                className="space-y-4"
              >
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={loginData.name}
                    onChange={handleLoginChange}
                    placeholder="Enter your name"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Aadhaar Number
                  </label>

                  <input
                    type="text"
                    name="adhar_no"
                    value={loginData.adhar_no}
                    onChange={handleLoginChange}
                    placeholder="Enter Aadhaar number"
                    maxLength="12"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-blue-600 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {loading ? "Logging in..." : "Login"}
                </button>

                <p className="text-center text-sm text-gray-500">
                  New patient?{" "}
                  <button
                    type="button"
                    onClick={() => changeMode("register")}
                    className="font-semibold text-blue-600 hover:underline"
                  >
                    Create an account
                  </button>
                </p>
              </form>
            ) : (
              <form
                onSubmit={handleRegister}
                className="space-y-4"
              >
                <h2 className="text-xl font-bold text-gray-900">
                  📝 Register Patient
                </h2>

                <input
                  name="name"
                  placeholder="Name"
                  value={patient.name}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
                  onChange={handlePatientChange}
                  required
                />

                <input
                  name="fatherName"
                  placeholder="Father Name"
                  value={patient.fatherName}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
                  onChange={handlePatientChange}
                  required
                />

                <input
                  name="adhar_no"
                  placeholder="Aadhaar No."
                  value={patient.adhar_no}
                  maxLength="12"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
                  onChange={handlePatientChange}
                  required
                />

                <input
                  name="age"
                  type="number"
                  placeholder="Age"
                  value={patient.age}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
                  onChange={handlePatientChange}
                  required
                />

                <input
                  name="gender"
                  placeholder="Gender"
                  value={patient.gender}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
                  onChange={handlePatientChange}
                  required
                />

                <input
                  name="phone"
                  placeholder="Phone"
                  value={patient.phone}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
                  onChange={handlePatientChange}
                  required
                />

                <input
                  name="address"
                  placeholder="Address"
                  value={patient.address}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
                  onChange={handlePatientChange}
                  required
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-blue-600 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {loading
                    ? "Registering..."
                    : "Register & Generate QR"}
                </button>

                <p className="text-center text-sm text-gray-500">
                  Already registered?{" "}
                  <button
                    type="button"
                    onClick={() => changeMode("login")}
                    className="font-semibold text-blue-600 hover:underline"
                  >
                    Login here
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>

        {qrCode && (
          <div className="w-full max-w-md">
            <PatientSlip
              patient={patient}
              qrCodeUrl={qrCode}
              hospitalName="--"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;

