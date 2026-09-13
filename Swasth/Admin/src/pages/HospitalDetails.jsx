import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";

export default function HospitalDashboard() {
  const { hospital, logoutHospital } = useAuth();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ====================================================
  // FETCH HOSPITAL DOCTORS
  // ====================================================

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("hospitalToken");

      if (!token) {
        setError("Hospital login required.");
        setDoctors([]);
        return;
      }

      // Attach hospital token to common API instance
      api.setToken(token);

      const res = await api.get("/doctors");

      console.log(
        "HOSPITAL DOCTORS RESPONSE:",
        res.data
      );

      // ==================================================
      // BACKEND RESPONSE NORMALIZATION
      // ==================================================

      let doctorList = [];

      if (Array.isArray(res.data)) {
        doctorList = res.data;
      } else if (Array.isArray(res.data?.doctors)) {
        doctorList = res.data.doctors;
      } else if (Array.isArray(res.data?.data)) {
        doctorList = res.data.data;
      }

      console.log(
        "NORMALIZED DOCTORS:",
        doctorList
      );

      setDoctors(doctorList);
    } catch (err) {
      console.error(
        "GET HOSPITAL DOCTORS ERROR:",
        err
      );

      if (err.response?.status === 401) {
        setError(
          "Hospital login expired. Please login again."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to load doctors."
        );
      }

      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // INITIAL LOAD
  // ====================================================

  useEffect(() => {
    if (hospital) {
      fetchDoctors();
    } else {
      setLoading(false);
    }
  }, [hospital]);

  // ====================================================
  // SAFETY
  // ====================================================

  const doctorList = Array.isArray(doctors)
    ? doctors
    : [];

  // ====================================================
  // DOCTOR STATUS
  // ====================================================

  const activeDoctors = doctorList.filter(
    (doctor) => doctor?.active !== false
  );

  const inactiveDoctors = doctorList.filter(
    (doctor) => doctor?.active === false
  );

  // ====================================================
  // HOSPITAL LOGIN CHECK
  // ====================================================

  if (!hospital) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">

        <div className="text-center bg-white p-6 sm:p-8 rounded-2xl shadow-sm w-full max-w-md">

          <h2 className="text-xl font-bold text-gray-800">
            Hospital login required
          </h2>

          <p className="text-gray-500 mt-2 text-sm sm:text-base">
            Please login as a hospital to continue.
          </p>

          <Link
            to="/"
            className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold"
          >
            Go to Login
          </Link>

        </div>

      </div>
    );
  }

  // ====================================================
  // HOSPITAL ADDRESS
  // ====================================================

  const addressText =
    hospital.address &&
    typeof hospital.address === "object"
      ? [
          hospital.address.city,
          hospital.address.district,
          hospital.address.state,
          hospital.address.pincode,
        ]
          .filter(Boolean)
          .join(", ")
      : hospital.address || "-";

  const hospitalCity =
    hospital.city ||
    hospital.address?.city ||
    hospital.address?.district ||
    "-";

  // ====================================================
  // PAGE
  // ====================================================

  return (
    <main className="min-h-screen bg-gray-100">

      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 py-4 sm:py-6">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 mb-5 sm:mb-6">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div className="min-w-0">

              <p className="text-xs sm:text-sm text-blue-600 font-semibold">
                Hospital Control Center
              </p>

              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1 break-words">
                {hospital.name || "Hospital"}
              </h1>

              <p className="text-gray-500 mt-1 text-sm sm:text-base">
                {hospitalCity}
              </p>

              {hospital.hospitalCode && (
                <p className="text-xs sm:text-sm text-gray-400 mt-1 break-all">
                  Hospital Code: {hospital.hospitalCode}
                </p>
              )}

            </div>

            <button
              onClick={logoutHospital}
              className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-lg font-semibold"
            >
              Logout
            </button>

          </div>

        </div>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 sm:p-4 mb-5 sm:mb-6 text-sm sm:text-base">

            <div className="flex flex-col sm:flex-row sm:items-center gap-2">

              <span className="break-words">
                {error}
              </span>

              {error.includes("login expired") && (
                <button
                  onClick={() => {
                    localStorage.removeItem(
                      "hospitalToken"
                    );

                    logoutHospital();
                  }}
                  className="underline font-semibold whitespace-nowrap self-start"
                >
                  Login Again
                </button>
              )}

            </div>

          </div>
        )}

        {/* ==================================================
            STATISTICS
        ================================================== */}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5 mb-5 sm:mb-6">

          {/* TOTAL DOCTORS */}

          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">

            <p className="text-xs sm:text-sm text-gray-500">
              Total Doctors
            </p>

            <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-2">
              {doctorList.length}
            </p>

          </div>

          {/* ACTIVE */}

          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">

            <p className="text-xs sm:text-sm text-gray-500">
              Active Doctors
            </p>

            <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-2">
              {activeDoctors.length}
            </p>

          </div>

          {/* INACTIVE */}

          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 col-span-2 md:col-span-1">

            <p className="text-xs sm:text-sm text-gray-500">
              Inactive Doctors
            </p>

            <p className="text-2xl sm:text-3xl font-bold text-red-500 mt-2">
              {inactiveDoctors.length}
            </p>

          </div>

        </div>

        {/* ==================================================
            MAIN CONTENT
        ================================================== */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">

          {/* ==================================================
              HOSPITAL DETAILS
          ================================================== */}

          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">

            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-5">
              Hospital Details
            </h2>

            <p className="text-xs sm:text-sm text-gray-500">
              Hospital Code
            </p>

            <p className="font-medium mb-3 break-all">
              {hospital.hospitalCode || "-"}
            </p>

            <p className="text-xs sm:text-sm text-gray-500">
              Email
            </p>

            <p className="font-medium mb-3 break-all">
              {hospital.email || "-"}
            </p>

            <p className="text-xs sm:text-sm text-gray-500">
              Phone
            </p>

            <p className="font-medium mb-3 break-words">
              {hospital.phone || "-"}
            </p>

            <p className="text-xs sm:text-sm text-gray-500">
              Address
            </p>

            <p className="font-medium leading-6 break-words">
              {addressText}
            </p>

            {/* DEPARTMENTS */}

            {Array.isArray(hospital.departments) &&
              hospital.departments.length > 0 && (

                <div className="mt-5">

                  <p className="text-xs sm:text-sm text-gray-500 mb-2">
                    Departments
                  </p>

                  <div className="flex flex-wrap gap-2">

                    {hospital.departments.map(
                      (department, index) => (

                        <span
                          key={index}
                          className="bg-blue-50 text-blue-600 px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm"
                        >
                          {department}
                        </span>

                      )
                    )}

                  </div>

                </div>

              )}

            <Link
              to="/hospital-details"
              className="block text-center mt-5 bg-gray-100 hover:bg-gray-200 px-4 py-2.5 rounded-lg font-semibold text-sm sm:text-base"
            >
              My Hospital Details
            </Link>

          </div>

          {/* ==================================================
              MANAGE DOCTORS
          ================================================== */}

          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-4 sm:p-6">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">

              <div className="min-w-0">

                <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                  Manage Doctors
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Add and manage doctors working in your hospital.
                </p>

              </div>

              <Link
                to="/manage-doctors"
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-semibold text-center text-sm sm:text-base"
              >
                Manage
              </Link>

            </div>

            {/* ==================================================
                LOADING
            ================================================== */}

            {loading ? (

              <div className="py-10 text-center">

                <p className="text-gray-500 text-sm sm:text-base">
                  Loading doctors...
                </p>

              </div>

            ) : doctorList.length === 0 ? (

              /* ==================================================
                 NO DOCTORS
              ================================================== */

              <div className="border border-dashed rounded-xl p-6 sm:p-8 text-center">

                <p className="text-gray-500 text-sm sm:text-base">
                  No doctors added yet.
                </p>

                <Link
                  to="/manage-doctors"
                  className="inline-block mt-3 text-blue-600 font-semibold hover:underline text-sm sm:text-base"
                >
                  Add your first doctor
                </Link>

              </div>

            ) : (

              /* ==================================================
                 DOCTOR LIST
              ================================================== */

              <div className="space-y-3">

                {doctorList.map((doctor) => (

                  <div
                    key={doctor?._id}
                    className="border rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >

                    {/* DOCTOR DETAILS */}

                    <div className="min-w-0">

                      <h3 className="font-bold text-gray-800 break-words">
                        {doctor?.name || "Doctor"}
                      </h3>

                      <p className="text-sm text-gray-500 break-words">
                        {doctor?.specialization ||
                          "Specialization not set"}

                        {" · "}

                        {doctor?.department ||
                          "Department not set"}
                      </p>

                      <p className="text-sm text-gray-500 mt-1 break-words">
                        Room{" "}
                        {doctor?.roomNumber || "-"}
                        {" · "}
                        {doctor?.availableTime?.from ||
                          "-"}
                        {" - "}
                        {doctor?.availableTime?.to ||
                          "-"}
                      </p>

                      {doctor?.email && (
                        <p className="text-sm text-gray-400 mt-1 break-all">
                          {doctor.email}
                        </p>
                      )}

                    </div>

                    {/* STATUS */}

                    <span
                      className={`px-3 py-1 rounded-full text-xs sm:text-sm font-semibold w-fit flex-shrink-0 ${
                        doctor?.active === false
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {doctor?.active === false
                        ? "Inactive"
                        : "Active"}
                    </span>

                  </div>

                ))}

              </div>

            )}

          </div>

        </div>

      </div>

    </main>
  );
}