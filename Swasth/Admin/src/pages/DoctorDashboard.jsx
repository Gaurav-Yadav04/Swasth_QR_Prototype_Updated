import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";

export default function DoctorDashboard() {
  const { doctor, logoutDoctor } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [error, setError] = useState("");

  // ==================================================
  // GET CURRENT DOCTOR TOKEN
  // ==================================================

  const getDoctorToken = () => {
    return localStorage.getItem("doctorToken");
  };

  // ==================================================
  // GET DOCTOR APPOINTMENTS
  // ==================================================

  const fetchAppointments = async () => {
    try {
      setError("");

      const token = getDoctorToken();

      if (!token) {
        setError("Doctor login token not found. Please login again.");
        setLoading(false);
        return;
      }

      api.setToken(token);

      const res = await api.get("/doctor/appointments");

      console.log("DOCTOR APPOINTMENTS:", res.data.appointments);

      setAppointments(res.data.appointments || []);
    } catch (err) {
      console.error("FETCH DOCTOR APPOINTMENTS ERROR:", err);

      if (err.response?.status === 401) {
        setError("Doctor session expired. Please login again.");
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to load appointments."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // AUTO REFRESH
  // ==================================================

  useEffect(() => {
    if (!doctor) return;

    fetchAppointments();

    const interval = setInterval(fetchAppointments, 9000);

    return () => clearInterval(interval);
  }, [doctor]);

  // ==================================================
  // WAITING QUEUE
  // ==================================================

  const waitingAppointments = useMemo(() => {
    return appointments
      .filter(
        (appointment) =>
          appointment.patientSnapshot?.status === "waiting"
      )
      .sort(
        (a, b) =>
          Number(a.patientSnapshot?.tokenNumber || 0) -
          Number(b.patientSnapshot?.tokenNumber || 0)
      );
  }, [appointments]);

  // ==================================================
  // CURRENT PATIENT
  // ==================================================

  const currentAppointment = useMemo(() => {
    return appointments.find(
      (appointment) =>
        appointment.patientSnapshot?.status === "in-progress"
    );
  }, [appointments]);

  // ==================================================
  // COMPLETED COUNT
  // ==================================================

  const completedCount = useMemo(() => {
    return appointments.filter(
      (appointment) =>
        appointment.patientSnapshot?.status === "completed"
    ).length;
  }, [appointments]);

  // ==================================================
  // CALL PATIENT
  // ==================================================

  const callPatient = async (appointmentId) => {
    try {
      setUpdating(appointmentId);
      setError("");

      const token = getDoctorToken();

      if (!token) {
        setError("Doctor token not found. Please login again.");
        return;
      }

      api.setToken(token);

      await api.patch(
        `/doctor/appointments/${appointmentId}/call`,
        {}
      );

      await fetchAppointments();
    } catch (err) {
      console.error("CALL PATIENT ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Unable to call patient."
      );
    } finally {
      setUpdating(null);
    }
  };

  // ==================================================
  // COMPLETE PATIENT
  // ==================================================

  const completePatient = async (appointmentId) => {
    try {
      setUpdating(appointmentId);
      setError("");

      const token = getDoctorToken();

      if (!token) {
        setError("Doctor token not found. Please login again.");
        return;
      }

      api.setToken(token);

      await api.patch(
        `/doctor/appointments/${appointmentId}/complete`,
        {}
      );

      await fetchAppointments();
    } catch (err) {
      console.error("COMPLETE PATIENT ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Unable to complete consultation."
      );
    } finally {
      setUpdating(null);
    }
  };

  // ==================================================
  // CALL NEXT
  // ==================================================

  const callNext = async () => {
    if (!waitingAppointments.length) {
      return;
    }

    if (currentAppointment) {
      alert("Complete the current consultation first.");
      return;
    }

    const next = waitingAppointments[0];

    await callPatient(next._id);
  };

  // ==================================================
  // NO DOCTOR
  // ==================================================

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow text-center w-full max-w-md">
          <h2 className="text-xl font-bold">
            Doctor login required
          </h2>

          <p className="text-gray-500 mt-2">
            Please login as doctor first.
          </p>
        </div>
      </div>
    );
  }

  // ==================================================
  // DASHBOARD
  // ==================================================

  return (
    <main className="min-h-screen bg-gray-100">

      {/* ==================================================
          NAVBAR
      ================================================== */}

      <nav className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 py-3 sm:py-4">

          <div className="flex items-center justify-between gap-3">

            {/* BRAND */}

            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-blue-600 font-semibold">
                Swasth QR
              </p>

              <h1 className="text-lg sm:text-xl font-bold text-gray-800 truncate">
                Doctor Console
              </h1>
            </div>

            {/* DOCTOR PROFILE */}

            <div className="flex items-center gap-2 sm:gap-4">

              <div className="text-right hidden sm:block">
                <p className="font-semibold text-gray-800">
                  Dr. {doctor.name}
                </p>

                <p className="text-xs text-gray-500">
                  {doctor.specialization ||
                    doctor.department ||
                    "Doctor"}
                </p>
              </div>

              <div className="relative group">

                <button
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm sm:text-base"
                  title="Doctor Profile"
                >
                  {doctor.name
                    ?.replace("Dr. ", "")
                    .split(" ")
                    .map((word) => word[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase() || "DR"}
                </button>

                {/* PROFILE DROPDOWN */}

                <div className="hidden group-hover:block absolute right-0 top-12 w-64 max-w-[calc(100vw-24px)] bg-white border rounded-xl shadow-lg p-4">

                  <p className="font-bold text-gray-800 break-words">
                    Dr. {doctor.name}
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    {doctor.specialization ||
                      doctor.department ||
                      "Doctor"}
                  </p>

                  <p className="text-sm text-gray-500 mt-2 break-all">
                    {doctor.email || "-"}
                  </p>

                  <hr className="my-3" />

                  <button
                    onClick={logoutDoctor}
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-semibold"
                  >
                    Logout
                  </button>

                </div>

              </div>

            </div>

          </div>

        </div>
      </nav>

      {/* ==================================================
          DASHBOARD CONTENT
      ================================================== */}

      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 py-4 sm:py-6">

        {/* ==================================================
            DOCTOR INFO
        ================================================== */}

        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 mb-5 sm:mb-6">

          <p className="text-xs sm:text-sm text-blue-600 font-semibold">
            Doctor Dashboard
          </p>

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1 break-words">
            Dr. {doctor.name}
          </h2>

          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            {doctor.specialization ||
              doctor.department ||
              "General"}
          </p>

        </div>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 sm:p-4 rounded-xl mb-5 sm:mb-6">

            <div className="flex flex-col sm:flex-row sm:items-center gap-2">

              <span className="text-sm sm:text-base break-words">
                {error}
              </span>

              {error.includes("session") && (
                <button
                  onClick={() => {
                    localStorage.removeItem("doctorToken");
                    logoutDoctor();
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 mb-5 sm:mb-6">

          {/* TOTAL */}

          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
            <p className="text-xs sm:text-sm text-gray-500">
              Total Appointments
            </p>

            <p className="text-2xl sm:text-3xl font-bold mt-2">
              {appointments.length}
            </p>
          </div>

          {/* WAITING */}

          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
            <p className="text-xs sm:text-sm text-gray-500">
              Waiting
            </p>

            <p className="text-2xl sm:text-3xl font-bold text-yellow-600 mt-2">
              {waitingAppointments.length}
            </p>
          </div>

          {/* CURRENT */}

          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
            <p className="text-xs sm:text-sm text-gray-500">
              Current Patient
            </p>

            <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-2 truncate">
              {currentAppointment
                ? `#${currentAppointment.patientSnapshot.tokenNumber}`
                : "—"}
            </p>
          </div>

          {/* COMPLETED */}

          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
            <p className="text-xs sm:text-sm text-gray-500">
              Completed
            </p>

            <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-2">
              {completedCount}
            </p>
          </div>

        </div>

        {/* ==================================================
            CURRENT PATIENT
        ================================================== */}

        <section className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 mb-5 sm:mb-6">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">

            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                Now Consulting
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Current patient
              </p>
            </div>

            <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-xs sm:text-sm font-semibold">
              LIVE
            </span>

          </div>

          {currentAppointment ? (

            <div className="border rounded-xl p-4 sm:p-5">

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                {/* PATIENT DETAILS */}

                <div className="min-w-0">

                  <p className="text-sm text-gray-500">
                    Token
                  </p>

                  <p className="text-3xl sm:text-4xl font-bold text-blue-600">
                    #
                    {
                      currentAppointment
                        .patientSnapshot
                        .tokenNumber
                    }
                  </p>

                  <h3 className="text-lg sm:text-xl font-bold mt-2 break-words">
                    {
                      currentAppointment
                        .patientSnapshot
                        .name
                    }
                  </h3>

                  <p className="text-gray-500 mt-1 text-sm sm:text-base break-words">
                    Disease:{" "}
                    {
                      currentAppointment
                        .patientSnapshot
                        .disease
                    }
                  </p>

                  <p className="text-gray-500 text-sm sm:text-base break-words">
                    Department:{" "}
                    {
                      currentAppointment
                        .patientSnapshot
                        .department
                    }
                  </p>

                  <p className="text-gray-500 text-sm sm:text-base">
                    Room:{" "}
                    {
                      currentAppointment
                        .patientSnapshot
                        .roomNo
                    }
                  </p>

                </div>

                {/* COMPLETE BUTTON */}

                <button
                  disabled={
                    updating ===
                    currentAppointment._id
                  }
                  onClick={() =>
                    completePatient(
                      currentAppointment._id
                    )
                  }
                  className="w-full md:w-auto bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 sm:px-6 py-3 rounded-xl font-semibold text-sm sm:text-base"
                >
                  {updating ===
                  currentAppointment._id
                    ? "Updating..."
                    : "✓ Consultation Completed"}
                </button>

              </div>

            </div>

          ) : (

            <div className="border border-dashed rounded-xl p-6 sm:p-8 text-center">

              <p className="text-gray-500 text-sm sm:text-base">
                No patient is currently in consultation.
              </p>

              <button
                onClick={callNext}
                disabled={!waitingAppointments.length}
                className="mt-4 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-5 sm:px-6 py-3 rounded-xl font-semibold text-sm sm:text-base"
              >
                📣 Call Next Patient
              </button>

            </div>

          )}

        </section>

        {/* ==================================================
            WAITING QUEUE
        ================================================== */}

        <section className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">

            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                Waiting Queue
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Patients waiting for consultation
              </p>
            </div>

            <button
              onClick={callNext}
              disabled={
                !waitingAppointments.length ||
                !!currentAppointment
              }
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-5 py-2.5 rounded-lg font-semibold text-sm sm:text-base"
            >
              Call Next
            </button>

          </div>

          {loading ? (

            <div className="py-8 text-center">
              <p className="text-gray-500 text-sm sm:text-base">
                Loading appointments...
              </p>
            </div>

          ) : waitingAppointments.length === 0 ? (

            <div className="border border-dashed rounded-xl p-6 sm:p-8 text-center">

              <p className="text-gray-500 text-sm sm:text-base">
                No patients waiting.
              </p>

            </div>

          ) : (

            <div className="space-y-3">

              {waitingAppointments.map(
                (appointment) => (

                  <div
                    key={appointment._id}
                    className="border rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  >

                    {/* PATIENT */}

                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">

                      <div className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-base sm:text-lg">

                        #
                        {
                          appointment
                            .patientSnapshot
                            .tokenNumber
                        }

                      </div>

                      <div className="min-w-0">

                        <h3 className="font-bold text-gray-800 truncate">
                          {
                            appointment
                              .patientSnapshot
                              .name
                          }
                        </h3>

                        <p className="text-sm text-gray-500 truncate">
                          Disease:{" "}
                          {
                            appointment
                              .patientSnapshot
                              .disease
                          }
                        </p>

                        <p className="text-sm text-gray-500">
                          Phone:{" "}
                          {
                            appointment
                              .patientSnapshot
                              .phone ||
                            "-"
                          }
                        </p>

                      </div>

                    </div>

                    {/* CALL BUTTON */}

                    <button
                      disabled={
                        !!currentAppointment ||
                        updating === appointment._id
                      }
                      onClick={() =>
                        callPatient(
                          appointment._id
                        )
                      }
                      className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-5 py-2.5 rounded-lg font-semibold text-sm sm:text-base"
                    >
                      {updating === appointment._id
                        ? "Calling..."
                        : "Call Patient"}
                    </button>

                  </div>

                )
              )}

            </div>

          )}

        </section>

      </div>

    </main>
  );
}