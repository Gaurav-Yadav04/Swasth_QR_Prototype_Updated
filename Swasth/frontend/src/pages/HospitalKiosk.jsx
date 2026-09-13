
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";

import {
  DEMO_DOCTORS,
  getQueue,
  nextTokenForDoctor,
  saveMyAppointment,
  saveQueue,
} from "../demoStore";

import QrReader from "../components/QrReader";

export default function HospitalKiosk() {
  const [step, setStep] = useState(1);

  // =====================================================
  // HOSPITAL
  // =====================================================

  const [hospitalName] = useState(
    localStorage.getItem("hospitalName") ||
      "Swasth QR Hospital"
  );

  // =====================================================
  // PATIENT VERIFICATION
  // =====================================================

  const [verificationMode, setVerificationMode] =
    useState(null);

  const [scanning, setScanning] = useState(false);

  const [patient, setPatient] = useState(null);

  const [aadhaar, setAadhaar] = useState("");

  const [scanError, setScanError] = useState("");

  const [searching, setSearching] = useState(false);

  // =====================================================
  // APPOINTMENT
  // =====================================================

  const [department, setDepartment] = useState("");

  const [problem, setProblem] = useState("");

  const [doctor, setDoctor] = useState(null);

  const [result, setResult] = useState(null);

  // =====================================================
  // HOSPITAL DEPARTMENTS
  // =====================================================
  //
  // Only departments available in the current hospital
  // will be shown.
  //
  // DEMO_DOCTORS example:
  //
  // hospitalName: "District Hospital Ayodhya"
  // specialization: "General Medicine"
  //
  // hospitalName: "Government Medical Centre Lucknow"
  // specialization: "Cardiology"
  //
  // =====================================================

  const hospitalDoctors = useMemo(() => {
    const currentHospital =
      hospitalName?.trim().toLowerCase();

    if (!currentHospital) {
      return DEMO_DOCTORS;
    }

    const filtered = DEMO_DOCTORS.filter((doctor) => {
      const doctorHospital =
        doctor.hospitalName ||
        doctor.hospital?.name ||
        "";

      return (
        doctorHospital.trim().toLowerCase() ===
        currentHospital
      );
    });

    /*
     * Agar current hospital ke naam se koi demo doctor
     * nahi mila, to saare demo doctors use karenge.
     * Isse kiosk blank nahi hoga.
     */
    return filtered.length > 0
      ? filtered
      : DEMO_DOCTORS;
  }, [hospitalName]);

  // =====================================================
  // DEPARTMENTS FOR CURRENT HOSPITAL
  // =====================================================

  const departments = useMemo(() => {
    return [
      ...new Set(
        hospitalDoctors
          .map(
            (doctor) =>
              doctor.specialization ||
              doctor.department
          )
          .filter(Boolean)
      ),
    ];
  }, [hospitalDoctors]);

  // =====================================================
  // QR SCAN START
  // =====================================================

  const startQRScan = () => {
    setVerificationMode("qr");
    setScanError("");
    setScanning(true);
    setPatient(null);
  };

  // =====================================================
  // QR SCAN ERROR
  // =====================================================

  const handleScanError = (error) => {
    console.error("QR Scanner Error:", error);
  };

  // =====================================================
  // QR SCAN SUCCESS
  // =====================================================

  const handleScan = async (data) => {
    if (!data || patient || searching) {
      return;
    }

    try {
      setSearching(true);
      setScanError("");

      const qrValue = String(data).trim();

      /*
       * Patient profile ka QR normally patient _id
       * contain karega.
       */

      const res = await api.get(
        `/patients/${qrValue}`
      );

      if (!res.data) {
        throw new Error("Patient not found");
      }

      setPatient(res.data);

      setScanning(false);

      setVerificationMode("verified");

      setStep(2);
    } catch (error) {
      console.error(
        "Patient QR fetch error:",
        error
      );

      setPatient(null);

      setScanning(false);

      setScanError(
        error.response?.data?.message ||
          "Invalid QR or patient not found."
      );
    } finally {
      setSearching(false);
    }
  };

  // =====================================================
  // AADHAAR SEARCH
  // =====================================================

  const handleAadhaarSearch = async () => {
    if (!aadhaar.trim()) {
      setScanError(
        "Please enter Aadhaar number."
      );
      return;
    }

    try {
      setSearching(true);
      setScanError("");

      const res = await api.get(
        `/patients/aadhar/${aadhaar.trim()}`
      );

      if (!res.data) {
        throw new Error("Patient not found");
      }

      setPatient(res.data);

      setVerificationMode("verified");

      setScanning(false);

      setStep(2);
    } catch (error) {
      console.error(
        "Aadhaar patient search error:",
        error
      );

      setPatient(null);

      setScanError(
        error.response?.data?.message ||
          "Patient not found with this Aadhaar number."
      );
    } finally {
      setSearching(false);
    }
  };

  // =====================================================
  // FIND DOCTOR
  // =====================================================

  const findDoctor = () => {
    if (!department) {
      return;
    }

    /*
     * IMPORTANT:
     *
     * Doctors are filtered from the CURRENT HOSPITAL only.
     */

    const available = hospitalDoctors.filter(
      (d) =>
        (d.specialization === department ||
          d.department === department) &&
        d.active
    );

    const selected =
      available.sort(
        (a, b) =>
          (a.queueCount || 0) -
          (b.queueCount || 0)
      )[0] ||
      hospitalDoctors.find(
        (d) =>
          d.specialization === department ||
          d.department === department
      );

    if (!selected) {
      alert(
        `No doctor found for ${department} at ${hospitalName}.`
      );
      return;
    }

    setDoctor(selected);

    setStep(3);
  };

  // =====================================================
  // GENERATE TOKEN
  // =====================================================

  const generateToken = () => {
    if (!doctor || !patient) {
      return;
    }

    const token = nextTokenForDoctor(
      doctor.id
    );

    const appointment = {
      id: `kiosk-${Date.now()}`,

      token,

      doctorId: doctor.id,

      doctorName: doctor.name,

      hospitalName:
        doctor.hospitalName ||
        hospitalName ||
        "Swasth QR Hospital",

      room:
        doctor.room ||
        doctor.roomNumber ||
        "-",

      department,

      problem,

      patientId:
        patient?._id || null,

      patientName:
        patient?.name || "Patient",

      patientAadhaar:
        patient?.adhar_no || "",

      patientAge:
        patient?.age || "",

      patientGender:
        patient?.gender || "",

      patientPhone:
        patient?.phone || "",

      date: new Date().toLocaleDateString(
        "en-IN"
      ),

      time: new Date().toLocaleTimeString(
        "en-IN",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      ),

      status: "waiting",
    };

    saveMyAppointment(appointment);

    saveQueue([
      ...getQueue(),
      {
        id: appointment.id,

        token,

        patient:
          patient?.name || "Patient",

        doctorId: doctor.id,

        status: "waiting",
      },
    ]);

    setResult(appointment);

    setStep(4);
  };

  // =====================================================
  // PRINT SLIP
  // =====================================================

  const printSlip = () => {
    if (!result) {
      return;
    }

    const printWindow = window.open(
      "",
      "_blank",
      "width=700,height=800"
    );

    if (!printWindow) {
      alert(
        "Please allow pop-ups to print the slip."
      );
      return;
    }

    const slipHTML = `
      <!DOCTYPE html>
      <html>
      <head>

        <title>Swasth QR Hospital Slip</title>

        <style>

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 30px;
            font-family: Arial, sans-serif;
            background: #ffffff;
            color: #111827;
          }

          .slip {
            width: 380px;
            margin: 0 auto;
            border: 1px solid #d1d5db;
            border-radius: 14px;
            padding: 22px;
          }

          .header {
            text-align: center;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 14px;
            margin-bottom: 16px;
          }

          .hospital {
            font-size: 20px;
            font-weight: 700;
          }

          .title {
            font-size: 14px;
            color: #2563eb;
            margin-top: 5px;
            font-weight: 600;
          }

          .token-box {
            text-align: center;
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 12px;
            padding: 15px;
            margin: 18px 0;
          }

          .token-label {
            font-size: 13px;
            color: #6b7280;
          }

          .token {
            font-size: 42px;
            font-weight: 800;
            color: #2563eb;
            margin-top: 5px;
          }

          .section {
            margin-top: 15px;
          }

          .section-title {
            font-size: 13px;
            font-weight: 700;
            color: #374151;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 6px;
            margin-bottom: 9px;
          }

          .row {
            display: flex;
            justify-content: space-between;
            gap: 10px;
            padding: 5px 0;
            font-size: 13px;
          }

          .label {
            color: #6b7280;
          }

          .value {
            font-weight: 600;
            text-align: right;
          }

          .footer {
            border-top: 1px solid #e5e7eb;
            margin-top: 18px;
            padding-top: 12px;
            text-align: center;
            font-size: 11px;
            color: #6b7280;
          }

          @media print {

            body {
              padding: 0;
            }

            .slip {
              border: 1px solid #999;
            }

          }

        </style>

      </head>

      <body>

        <div class="slip">

          <div class="header">

            <div class="hospital">
              ${escapeHTML(
                result.hospitalName
              )}
            </div>

            <div class="title">
              SWASTH QR APPOINTMENT SLIP
            </div>

          </div>

          <div class="token-box">

            <div class="token-label">
              TOKEN NUMBER
            </div>

            <div class="token">
              #${escapeHTML(
                String(result.token)
              )}
            </div>

          </div>

          <div class="section">

            <div class="section-title">
              Patient Details
            </div>

            <div class="row">
              <span class="label">
                Name
              </span>

              <span class="value">
                ${escapeHTML(
                  result.patientName
                )}
              </span>
            </div>

            <div class="row">
              <span class="label">
                Aadhaar
              </span>

              <span class="value">
                ${escapeHTML(
                  result.patientAadhaar || "-"
                )}
              </span>
            </div>

            <div class="row">
              <span class="label">
                Age
              </span>

              <span class="value">
                ${escapeHTML(
                  String(
                    result.patientAge || "-"
                  )
                )}
              </span>
            </div>

            <div class="row">
              <span class="label">
                Gender
              </span>

              <span class="value">
                ${escapeHTML(
                  result.patientGender || "-"
                )}
              </span>
            </div>

            <div class="row">
              <span class="label">
                Phone
              </span>

              <span class="value">
                ${escapeHTML(
                  result.patientPhone || "-"
                )}
              </span>
            </div>

          </div>

          <div class="section">

            <div class="section-title">
              Appointment Details
            </div>

            <div class="row">
              <span class="label">
                Department
              </span>

              <span class="value">
                ${escapeHTML(
                  result.department
                )}
              </span>
            </div>

            <div class="row">
              <span class="label">
                Doctor
              </span>

              <span class="value">
                ${escapeHTML(
                  result.doctorName
                )}
              </span>
            </div>

            <div class="row">
              <span class="label">
                Room
              </span>

              <span class="value">
                ${escapeHTML(
                  result.room || "-"
                )}
              </span>
            </div>

            <div class="row">
              <span class="label">
                Problem
              </span>

              <span class="value">
                ${escapeHTML(
                  result.problem ||
                    "Not specified"
                )}
              </span>
            </div>

            <div class="row">
              <span class="label">
                Date
              </span>

              <span class="value">
                ${escapeHTML(
                  result.date
                )}
              </span>
            </div>

            <div class="row">
              <span class="label">
                Time
              </span>

              <span class="value">
                ${escapeHTML(
                  result.time
                )}
              </span>
            </div>

            <div class="row">
              <span class="label">
                Status
              </span>

              <span class="value">
                Waiting
              </span>
            </div>

          </div>

          <div class="footer">

            Please keep this slip for your
            appointment and queue tracking.

            <br />

            Generated by Swasth QR

          </div>

        </div>

        <script>

          window.onload = function () {
            window.print();
          };

        </script>

      </body>
      </html>
    `;

    printWindow.document.open();

    printWindow.document.write(
      slipHTML
    );

    printWindow.document.close();
  };

  // =====================================================
  // DOWNLOAD SLIP
  // =====================================================

  const downloadSlip = () => {
    if (!result) {
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>

      <head>

        <meta charset="UTF-8" />

        <title>
          Swasth QR Slip -
          ${escapeHTML(
            String(result.token)
          )}
        </title>

        <style>

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 30px;
            background: #f3f4f6;
            font-family: Arial, sans-serif;
            color: #111827;
          }

          .slip {
            width: 380px;
            margin: auto;
            background: white;
            border: 1px solid #d1d5db;
            border-radius: 14px;
            padding: 22px;
          }

          .header {
            text-align: center;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 14px;
          }

          .hospital {
            font-size: 20px;
            font-weight: 700;
          }

          .title {
            color: #2563eb;
            font-size: 13px;
            font-weight: 700;
            margin-top: 5px;
          }

          .token-box {
            margin: 18px 0;
            padding: 15px;
            text-align: center;
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 12px;
          }

          .token-label {
            color: #6b7280;
            font-size: 12px;
          }

          .token {
            font-size: 42px;
            color: #2563eb;
            font-weight: 800;
            margin-top: 5px;
          }

          .section {
            margin-top: 16px;
          }

          .section-title {
            font-weight: 700;
            font-size: 13px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 6px;
            margin-bottom: 8px;
          }

          .row {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
            font-size: 13px;
            gap: 10px;
          }

          .label {
            color: #6b7280;
          }

          .value {
            font-weight: 600;
            text-align: right;
          }

          .footer {
            text-align: center;
            border-top: 1px solid #e5e7eb;
            margin-top: 18px;
            padding-top: 12px;
            font-size: 11px;
            color: #6b7280;
          }

        </style>

      </head>

      <body>

        <div class="slip">

          <div class="header">

            <div class="hospital">
              ${escapeHTML(
                result.hospitalName
              )}
            </div>

            <div class="title">
              SWASTH QR APPOINTMENT SLIP
            </div>

          </div>

          <div class="token-box">

            <div class="token-label">
              TOKEN NUMBER
            </div>

            <div class="token">
              #${escapeHTML(
                String(result.token)
              )}
            </div>

          </div>

          <div class="section">

            <div class="section-title">
              Patient Details
            </div>

            <div class="row">
              <span class="label">
                Name
              </span>

              <span class="value">
                ${escapeHTML(
                  result.patientName
                )}
              </span>
            </div>

            <div class="row">
              <span class="label">
                Aadhaar
              </span>

              <span class="value">
                ${escapeHTML(
                  result.patientAadhaar || "-"
                )}
              </span>
            </div>

            <div class="row">
              <span class="label">
                Age
              </span>

              <span class="value">
                ${escapeHTML(
                  String(
                    result.patientAge || "-"
                  )
                )}
              </span>
            </div>

            <div class="row">
              <span class="label">
                Gender
              </span>

              <span class="value">
                ${escapeHTML(
                  result.patientGender || "-"
                )}
              </span>
            </div>

          </div>

          <div class="section">

            <div class="section-title">
              Appointment Details
            </div>

            <div class="row">
              <span class="label">
                Department
              </span>

              <span class="value">
                ${escapeHTML(
                  result.department
                )}
              </span>
            </div>

            <div class="row">
              <span class="label">
                Doctor
              </span>

              <span class="value">
                ${escapeHTML(
                  result.doctorName
                )}
              </span>
            </div>

            <div class="row">
              <span class="label">
                Room
              </span>

              <span class="value">
                ${escapeHTML(
                  result.room || "-"
                )}
              </span>
            </div>

            <div class="row">
              <span class="label">
                Problem
              </span>

              <span class="value">
                ${escapeHTML(
                  result.problem ||
                    "Not specified"
                )}
              </span>
            </div>

            <div class="row">
              <span class="label">
                Date
              </span>

              <span class="value">
                ${escapeHTML(
                  result.date
                )}
              </span>
            </div>

            <div class="row">
              <span class="label">
                Time
              </span>

              <span class="value">
                ${escapeHTML(
                  result.time
                )}
              </span>
            </div>

            <div class="row">
              <span class="label">
                Status
              </span>

              <span class="value">
                Waiting
              </span>
            </div>

          </div>

          <div class="footer">

            Generated by Swasth QR

            <br />

            Please keep this slip for queue tracking.

          </div>

        </div>

      </body>

      </html>
    `;

    const blob = new Blob(
      [html],
      {
        type: "text/html;charset=utf-8",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      `Swasth-QR-Slip-Token-${result.token}.html`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // =====================================================
  // ESCAPE HTML
  // =====================================================

  function escapeHTML(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // =====================================================
  // RESET KIOSK
  // =====================================================

  const resetKiosk = () => {
    setStep(1);

    setVerificationMode(null);

    setScanning(false);

    setPatient(null);

    setAadhaar("");

    setScanError("");

    setSearching(false);

    setDepartment("");

    setProblem("");

    setDoctor(null);

    setResult(null);
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="page">

      <div className="container kiosk">

        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="between"
          style={{
            marginBottom: 16,
          }}
        >

          <div>

            <div className="eyebrow">
              Hospital Entry
            </div>

            <h1 className="section-title">
              Swasth QR Kiosk
            </h1>

            <p
              className="muted small"
              style={{
                marginTop: 4,
              }}
            >
              {hospitalName}
            </p>

          </div>

          <Link
            to="/"
            className="btn btn-outline"
          >
            Exit
          </Link>

        </div>

        <div className="kiosk-screen">

          {/* =================================================
              STEP 1
          ================================================= */}

          {step === 1 && (

            <div
              style={{
                textAlign: "center",
              }}
            >

              <div className="badge badge-blue">
                STEP 1 OF 4
              </div>

              <h2>
                Verify Patient
              </h2>

              <p className="muted">
                Verify the patient using
                their Swasth QR or Aadhaar.
              </p>

              {/* VERIFICATION OPTIONS */}

              {!verificationMode && (

                <div
                  style={{
                    maxWidth: 520,
                    margin: "25px auto",
                  }}
                >

                  <div
                    className="card"
                    style={{
                      boxShadow: "none",
                      padding: 20,
                    }}
                  >

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "1fr 1fr",
                        gap: 12,
                      }}
                    >

                      <button
                        className="btn btn-primary"
                        onClick={
                          startQRScan
                        }
                      >
                        📷 Scan Patient QR
                      </button>

                      <button
                        className="btn btn-outline"
                        onClick={() => {
                          setVerificationMode(
                            "aadhaar"
                          );

                          setScanError("");
                        }}
                      >
                        🔎 Search Aadhaar
                      </button>

                    </div>

                    <p
                      className="muted small"
                      style={{
                        marginTop: 14,
                      }}
                    >
                      QR scanning uses the
                      patient's camera-readable
                      Swasth QR from their profile.
                    </p>

                  </div>

                </div>

              )}

              {/* CAMERA QR SCANNER */}

              {verificationMode === "qr" && (

                <div
                  style={{
                    maxWidth: 420,
                    margin: "20px auto",
                  }}
                >

                  {!scanning &&
                    !patient && (

                      <button
                        className="btn btn-primary"
                        onClick={
                          startQRScan
                        }
                      >
                        📷 Start Camera Scanner
                      </button>

                    )}

                  {scanning && (

                    <div>

                      <QrReader
                        delay={300}
                        onError={
                          handleScanError
                        }
                        onScan={
                          handleScan
                        }
                        style={{
                          width: "100%",
                        }}
                      />

                      <p className="muted small">
                        Point the camera at
                        the patient's Swasth QR.
                      </p>

                      {searching && (
                        <p className="small">
                          Verifying patient...
                        </p>
                      )}

                      <button
                        className="btn btn-outline"
                        onClick={() => {
                          setScanning(false);

                          setVerificationMode(
                            null
                          );
                        }}
                      >
                        Cancel Scan
                      </button>

                    </div>

                  )}

                </div>

              )}

              {/* AADHAAR SEARCH */}

              {verificationMode ===
                "aadhaar" && (

                <div
                  style={{
                    maxWidth: 450,
                    margin: "25px auto",
                  }}
                >

                  <div
                    className="card"
                    style={{
                      boxShadow: "none",
                      padding: 20,
                    }}
                  >

                    <label className="label">

                      Aadhaar Number

                      <input
                        type="text"
                        value={aadhaar}
                        onChange={(e) =>
                          setAadhaar(
                            e.target.value
                          )
                        }
                        placeholder="Enter Aadhaar number"
                        className="input"
                        maxLength={12}
                      />

                    </label>

                    <button
                      className="btn btn-primary"
                      style={{
                        width: "100%",
                        marginTop: 12,
                      }}
                      onClick={
                        handleAadhaarSearch
                      }
                      disabled={searching}
                    >
                      {searching
                        ? "Searching..."
                        : "Search Patient"}
                    </button>

                    <button
                      className="btn btn-outline"
                      style={{
                        width: "100%",
                        marginTop: 8,
                      }}
                      onClick={() => {
                        setVerificationMode(
                          null
                        );

                        setAadhaar("");

                        setScanError("");
                      }}
                    >
                      ← Back
                    </button>

                  </div>

                </div>

              )}

              {/* ERROR */}

              {scanError && (

                <div
                  className="alert"
                  style={{
                    marginTop: 16,
                  }}
                >

                  ❌ {scanError}

                  <br />

                  <button
                    className="btn btn-outline"
                    style={{
                      marginTop: 10,
                    }}
                    onClick={() => {
                      setScanError("");

                      setPatient(null);

                      if (
                        verificationMode ===
                        "qr"
                      ) {
                        setScanning(true);
                      }
                    }}
                  >
                    Try Again
                  </button>

                </div>

              )}

            </div>

          )}

          {/* =================================================
              STEP 2
          ================================================= */}

          {step === 2 && patient && (

            <div>

              <div className="badge badge-blue">
                STEP 2 OF 4
              </div>

              <h2>
                Select Your Visit
              </h2>

              {/* PATIENT CARD */}

              <div
                className="card"
                style={{
                  boxShadow: "none",
                  padding: 18,
                  marginBottom: 18,
                }}
              >

                <div className="between">

                  <div>

                    <h3
                      style={{
                        margin: 0,
                      }}
                    >
                      {patient.name}
                    </h3>

                    <p className="muted">
                      Age:{" "}
                      {patient.age || "-"}
                      {" · "}
                      Gender:{" "}
                      {patient.gender || "-"}
                    </p>

                  </div>

                  <span className="badge badge-green">
                    ✓ Patient Verified
                  </span>

                </div>

                <p className="small muted">
                  Aadhaar:{" "}
                  {patient.adhar_no ||
                    "Not available"}
                </p>

              </div>

              {/* VISIT FORM */}

              <div className="form-grid">

                {/* DEPARTMENT */}

                <label className="label">

                  Department

                  <select
                    className="select"
                    value={department}
                    onChange={(e) => {
                      setDepartment(
                        e.target.value
                      );

                      /*
                       * Department change hone par
                       * previous selected doctor hata denge.
                       */
                      setDoctor(null);
                    }}
                  >

                    <option value="">
                      Choose department
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

                  {/* CURRENT HOSPITAL INFO */}

                  <span
                    className="muted small"
                    style={{
                      display: "block",
                      marginTop: 6,
                    }}
                  >
                    Departments available at{" "}
                    <b>
                      {hospitalName}
                    </b>
                  </span>

                </label>

                {/* PROBLEM */}

                <label className="label">

                  What is your problem?

                  <input
                    className="input"
                    value={problem}
                    onChange={(e) =>
                      setProblem(
                        e.target.value
                      )
                    }
                    placeholder="e.g. fever, knee pain..."
                  />

                </label>

                <button
                  className="btn btn-primary"
                  onClick={findDoctor}
                  disabled={!department}
                >
                  Find Available Doctor
                </button>

                <button
                  className="btn btn-outline"
                  onClick={resetKiosk}
                >
                  Scan Different Patient
                </button>

              </div>

            </div>

          )}

          {/* =================================================
              STEP 3
          ================================================= */}

          {step === 3 && doctor && (

            <div>

              <div className="badge badge-blue">
                STEP 3 OF 4
              </div>

              <h2>
                Doctor Suggested
              </h2>

              <div
                className="card"
                style={{
                  boxShadow: "none",
                  padding: 18,
                }}
              >

                <div className="between">

                  <div>

                    <h3
                      style={{
                        margin: 0,
                      }}
                    >
                      {doctor.name}
                    </h3>

                    <p className="muted">
                      {
                        doctor.specialization
                      }
                      {" · "}
                      Room{" "}
                      {doctor.room ||
                        doctor.roomNumber ||
                        "-"}
                    </p>

                  </div>

                  <span
                    className={`badge ${
                      doctor.active
                        ? "badge-green"
                        : "badge-red"
                    }`}
                  >
                    {doctor.active
                      ? "● Active"
                      : "● Unavailable"}
                  </span>

                </div>

                <div
                  style={{
                    marginTop: 14,
                  }}
                >

                  <p className="small muted">
                    Hospital:{" "}
                    <b>
                      {doctor.hospitalName ||
                        hospitalName}
                    </b>
                  </p>

                  <p className="small muted">
                    Patient:{" "}
                    <b>
                      {patient.name}
                    </b>
                  </p>

                  <p className="small muted">
                    Department:{" "}
                    <b>
                      {department}
                    </b>
                  </p>

                  <p className="small muted">
                    Problem:{" "}
                    <b>
                      {problem ||
                        "Not specified"}
                    </b>
                  </p>

                </div>

                <button
                  className="btn btn-primary"
                  style={{
                    width: "100%",
                    marginTop: 12,
                  }}
                  onClick={
                    generateToken
                  }
                  disabled={
                    !doctor.active
                  }
                >
                  Confirm & Generate Token
                </button>

                <button
                  className="btn btn-outline"
                  style={{
                    width: "100%",
                    marginTop: 8,
                  }}
                  onClick={() =>
                    setStep(2)
                  }
                >
                  ← Change Department
                </button>

              </div>

            </div>

          )}

          {/* =================================================
              STEP 4
          ================================================= */}

          {step === 4 && result && (

            <div
              style={{
                textAlign: "center",
              }}
            >

              <span className="badge badge-green">
                ✓ Check-in Complete
              </span>

              <h2>
                Appointment Confirmed
              </h2>

              <div className="token">
                #{result.token}
              </div>

              <p>

                <b>
                  {result.patientName}
                </b>

                <br />

                <b>
                  {result.doctorName}
                </b>

                <br />

                Room{" "}
                {result.room || "-"}
                {" · "}
                {result.department}

              </p>

              <div className="alert">
                You can now track your
                live queue on the patient
                screen.
              </div>

              {/* SLIP PREVIEW */}

              <div
                className="card"
                style={{
                  maxWidth: 420,
                  margin: "20px auto",
                  textAlign: "left",
                  boxShadow: "none",
                  padding: 20,
                }}
              >

                <div
                  style={{
                    textAlign: "center",
                    borderBottom:
                      "1px solid #e5e7eb",
                    paddingBottom: 12,
                    marginBottom: 12,
                  }}
                >

                  <h3
                    style={{
                      margin: 0,
                    }}
                  >
                    {result.hospitalName}
                  </h3>

                  <p
                    className="muted small"
                    style={{
                      marginTop: 4,
                    }}
                  >
                    Swasth QR Appointment
                    Slip
                  </p>

                </div>

                <div
                  style={{
                    textAlign: "center",
                    padding: 14,
                    background: "#eff6ff",
                    borderRadius: 10,
                    marginBottom: 14,
                  }}
                >

                  <div className="muted small">
                    TOKEN NUMBER
                  </div>

                  <div
                    style={{
                      fontSize: 36,
                      fontWeight: 800,
                      color: "#2563eb",
                    }}
                  >
                    #{result.token}
                  </div>

                </div>

                <div className="small">

                  <p>
                    <b>Name:</b>{" "}
                    {result.patientName}
                  </p>

                  <p>
                    <b>Aadhaar:</b>{" "}
                    {result.patientAadhaar ||
                      "-"}
                  </p>

                  <p>
                    <b>Department:</b>{" "}
                    {result.department}
                  </p>

                  <p>
                    <b>Doctor:</b>{" "}
                    {result.doctorName}
                  </p>

                  <p>
                    <b>Room:</b>{" "}
                    {result.room || "-"}
                  </p>

                  <p>
                    <b>Problem:</b>{" "}
                    {result.problem ||
                      "Not specified"}
                  </p>

                  <p>
                    <b>Date:</b>{" "}
                    {result.date}
                  </p>

                  <p>
                    <b>Time:</b>{" "}
                    {result.time}
                  </p>

                  <p>
                    <b>Status:</b>{" "}
                    Waiting
                  </p>

                </div>

              </div>

              {/* PRINT + DOWNLOAD */}

              <div
                className="row"
                style={{
                  justifyContent: "center",
                  marginTop: 18,
                  flexWrap: "wrap",
                }}
              >

                <button
                  className="btn btn-primary"
                  onClick={printSlip}
                >
                  🖨 Print Slip
                </button>

                <button
                  className="btn btn-outline"
                  onClick={
                    downloadSlip
                  }
                >
                  ⬇ Download Slip
                </button>

              </div>

              {/* OTHER ACTIONS */}

              <div
                className="row"
                style={{
                  justifyContent: "center",
                  marginTop: 14,
                  flexWrap: "wrap",
                }}
              >

                <Link
                  className="btn btn-outline"
                  to="/patient"
                >
                  Open My Queue
                </Link>

                <button
                  className="btn btn-outline"
                  onClick={
                    resetKiosk
                  }
                >
                  New Check-in
                </button>

              </div>

            </div>

          )}

        </div>
      </div>

    </main>
  );
}
