
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function Login() {
  const { loginDoctor, loginHospital } = useAuth();

  const [loginType, setLoginType] = useState("doctor");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      if (loginType === "doctor") {
        await loginDoctor(formData);
      } else {
        await loginHospital(formData);
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">

        <h2 className="mb-2 text-center text-3xl font-bold text-gray-800">
          Swasth QR
        </h2>

        <p className="mb-6 text-center text-sm text-gray-500">
          Login to continue
        </p>

        {/* Login Type */}
        <div className="mb-6 grid grid-cols-2 rounded-xl bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => {
              setLoginType("doctor");
              setError("");
            }}
            className={`rounded-lg py-2.5 text-sm font-semibold transition ${
              loginType === "doctor"
                ? "bg-blue-600 text-white shadow"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Doctor
          </button>

          <button
            type="button"
            onClick={() => {
              setLoginType("hospital");
              setError("");
            }}
            className={`rounded-lg py-2.5 text-sm font-semibold transition ${
              loginType === "hospital"
                ? "bg-blue-600 text-white shadow"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Hospital
          </button>
        </div>

        <h3 className="mb-5 text-xl font-bold text-gray-800">
          {loginType === "doctor" ? "Doctor Login" : "Hospital Login"}
        </h3>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Email */}
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Email
            </label>

            <input
              type="email"
              name="email"
              placeholder={
                loginType === "doctor"
                  ? "Enter doctor email"
                  : "Enter hospital email"
              }
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Password
            </label>

            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {loading
              ? "Logging in..."
              : loginType === "doctor"
              ? "Login as Doctor"
              : "Login as Hospital"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-gray-400">
          Swasth QR Healthcare Management System
        </p>
      </div>
    </div>
  );
}

export default Login;
