
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";

export default function Home() {
  const [doctors, setDoctors] = useState([]);
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("");

  const [selected, setSelected] = useState(null);
  const [disease, setDisease] = useState("");
  const [booked, setBooked] = useState(null);

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");

  /*
  ====================================================
  LOAD PUBLIC DOCTORS
  ====================================================
  */

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/doctors/public");

      const doctorList = Array.isArray(res.data)
        ? res.data
        : res.data?.doctors || [];

      console.log(
        "PUBLIC DOCTORS:",
        doctorList
      );

      setDoctors(doctorList);
    } catch (err) {
      console.error(
        "LOAD DOCTORS ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load doctors."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  /*
  ====================================================
  GET HOSPITAL ID
  ====================================================

  Backend now returns:

  hospital: {
    _id: "...",
    name: "...",
    hospitalCode: "dh-01"
  }

  This function also supports string format.
  ====================================================
  */

  const getHospitalId = (doctor) => {
    if (!doctor) return null;

    // Populated hospital object
    if (
      doctor.hospital &&
      typeof doctor.hospital === "object" &&
      doctor.hospital._id
    ) {
      return doctor.hospital._id;
    }

    // Hospital ObjectId/string directly returned
    if (
      typeof doctor.hospital === "string" &&
      doctor.hospital.trim()
    ) {
      return doctor.hospital;
    }

    // Fallback if API/model uses hospitalId
    if (
      typeof doctor.hospitalId === "string" &&
      doctor.hospitalId.trim()
    ) {
      return doctor.hospitalId;
    }

    if (
      doctor.hospitalId &&
      typeof doctor.hospitalId === "object" &&
      doctor.hospitalId._id
    ) {
      return doctor.hospitalId._id;
    }

    return null;
  };

  /*
  ====================================================
  DEPARTMENTS
  ====================================================
  */

  const departments = useMemo(() => {
    return [
      ...new Set(
        doctors
          .map(
            (doctor) =>
              doctor.department ||
              doctor.specialization
          )
          .filter(Boolean)
      ),
    ];
  }, [doctors]);

  /*
  ====================================================
  FILTER DOCTORS
  ====================================================
  */

  const filteredDoctors = useMemo(() => {
    const q = query.toLowerCase().trim();

    return doctors.filter((doctor) => {
      const name =
        doctor.name?.toLowerCase() || "";

      const specialization =
        doctor.specialization?.toLowerCase() || "";

      const hospitalName =
        doctor.hospital?.name?.toLowerCase() ||
        doctor.hospitalName?.toLowerCase() ||
        "";

      const doctorDepartment =
        doctor.department ||
        doctor.specialization ||
        "";

      const matchesSearch =
        !q ||
        name.includes(q) ||
        specialization.includes(q) ||
        hospitalName.includes(q);

      const matchesDepartment =
        !department ||
        doctorDepartment === department;

      return (
        matchesSearch &&
        matchesDepartment
      );
    });
  }, [
    doctors,
    query,
    department,
  ]);

  /*
  ====================================================
  BOOK APPOINTMENT
  ====================================================
  */

  const bookAppointment = async () => {
    if (!selected) return;

    /*
    --------------------------------------------------
    Disease validation
    --------------------------------------------------
    */

    if (!disease.trim()) {
      alert(
        "Please enter your problem/disease."
      );
      return;
    }

    /*
    --------------------------------------------------
    PATIENT TOKEN
    --------------------------------------------------
    */

    const patientToken =
      localStorage.getItem("token") ||
      localStorage.getItem(
        "swasth_patient_token"
      );

    if (!patientToken) {
      alert(
        "Please login as patient before booking."
      );
      return;
    }

    /*
    --------------------------------------------------
    DOCTOR ID
    --------------------------------------------------
    */

    if (!selected._id) {
      alert("Doctor ID is missing.");
      return;
    }

    /*
    --------------------------------------------------
    HOSPITAL ID
    --------------------------------------------------
    */

    const hospitalId =
      getHospitalId(selected);

    console.log(
      "SELECTED DOCTOR:",
      selected
    );

    console.log(
      "DOCTOR ID:",
      selected._id
    );

    console.log(
      "HOSPITAL:",
      selected.hospital
    );

    console.log(
      "HOSPITAL ID:",
      hospitalId
    );

    if (!hospitalId) {
      alert(
        "Hospital ID is missing for this doctor."
      );
      return;
    }

    try {
      setBooking(true);

      /*
      --------------------------------------------------
      CREATE APPOINTMENT
      --------------------------------------------------
      */

      const res = await api.post(
        "/appointments",
        {
          doctorId: selected._id,
          hospitalId: hospitalId,
          disease: disease.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${patientToken}`,
            "Content-Type":
              "application/json",
          },
        }
      );

      console.log(
        "APPOINTMENT RESPONSE:",
        res.data
      );

      /*
      --------------------------------------------------
      SUCCESS
      --------------------------------------------------
      */

      if (res.data?.success) {
        const appointment =
          res.data.appointment;

        setBooked(appointment);

        setSelected(null);

        setDisease("");

        const tokenNumber =
          appointment
            ?.patientSnapshot
            ?.tokenNumber || "-";

        alert(
          `Appointment booked successfully!\nToken: #${tokenNumber}`
        );
      } else {
        alert(
          res.data?.message ||
            "Unable to book appointment."
        );
      }
    } catch (err) {
      console.error(
        "BOOK APPOINTMENT ERROR:",
        err
      );

      console.error(
        "SERVER RESPONSE:",
        err.response?.data
      );

      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to book appointment."
      );
    } finally {
      setBooking(false);
    }
  };

  /*
  ====================================================
  RENDER
  ====================================================
  */

  return (
    <main className="page">
      <div className="container">

        {/* ==================================================
            HERO
        ================================================== */}

        <section className="hero">

          <div className="hero-panel">

            <div
              className="eyebrow"
              style={{
                color: "#cfe1ff",
              }}
            >
              Smart Hospital & OPD
              Management
            </div>

            <h1
              className="title"
              style={{
                marginTop: 10,
              }}
            >
              Book. Track. Reach the
              doctor at the right time.
            </h1>

            <p>
              Swasth QR connects patients,
              hospitals and doctors in one
              OPD workflow.
            </p>

            <div
              className="row"
              style={{
                marginTop: 22,
              }}
            >

              <Link
                to="/kiosk"
                className="btn btn-dark"
              >
                Open Hospital Kiosk
              </Link>

              <Link
                to="/patient"
                className="btn"
                style={{
                  background: "#fff",
                  color: "#1459c7",
                }}
              >
                Track My Queue
              </Link>

            </div>

          </div>

          <div className="hero-side">

            <div className="feature">

              <span className="badge badge-green">
                ● LIVE
              </span>

              <h3>
                Doctor availability
              </h3>

              <p className="muted small">
                See which doctors are
                currently available.
              </p>

            </div>

            <div className="feature">

              <span className="badge badge-blue">
                TOKEN
              </span>

              <h3>
                Real-time OPD queue
              </h3>

              <p className="muted small">
                Track current token and
                patients ahead.
              </p>

            </div>

            <div className="feature">

              <span className="badge badge-blue">
                QR KIOSK
              </span>

              <h3>
                Fast hospital check-in
              </h3>

              <p className="muted small">
                Scan and enter the OPD
                workflow.
              </p>

            </div>

          </div>

        </section>

        {/* ==================================================
            BOOKED APPOINTMENT
        ================================================== */}

        {booked && (
          <section
            className="card"
            style={{
              marginBottom: 20,
            }}
          >

            <div className="between">

              <div>

                <span className="badge badge-green">
                  Appointment Confirmed
                </span>

                <h2
                  className="section-title"
                  style={{
                    marginTop: 8,
                  }}
                >
                  Your token is #
                  {
                    booked
                      ?.patientSnapshot
                      ?.tokenNumber
                  }
                </h2>

                <p className="muted">

                  {
                    booked
                      ?.patientSnapshot
                      ?.doctor
                  }

                  {" · "}

                  Room{" "}

                  {
                    booked
                      ?.patientSnapshot
                      ?.roomNo
                  }

                </p>

              </div>

              <Link
                className="btn btn-primary"
                to="/patient"
              >
                Track Queue
              </Link>

            </div>

          </section>
        )}

        {/* ==================================================
            FIND DOCTOR
        ================================================== */}

        <section>

          <div
            className="between"
            style={{
              marginBottom: 14,
            }}
          >

            <div>

              <h2 className="section-title">
                Find a Doctor
              </h2>

              <p className="muted small">
                Search available doctors
                and book your OPD token.
              </p>

            </div>

          </div>

          {/* SEARCH */}

          <div
            className="card"
            style={{
              marginBottom: 18,
            }}
          >

            <div className="grid grid-2">

              <input
                className="input"
                value={query}
                onChange={(e) =>
                  setQuery(e.target.value)
                }
                placeholder="Search doctor, hospital or department..."
              />

              <select
                className="select"
                value={department}
                onChange={(e) =>
                  setDepartment(
                    e.target.value
                  )
                }
              >

                <option value="">
                  All Departments
                </option>

                {departments.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  )
                )}

              </select>

            </div>

          </div>

          {/* ERROR */}

          {error && (
            <div className="alert">
              {error}
            </div>
          )}

          {/* LOADING */}

          {loading ? (

            <div className="card empty">
              Loading doctors...
            </div>

          ) : (

            <div className="grid grid-3">

              {filteredDoctors.length === 0 ? (

                <div className="card empty">
                  No doctors found.
                </div>

              ) : (

                filteredDoctors.map(
                  (doctor) => {

                    const active =
                      doctor.active !== false;

                    const hospitalId =
                      getHospitalId(
                        doctor
                      );

                    return (
                      <article
                        className="card doctor-card"
                        key={doctor._id}
                      >

                        {/* DOCTOR */}

                        <div className="row">

                          <div className="doctor-avatar">

                            {doctor.name
                              ?.replace(
                                "Dr. ",
                                ""
                              )
                              .split(" ")
                              .map(
                                (x) =>
                                  x[0]
                              )
                              .join("")
                              .slice(0, 2)}

                          </div>

                          <div>

                            <h3
                              style={{
                                margin: 0,
                              }}
                            >
                              {doctor.name}
                            </h3>

                            <div className="muted small">
                              {
                                doctor.specialization
                              }
                            </div>

                          </div>

                        </div>

                        {/* HOSPITAL */}

                        <div className="small">

                          <b>
                            {
                              doctor
                                .hospital
                                ?.name ||
                              doctor
                                .hospitalName ||
                              "Hospital"
                            }
                          </b>

                          <br />

                          Room{" "}

                          {
                            doctor.roomNumber ||
                            doctor.room ||
                            "-"
                          }

                          {" · "}

                          {
                            doctor
                              .availableTime
                              ?.from || "-"
                          }

                          {" – "}

                          {
                            doctor
                              .availableTime
                              ?.to || "-"
                          }

                        </div>

                        {/* STATUS */}

                        <div className="between">

                          <span
                            className={`badge ${
                              active
                                ? "badge-green"
                                : "badge-red"
                            }`}
                          >

                            {active
                              ? "● Active now"
                              : "● Not available"}

                          </span>

                        </div>

                        {/* BOOK BUTTON */}

                        <button
                          disabled={
                            !active ||
                            !hospitalId
                          }
                          onClick={() =>
                            setSelected(
                              doctor
                            )
                          }
                          className={`btn ${
                            active &&
                            hospitalId
                              ? "btn-primary"
                              : "btn-outline"
                          }`}
                        >

                          {!hospitalId
                            ? "Hospital ID unavailable"
                            : active
                            ? "Book Appointment"
                            : "Currently unavailable"}

                        </button>

                      </article>
                    );
                  }
                )

              )}

            </div>

          )}

        </section>

        {/* ==================================================
            BOOKING MODAL
        ================================================== */}

        {selected && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background:
                "rgba(15,23,42,.45)",
              display: "grid",
              placeItems: "center",
              padding: 20,
              zIndex: 20,
            }}
          >

            <div
              className="card"
              style={{
                width:
                  "min(460px,100%)",
              }}
            >

              <div className="between">

                <div>

                  <span className="eyebrow">
                    Appointment
                  </span>

                  <h2
                    style={{
                      margin:
                        "6px 0",
                    }}
                  >
                    {selected.name}
                  </h2>

                  <p className="muted">
                    {
                      selected.specialization
                    }
                  </p>

                </div>

                <button
                  className="btn btn-outline"
                  onClick={() =>
                    setSelected(null)
                  }
                >
                  Close
                </button>

              </div>

              {/* PROBLEM */}

              <div
                style={{
                  marginTop: 18,
                }}
              >

                <label className="small">
                  Problem / Disease
                </label>

                <textarea
                  className="input"
                  rows="4"
                  value={disease}
                  onChange={(e) =>
                    setDisease(
                      e.target.value
                    )
                  }
                  placeholder="Enter your problem..."
                  style={{
                    width: "100%",
                    marginTop: 6,
                  }}
                />

              </div>

              {/* CONFIRM */}

              <button
                className="btn btn-primary"
                style={{
                  width: "100%",
                  marginTop: 15,
                }}
                onClick={
                  bookAppointment
                }
                disabled={booking}
              >

                {booking
                  ? "Booking..."
                  : "Confirm & Get Token"}

              </button>

            </div>

          </div>
        )}

      </div>
    </main>
  );
}

