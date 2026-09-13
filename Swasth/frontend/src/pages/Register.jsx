
import React, { useState } from "react";
import api from "../api/api";

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

  // ============================
  // REGISTER PATIENT
  // ============================
  const handleRegister = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await api.post("/patients/register", patient);

      const registeredPatient = res.data.patient;
      const token = res.data.token;

      // Save login session
      savePatientSession(registeredPatient, token);

      setSuccess("Registration successful. Redirecting...");

      // Redirect to Home page
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
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

  // ============================
  // LOGIN PATIENT
  // ============================
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

      // Save login session
      savePatientSession(loggedInPatient, token);

      setSuccess("Login successful.");

      // Redirect to Profile page
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
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto flex w-full max-w-md items-center justify-center">
        <div className="w-full">
          <div className="rounded-2xl bg-white p-6 shadow-lg sm:p-7">

            {/* Header */}
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Swasth QR
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Patient Account
              </p>
            </div>

            {/* Login / Register Toggle */}
            <div className="mb-6 flex rounded-xl bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => changeMode("login")}
                className={`w-1/2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                  mode === "login"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
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
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Register
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-600">
                {success}
              </div>
            )}

            {/* ============================
                LOGIN FORM
            ============================ */}
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
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                    inputMode="numeric"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-blue-600 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
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
              /* ============================
                 REGISTER FORM
              ============================ */
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
                  onChange={handlePatientChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />

                <input
                  name="fatherName"
                  placeholder="Father Name"
                  value={patient.fatherName}
                  onChange={handlePatientChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />

                <input
                  name="adhar_no"
                  placeholder="Aadhaar No."
                  value={patient.adhar_no}
                  onChange={handlePatientChange}
                  maxLength="12"
                  inputMode="numeric"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />

                <input
                  name="age"
                  type="number"
                  placeholder="Age"
                  value={patient.age}
                  onChange={handlePatientChange}
                  min="1"
                  max="120"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />

                <input
                  name="gender"
                  placeholder="Gender"
                  value={patient.gender}
                  onChange={handlePatientChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />

                <input
                  name="phone"
                  placeholder="Phone"
                  value={patient.phone}
                  onChange={handlePatientChange}
                  inputMode="numeric"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />

                <input
                  name="address"
                  placeholder="Address"
                  value={patient.address}
                  onChange={handlePatientChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-blue-600 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  {loading
                    ? "Registering..."
                    : "Register"}
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
      </div>
    </div>
  );
};

export default Register; 