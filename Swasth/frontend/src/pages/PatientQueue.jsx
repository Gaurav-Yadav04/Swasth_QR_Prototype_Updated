
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";

export default function PatientQueue() {
  /*
  ====================================================
  PATIENT APPOINTMENTS
  ====================================================
  */

  const [appointments, setAppointments] = useState([]);

  /*
  ====================================================
  SELECTED APPOINTMENT
  ====================================================
  */

  const [selectedAppointment, setSelectedAppointment] =
    useState(null);

  /*
  ====================================================
  LIVE QUEUE DATA
  ====================================================
  */

  const [queue, setQueue] = useState([]);
  const [currentToken, setCurrentToken] = useState(0);
  const [myToken, setMyToken] = useState(0);
  const [ahead, setAhead] = useState(0);

  /*
  ====================================================
  LOADING / ERROR
  ====================================================
  */

  const [loading, setLoading] = useState(true);
  const [queueLoading, setQueueLoading] = useState(false);
  const [error, setError] = useState("");

  /*
  ====================================================
  GET PATIENT TOKEN
  ====================================================
  */

  const getPatientToken = () => {
    return (
      localStorage.getItem("swasth_patient_token") ||
      localStorage.getItem("token") ||
      localStorage.getItem("patientToken") ||
      ""
    );
  };

  /*
  ====================================================
  GET ALL PATIENT APPOINTMENTS
  ====================================================
  */

  const fetchAppointments = async () => {
    const token = getPatientToken();

    console.log("PATIENT TOKEN FOUND:", !!token);

    if (!token) {
      setError("Patient login required.");
      setAppointments([]);
      setLoading(false);
      return [];
    }

    try {
      /*
      IMPORTANT:
      Do NOT set loading=true here.

      This function is also called every 3 seconds
      by auto-refresh. If loading=true is set here,
      the complete page goes back to loading state
      every 3 seconds.
      */

      api.setToken(token);

      const response = await api.get("/appointments/my");

      console.log(
        "MY APPOINTMENTS RESPONSE:",
        response.data
      );

      const data = Array.isArray(
        response.data?.appointments
      )
        ? response.data.appointments
        : [];

      console.log(
        "ALL PATIENT APPOINTMENTS:",
        data
      );

      /*
      ------------------------------------------------
      ONLY ACTIVE APPOINTMENTS
      COMPLETED + CANCELLED HIDE
      ------------------------------------------------
      */

      const activeAppointments = data.filter(
        (item) => {
          const status =
            item?.patientSnapshot?.status || "waiting";

          return (
            status !== "completed" &&
            status !== "cancelled"
          );
        }
      );

      console.log(
        "ACTIVE PATIENT APPOINTMENTS:",
        activeAppointments
      );

      setAppointments(activeAppointments);

      /*
      ------------------------------------------------
      IF CURRENT SELECTED APPOINTMENT BECOMES
      COMPLETED/CANCELLED, CLOSE TRACKING SECTION
      ------------------------------------------------
      */

      if (selectedAppointment?._id) {
        const stillActive = activeAppointments.find(
          (item) =>
            String(item._id) ===
            String(selectedAppointment._id)
        );

        if (!stillActive) {
          setSelectedAppointment(null);
          setQueue([]);
          setCurrentToken(0);
          setMyToken(0);
          setAhead(0);
        }
      }

      return activeAppointments;
    } catch (err) {
      console.error(
        "GET APPOINTMENTS ERROR:",
        err
      );

      if (err.response?.status === 401) {
        setError(
          "Patient login expired. Please login again."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to load your appointments."
        );
      }

      setAppointments([]);

      return [];
    } finally {
      /*
      This only changes loading state when the
      initial request finishes.

      Auto-refresh will NOT show the loading screen
      because fetchAppointments no longer sets
      loading=true.
      */
      setLoading(false);
    }
  };

  /*
  ====================================================
  GET LIVE QUEUE FOR ONE APPOINTMENT
  ====================================================
  */

  const fetchQueue = async (
    appointment,
    showLoader = true
  ) => {
    const token = getPatientToken();

    if (!token) {
      setError("Patient login required.");
      return;
    }

    if (!appointment?._id) {
      return;
    }

    try {
      if (showLoader) {
        setQueueLoading(true);
      }

      setError("");

      /*
      ------------------------------------------------
      SET TOKEN IN SHARED API INSTANCE
      ------------------------------------------------
      */

      api.setToken(token);

      console.log(
        "FETCHING QUEUE FOR APPOINTMENT:",
        appointment._id
      );

      const response = await api.get(
        `/appointments/${appointment._id}/queue`
      );

      console.log(
        "QUEUE RESPONSE:",
        response.data
      );

      const data = response.data || {};

      /*
      ==================================================
      UPDATE APPOINTMENT
      ==================================================
      */

      if (data.appointment) {
        const updatedAppointment =
          data.appointment;

        const updatedStatus =
          updatedAppointment?.patientSnapshot
            ?.status || "waiting";

        /*
        If doctor completed the appointment,
        remove it from the screen.
        */

        if (
          updatedStatus === "completed" ||
          updatedStatus === "cancelled"
        ) {
          setAppointments((previous) =>
            previous.filter(
              (item) =>
                String(item._id) !==
                String(updatedAppointment._id)
            )
          );

          setSelectedAppointment(null);
          setQueue([]);
          setCurrentToken(0);
          setMyToken(0);
          setAhead(0);

          return;
        }

        setSelectedAppointment(
          updatedAppointment
        );

        setAppointments((previous) =>
          previous.map((item) =>
            String(item._id) ===
            String(updatedAppointment._id)
              ? updatedAppointment
              : item
          )
        );
      }

      /*
      ==================================================
      UPDATE LIVE QUEUE
      ==================================================
      */

      setQueue(
        Array.isArray(data.queue)
          ? data.queue
          : []
      );

      /*
      ==================================================
      CURRENT RUNNING TOKEN
      ==================================================
      */

      setCurrentToken(
        Number(data.currentToken) || 0
      );

      /*
      ==================================================
      MY TOKEN
      ==================================================
      */

      const returnedToken =
        Number(data.myToken) || 0;

      const appointmentToken =
        Number(
          appointment?.patientSnapshot
            ?.tokenNumber
        ) || 0;

      setMyToken(
        returnedToken ||
          appointmentToken ||
          0
      );

      /*
      ==================================================
      PATIENTS AHEAD
      ==================================================
      */

      setAhead(
        Number(data.ahead) || 0
      );
    } catch (err) {
      console.error(
        "QUEUE API ERROR:",
        err
      );

      /*
      If appointment has already been completed
      and backend returns 404/400, remove it.
      */

      const backendMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "";

      const appointmentStatus =
        appointment?.patientSnapshot?.status;

      if (
        appointmentStatus === "completed" ||
        appointmentStatus === "cancelled"
      ) {
        setAppointments((previous) =>
          previous.filter(
            (item) =>
              String(item._id) !==
              String(appointment._id)
          )
        );

        setSelectedAppointment(null);
        setQueue([]);
        setCurrentToken(0);
        setMyToken(0);
        setAhead(0);

        return;
      }

      setQueue([]);
      setCurrentToken(0);
      setAhead(0);

      const appointmentToken =
        Number(
          appointment?.patientSnapshot
            ?.tokenNumber
        ) || 0;

      setMyToken(appointmentToken);

      if (err.response?.status === 401) {
        setError(
          "Patient login expired. Please login again."
        );
      } else {
        setError(
          backendMessage ||
            "Live queue could not be loaded."
        );
      }
    } finally {
      if (showLoader) {
        setQueueLoading(false);
      }
    }
  };

  /*
  ====================================================
  TRACK QUEUE BUTTON
  ====================================================
  */

  const handleSelectAppointment = (
    appointment
  ) => {
    console.log(
      "TRACKING APPOINTMENT:",
      appointment
    );

    setSelectedAppointment(
      appointment
    );

    /*
    Reset old queue data
    */

    setQueue([]);
    setCurrentToken(0);
    setAhead(0);

    const token =
      Number(
        appointment?.patientSnapshot
          ?.tokenNumber
      ) || 0;

    setMyToken(token);

    /*
    Load live queue
    */

    fetchQueue(
      appointment,
      true
    );

    /*
    Scroll to live queue section
    */

    setTimeout(() => {
      document
        .getElementById("live-queue-section")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  };

  /*
  ====================================================
  CLOSE TRACKING
  ====================================================
  */

  const closeTracking = () => {
    setSelectedAppointment(null);
    setQueue([]);
    setCurrentToken(0);
    setMyToken(0);
    setAhead(0);
    setError("");
  };

  /*
  ====================================================
  INITIAL LOAD
  ====================================================
  */

  useEffect(() => {
    fetchAppointments();
  }, []);

  /*
  ====================================================
  AUTO REFRESH
  ====================================================
  IMPORTANT:
  This refreshes DATA only.
  It does NOT reload the page.
  ====================================================
  */

  useEffect(() => {
    const interval = setInterval(
      async () => {
        console.log(
          "AUTO REFRESH: Updating appointment data..."
        );

        const data =
          await fetchAppointments();

        /*
        Only refresh queue if user has
        clicked Track Queue.
        */

        if (
          selectedAppointment?._id
        ) {
          const updated =
            data.find(
              (item) =>
                String(item._id) ===
                String(
                  selectedAppointment._id
                )
            );

          if (updated) {
            await fetchQueue(
              updated,
              false
            );
          }
        }
      },
      3000
    );

    return () => {
      clearInterval(interval);
    };
  }, [
    selectedAppointment?._id,
  ]);

  /*
  ====================================================
  LOADING
  ====================================================
  */

  if (loading) {
    return (
      <main className="page">
        <div className="container">
          <div className="card empty">
            Loading your appointments...
          </div>
        </div>
      </main>
    );
  }

  /*
  ====================================================
  NO ACTIVE APPOINTMENTS
  ====================================================
  */

  if (appointments.length === 0) {
    return (
      <main className="page">
        <div className="container">

          <div className="card empty">

            <h2>
              No active appointments
            </h2>

            <p>
              Book an appointment to
              track your OPD queue here.
            </p>

            {error && (
              <div
                className="alert"
                style={{
                  marginTop: 15,
                  marginBottom: 15,
                }}
              >
                {error}
              </div>
            )}

            <Link
              className="btn btn-primary"
              to="/"
            >
              Find a Doctor
            </Link>

          </div>

        </div>
      </main>
    );
  }

  /*
  ====================================================
  PAGE
  ====================================================
  */

  return (
    <main className="page">
      <div className="container">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div
          className="between"
          style={{
            marginBottom: 18,
          }}
        >
          <div>

            <div className="eyebrow">
              Patient Appointments
            </div>

            <h1 className="section-title">
              My Queue
            </h1>

            <p className="muted">
              Track all your active hospital
              appointments from one place.
            </p>

          </div>

          <Link
            className="btn btn-outline"
            to="/"
          >
            Book another appointment
          </Link>

        </div>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div
            className="alert"
            style={{
              marginBottom: 18,
            }}
          >
            {error}
          </div>
        )}

        {/* ==================================================
            ALL ACTIVE APPOINTMENTS
        ================================================== */}

        <section
          className="card"
          style={{
            marginBottom: 18,
          }}
        >

          <div className="between">

            <div>
              <h2>
                Your Appointments
              </h2>

              <p className="muted">
                Completed appointments are
                automatically removed.
              </p>
            </div>

            <span className="badge badge-blue">
              {appointments.length}{" "}
              {appointments.length === 1
                ? "Appointment"
                : "Appointments"}
            </span>

          </div>

          {/* APPOINTMENT LIST */}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              marginTop: 14,
            }}
          >

            {appointments.map(
              (item) => {

                const snapshot =
                  item.patientSnapshot ||
                  {};

                const status =
                  snapshot.status ||
                  "waiting";

                /*
                Safety:
                completed/cancelled will
                never render.
                */

                if (
                  status === "completed" ||
                  status === "cancelled"
                ) {
                  return null;
                }

                const token =
                  snapshot.tokenNumber ||
                  0;

                const doctorName =
                  snapshot.doctor ||
                  item.doctorId?.name ||
                  "Doctor";

                const department =
                  snapshot.department ||
                  item.doctorId
                    ?.department ||
                  item.doctorId
                    ?.specialization ||
                  "General";

                const room =
                  snapshot.roomNo ||
                  item.doctorId
                    ?.roomNumber ||
                  item.doctorId?.room ||
                  "-";

                const hospitalName =
                  item.hospitalId?.name ||
                  "Hospital";

                const hospitalCity =
                  item.hospitalId?.city ||
                  item.hospitalId
                    ?.district ||
                  "";

                const isSelected =
                  String(
                    selectedAppointment?._id
                  ) ===
                  String(item._id);

                const isInProgress =
                  status ===
                  "in-progress";

                return (
                  <div
                    key={item._id}
                    style={{
                      border:
                        isSelected
                          ? "2px solid #2563eb"
                          : "1px solid #edf0f5",
                      borderRadius: 10,
                      padding: "10px 12px",
                      background:
                        "#ffffff",
                    }}
                  >

                    {/* TOP ROW */}

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent:
                          "space-between",
                        gap: 10,
                      }}
                    >

                      <div
                        style={{
                          display: "flex",
                          alignItems:
                            "center",
                          gap: 10,
                          minWidth: 0,
                        }}
                      >

                        {/* TOKEN */}

                        <div
                          style={{
                            width: 40,
                            height: 40,
                            flexShrink: 0,
                            borderRadius: 9,
                            background:
                              "#f3f7ff",
                            display:
                              "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            fontWeight: 800,
                            color:
                              "#2563eb",
                            fontSize: 14,
                          }}
                        >
                          #{token}
                        </div>

                        {/* HOSPITAL */}

                        <div
                          style={{
                            minWidth: 0,
                          }}
                        >

                          <h3
                            style={{
                              margin: 0,
                              fontSize: 15,
                              fontWeight: 700,
                            }}
                          >
                            {hospitalName}
                          </h3>

                          <p
                            className="small muted"
                            style={{
                              margin:
                                "2px 0 0",
                            }}
                          >
                            {hospitalCity}
                          </p>

                        </div>

                      </div>

                      {/* STATUS */}

                      <span
                        className={`badge ${
                          isInProgress
                            ? "badge-blue"
                            : "badge-green"
                        }`}
                        style={{
                          flexShrink: 0,
                        }}
                      >
                        {isInProgress
                          ? "● Consulting"
                          : "● Waiting"}
                      </span>

                    </div>

                    {/* DETAILS */}

                    <div
                      style={{
                        display:
                          "grid",
                        gridTemplateColumns:
                          "repeat(3, 1fr)",
                        gap: 10,
                        marginTop: 9,
                        paddingTop: 9,
                        borderTop:
                          "1px solid #edf0f5",
                      }}
                    >

                      <div>
                        <span className="small muted">
                          Doctor
                        </span>

                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            marginTop: 2,
                          }}
                        >
                          {doctorName}
                        </div>
                      </div>

                      <div>
                        <span className="small muted">
                          Department
                        </span>

                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            marginTop: 2,
                          }}
                        >
                          {department}
                        </div>
                      </div>

                      <div>
                        <span className="small muted">
                          Room
                        </span>

                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            marginTop: 2,
                          }}
                        >
                          {room}
                        </div>
                      </div>

                    </div>

                    {/* TRACK BUTTON */}

                    <div
                      style={{
                        display:
                          "flex",
                        justifyContent:
                          "flex-end",
                        marginTop: 9,
                      }}
                    >

                      <button
                        type="button"
                        className={
                          isSelected
                            ? "btn btn-primary"
                            : "btn btn-outline"
                        }
                        style={{
                          padding:
                            "7px 12px",
                          fontSize: 13,
                        }}
                        onClick={() =>
                          handleSelectAppointment(
                            item
                          )
                        }
                      >
                        {isSelected
                          ? "Tracking Queue"
                          : "Track Queue"}
                      </button>

                    </div>

                  </div>
                );
              }
            )}

          </div>

        </section>

        {/* ==================================================
            LIVE QUEUE
            ONLY SHOW AFTER TRACK QUEUE CLICK
        ================================================== */}

        {selectedAppointment && (
          <section
            id="live-queue-section"
          >

            {/* ==================================================
                SELECTED APPOINTMENT HEADER
            ================================================== */}

            <div
              className="between"
              style={{
                marginBottom: 14,
              }}
            >

              <div>

                <div className="eyebrow">
                  Live Queue
                </div>

                <h2
                  className="section-title"
                  style={{
                    marginTop: 5,
                  }}
                >
                  {selectedAppointment
                    ?.patientSnapshot
                    ?.doctor ||
                    selectedAppointment
                      ?.doctorId?.name ||
                    "Doctor"}
                </h2>

                <p className="muted">
                  {selectedAppointment
                    ?.hospitalId?.name ||
                    "Hospital"}

                  {" · "}

                  {selectedAppointment
                    ?.patientSnapshot
                    ?.department ||
                    selectedAppointment
                      ?.doctorId
                      ?.department ||
                    "General"}

                  {" · Room "}

                  {selectedAppointment
                    ?.patientSnapshot
                    ?.roomNo ||
                    selectedAppointment
                      ?.doctorId
                      ?.roomNumber ||
                    "-"}
                </p>

              </div>

              <button
                type="button"
                className="btn btn-outline"
                onClick={
                  closeTracking
                }
              >
                Close
              </button>

            </div>

            {/* QUEUE LOADING */}

            {queueLoading && (
              <div
                className="alert"
                style={{
                  marginBottom: 14,
                }}
              >
                Updating live queue...
              </div>
            )}

            {/* ==================================================
                SELECTED DATA
            ================================================== */}

            {(() => {
              const snapshot =
                selectedAppointment
                  ?.patientSnapshot ||
                {};

              const status =
                snapshot.status ||
                "waiting";

              const token =
                Number(myToken) ||
                Number(
                  snapshot.tokenNumber
                ) ||
                0;

              const doctor =
                snapshot.doctor ||
                selectedAppointment
                  ?.doctorId?.name ||
                "Doctor";

              const department =
                snapshot.department ||
                selectedAppointment
                  ?.doctorId
                  ?.department ||
                selectedAppointment
                  ?.doctorId
                  ?.specialization ||
                "General";

              const room =
                snapshot.roomNo ||
                selectedAppointment
                  ?.doctorId
                  ?.roomNumber ||
                selectedAppointment
                  ?.doctorId?.room ||
                "-";

              const isInProgress =
                status ===
                "in-progress";

              return (
                <>
                  {/* ==================================================
                      QUEUE SUMMARY
                  ================================================== */}

                  <div
                    className="grid grid-3"
                    style={{
                      marginBottom: 14,
                    }}
                  >

                    <section className="card">
                      <span className="small muted">
                        Your Token
                      </span>

                      <div className="token">
                        #{token}
                      </div>
                    </section>

                    <section className="card">
                      <span className="small muted">
                        Currently Running
                      </span>

                      <div className="token">
                        {currentToken
                          ? `#${currentToken}`
                          : "—"}
                      </div>
                    </section>

                    <section className="card">
                      <span className="small muted">
                        Patients Ahead
                      </span>

                      <div className="token">
                        {isInProgress
                          ? 0
                          : ahead}
                      </div>
                    </section>

                  </div>

                  {/* ==================================================
                      MAIN DETAILS
                  ================================================== */}

                  <div className="grid grid-2">

                    {/* TOKEN CARD */}

                    <section
                      className="card token-box"
                      style={{
                        padding: 18,
                      }}
                    >

                      <span className="badge badge-blue">
                        YOUR TOKEN
                      </span>

                      <div
                        className="token"
                        style={{
                          margin:
                            "8px 0",
                        }}
                      >
                        #{token}
                      </div>

                      <h3
                        style={{
                          margin:
                            "4px 0",
                        }}
                      >
                        {doctor}
                      </h3>

                      <p className="muted">
                        {department}
                        {" · Room "}
                        {room}
                      </p>

                      <div
                        className="grid grid-3"
                        style={{
                          marginTop: 14,
                        }}
                      >

                        <div>
                          <div className="small muted">
                            Token
                          </div>

                          <b>
                            #{token}
                          </b>
                        </div>

                        <div>
                          <div className="small muted">
                            Status
                          </div>

                          <b>
                            {status}
                          </b>
                        </div>

                        <div>
                          <div className="small muted">
                            Problem
                          </div>

                          <b>
                            {snapshot.disease ||
                              "-"}
                          </b>
                        </div>

                      </div>

                      {/* PROGRESS */}

                      <div
                        className="progress"
                        style={{
                          marginTop: 16,
                        }}
                      >
                        <div
                          style={{
                            width:
                              isInProgress
                                ? "80%"
                                : "30%",
                          }}
                        />
                      </div>

                      <p
                        className="small muted"
                        style={{
                          marginTop: 7,
                        }}
                      >
                        {isInProgress
                          ? "Your consultation is in progress."
                          : `Please wait. ${ahead} patient${
                              ahead === 1
                                ? ""
                                : "s"
                            } ahead of you.`}
                      </p>

                    </section>

                    {/* APPOINTMENT DETAILS */}

                    <section
                      className="card"
                      style={{
                        padding: 18,
                      }}
                    >

                      <div className="between">

                        <div>

                          <span
                            className={`badge ${
                              isInProgress
                                ? "badge-blue"
                                : "badge-green"
                            }`}
                          >
                            {isInProgress
                              ? "● Consulting"
                              : "● Waiting"}
                          </span>

                          <h2
                            style={{
                              margin:
                                "8px 0 4px",
                              fontSize: 20,
                            }}
                          >
                            {doctor}
                          </h2>

                        </div>

                        <div className="doctor-avatar">
                          DR
                        </div>

                      </div>

                      <hr
                        style={{
                          border: 0,
                          borderTop:
                            "1px solid #edf0f5",
                          margin:
                            "12px 0",
                        }}
                      />

                      <div
                        className="grid grid-2"
                      >

                        <div>
                          <span className="small muted">
                            Hospital
                          </span>

                          <br />

                          <b>
                            {selectedAppointment
                              ?.hospitalId
                              ?.name ||
                              "Hospital"}
                          </b>
                        </div>

                        <div>
                          <span className="small muted">
                            Department
                          </span>

                          <br />

                          <b>
                            {department}
                          </b>
                        </div>

                        <div>
                          <span className="small muted">
                            Room
                          </span>

                          <br />

                          <b>
                            {room}
                          </b>
                        </div>

                        <div>
                          <span className="small muted">
                            Your Token
                          </span>

                          <br />

                          <b>
                            #{token}
                          </b>
                        </div>

                        <div>
                          <span className="small muted">
                            Problem
                          </span>

                          <br />

                          <b>
                            {snapshot.disease ||
                              "-"}
                          </b>
                        </div>

                      </div>

                      <div
                        className="alert"
                        style={{
                          marginTop: 14,
                        }}
                      >
                        🔔 Currently running token:{" "}

                        <b>
                          {currentToken
                            ? `#${currentToken}`
                            : "No patient"}
                        </b>
                      </div>

                    </section>

                  </div>

                  {/* ==================================================
                      LIVE QUEUE
                  ================================================== */}

                  <section
                    className="card"
                    style={{
                      marginTop: 14,
                    }}
                  >

                    <div className="between">

                      <div>

                        <h2>
                          Live Queue
                        </h2>

                        <p className="muted">
                          Patients currently in
                          this doctor's queue.
                        </p>

                      </div>

                      <span className="badge badge-blue">
                        LIVE
                      </span>

                    </div>

                    <div
                      style={{
                        marginTop: 14,
                      }}
                    >

                      {queue.length === 0 ? (
                        <div className="empty">
                          No patients in queue.
                        </div>
                      ) : (
                        <div
                          style={{
                            display:
                              "flex",
                            flexDirection:
                              "column",
                            gap: 8,
                          }}
                        >

                          {queue.map(
                            (item) => {

                              const itemToken =
                                item
                                  ?.patientSnapshot
                                  ?.tokenNumber ??
                                0;

                              const itemStatus =
                                item
                                  ?.patientSnapshot
                                  ?.status ||
                                "waiting";

                              /*
                              Completed patients
                              should not appear
                              in live queue.
                              */

                              if (
                                itemStatus ===
                                  "completed" ||
                                itemStatus ===
                                  "cancelled"
                              ) {
                                return null;
                              }

                              const isMine =
                                String(
                                  item._id
                                ) ===
                                String(
                                  selectedAppointment._id
                                );

                              return (
                                <div
                                  key={
                                    item._id
                                  }
                                  style={{
                                    border:
                                      isMine
                                        ? "2px solid #2563eb"
                                        : "1px solid #edf0f5",
                                    borderRadius: 10,
                                    padding:
                                      "9px 12px",
                                    display:
                                      "flex",
                                    alignItems:
                                      "center",
                                    justifyContent:
                                      "space-between",
                                    gap: 10,
                                  }}
                                >

                                  <div
                                    style={{
                                      display:
                                        "flex",
                                      alignItems:
                                        "center",
                                      gap: 10,
                                    }}
                                  >

                                    <div
                                      style={{
                                        width: 38,
                                        height: 38,
                                        borderRadius: 8,
                                        background:
                                          "#f3f7ff",
                                        display:
                                          "flex",
                                        alignItems:
                                          "center",
                                        justifyContent:
                                          "center",
                                        fontWeight:
                                          700,
                                        fontSize: 13,
                                      }}
                                    >
                                      #{itemToken}
                                    </div>

                                    <div>

                                      <b
                                        style={{
                                          fontSize:
                                            14,
                                        }}
                                      >
                                        {isMine
                                          ? "You"
                                          : `Token #${itemToken}`}
                                      </b>

                                      <p
                                        className="small muted"
                                        style={{
                                          margin:
                                            "2px 0 0",
                                        }}
                                      >
                                        {itemStatus ===
                                        "in-progress"
                                          ? "Currently consulting"
                                          : "Waiting"}
                                      </p>

                                    </div>

                                  </div>

                                  {itemStatus ===
                                    "in-progress" && (
                                    <span className="badge badge-blue">
                                      NOW
                                    </span>
                                  )}

                                  {isMine &&
                                    itemStatus ===
                                      "waiting" && (
                                    <span className="badge badge-green">
                                      YOUR TOKEN
                                    </span>
                                  )}

                                </div>
                              );
                            }
                          )}

                        </div>
                      )}

                    </div>

                  </section>
                </>
              );
            })()}

          </section>
        )}

      </div>
    </main>
  );
}
