import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import QrReader from "../components/QrReader";

export default function HospitalKiosk() {
  const [step, setStep] = useState(1);

  const [hospitalName, setHospitalName] = useState(
    localStorage.getItem("hospitalName") || "Swasth QR Hospital"
  );

  const [hospitalId, setHospitalId] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [doctorError, setDoctorError] = useState("");

  const [verificationMode, setVerificationMode] = useState(null);
  const [scanning, setScanning] = useState(false);

  const [patient, setPatient] = useState(null);
  const [aadhaar, setAadhaar] = useState("");

  const [searching, setSearching] = useState(false);
  const [scanError, setScanError] = useState("");

  const [department, setDepartment] = useState("");
  const [problem, setProblem] = useState("");

  const [doctor, setDoctor] = useState(null);
  const [recommendedDoctors, setRecommendedDoctors] = useState([]);

  const [booking, setBooking] = useState(false);
  const [result, setResult] = useState(null);

  const getHospitalToken = () => {
    const keys = [
      "hospitalToken",
      "hospital_token",
      "hospitalAuthToken",
      "hospitalAccessToken",
      "token",
    ];

    for (const key of keys) {
      const token = localStorage.getItem(key);

      if (token && token.trim()) {
        return token.trim();
      }
    }

    return "";
  };

  const getTokenPayload = () => {
    const token = getHospitalToken();

    if (!token) return {};

    try {
      const parts = token.split(".");

      if (parts.length !== 3) return {};

      const base64 = parts[1]
        .replace(/-/g, "+")
        .replace(/_/g, "/");

      const padded = base64.padEnd(
        base64.length + ((4 - (base64.length % 4)) % 4),
        "="
      );

      return JSON.parse(atob(padded));
    } catch (error) {
      console.error("Token payload error:", error);
      return {};
    }
  };

  const getAuthConfig = () => {
    const token = getHospitalToken();

    if (!token) {
      return {};
    }

    return {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
  };

  const getHospitalId = (source) => {
    if (!source) return "";

    if (typeof source === "string") {
      return source;
    }

    return (
      source._id ||
      source.id ||
      source.hospitalId ||
      source.hospital_id ||
      ""
    );
  };

  const getDoctorHospitalId = (doctorItem) => {
    if (!doctorItem) return "";

    if (
      doctorItem.hospital &&
      typeof doctorItem.hospital === "object"
    ) {
      return getHospitalId(doctorItem.hospital);
    }

    return (
      doctorItem.hospital ||
      doctorItem.hospitalId ||
      doctorItem.hospital_id ||
      ""
    );
  };

  const getDoctorHospitalName = (doctorItem) => {
    if (!doctorItem) return "";

    if (
      doctorItem.hospital &&
      typeof doctorItem.hospital === "object"
    ) {
      return (
        doctorItem.hospital.name ||
        doctorItem.hospital.hospitalName ||
        ""
      );
    }

    return (
      doctorItem.hospitalName ||
      doctorItem.hospital_name ||
      ""
    );
  };

  /*
   * Queue data backend se different naam se aa sakta hai.
   * Isliye yahan common queue fields ko check kiya gaya hai.
   *
   * Important:
   * currentToken ko queue count nahi maana gaya hai.
   * currentToken doctor ka currently running token ho sakta hai.
   */
  const getDoctorQueue = (doctorItem) => {
    if (!doctorItem) {
      return null;
    }

    const directFields = [
      "queueCount",
      "waitingCount",
      "waitingPatients",
      "currentQueue",
      "queueLength",
      "pendingCount",
      "pendingAppointments",
      "waitingAppointmentCount",
      "todayWaiting",
      "todayWaitingCount",
      "activeQueueCount",
      "activeAppointmentsCount",
      "appointmentsCount",
      "appointmentCount",
      "totalWaiting",
      "totalWaitingPatients",
    ];

    for (const field of directFields) {
      const value = doctorItem?.[field];

      if (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        !Number.isNaN(Number(value))
      ) {
        return Number(value);
      }
    }

    /*
     * Kuch APIs queue ko nested object me bhejti hain:
     *
     * queue: {
     *   count: 5
     * }
     *
     * stats: {
     *   queueCount: 5
     * }
     */
    const nestedObjects = [
      doctorItem.queue,
      doctorItem.stats,
      doctorItem.statistics,
      doctorItem.today,
      doctorItem.todayStats,
      doctorItem.queueStats,
      doctorItem.appointmentStats,
      doctorItem.appointments,
    ];

    const nestedFields = [
      "count",
      "queueCount",
      "waitingCount",
      "waitingPatients",
      "currentQueue",
      "length",
      "pendingCount",
      "pendingAppointments",
      "activeQueueCount",
      "activeAppointmentsCount",
      "totalWaiting",
    ];

    for (const object of nestedObjects) {
      if (!object || typeof object !== "object") {
        continue;
      }

      for (const field of nestedFields) {
        const value = object?.[field];

        if (
          value !== undefined &&
          value !== null &&
          value !== "" &&
          !Number.isNaN(Number(value))
        ) {
          return Number(value);
        }
      }
    }

    /*
     * Agar queue array directly mil rahi hai,
     * to waiting/non-completed appointments count kar sakte hain.
     */
    const possibleArrays = [
      doctorItem.queue,
      doctorItem.appointments,
      doctorItem.waitingAppointments,
      doctorItem.activeAppointments,
    ];

    for (const list of possibleArrays) {
      if (!Array.isArray(list)) {
        continue;
      }

      const waitingList = list.filter((item) => {
        const status = String(
          item?.status ||
            item?.appointmentStatus ||
            ""
        )
          .trim()
          .toLowerCase();

        if (
          status === "completed" ||
          status === "cancelled" ||
          status === "canceled"
        ) {
          return false;
        }

        return true;
      });

      return waitingList.length;
    }

    return null;
  };

  /*
   * Sorting ke liye queue available na ho to doctor ko
   * last priority di jaati hai.
   */
  const getDoctorLoad = (doctorItem) => {
    const queue = getDoctorQueue(doctorItem);

    if (queue === null) {
      return 999999;
    }

    return queue;
  };

  const formatQueue = (doctorItem) => {
    const queue = getDoctorQueue(doctorItem);

    if (queue === null) {
      return {
        value: null,
        label: "Not available",
        subLabel: "Queue data not returned",
      };
    }

    if (queue === 0) {
      return {
        value: 0,
        label: "0",
        subLabel: "No patients waiting",
      };
    }

    return {
      value: queue,
      label: String(queue),
      subLabel: queue === 1 ? "patient waiting" : "patients waiting",
    };
  };

  const getDoctorInitial = (name) => {
    return (
      name
        ?.replace(/^Dr\.?\s*/i, "")
        ?.trim()
        ?.charAt(0)
        ?.toUpperCase() || "D"
    );
  };

  useEffect(() => {
    try {
      const savedHospital = localStorage.getItem("hospital");

      let hospital = null;

      if (savedHospital) {
        try {
          hospital = JSON.parse(savedHospital);
        } catch {
          hospital = null;
        }
      }

      const tokenPayload = getTokenPayload();

      const id =
        hospital?._id ||
        hospital?.id ||
        hospital?.hospitalId ||
        tokenPayload?.hospitalId ||
        tokenPayload?.id ||
        tokenPayload?._id ||
        localStorage.getItem("hospitalId") ||
        "";

      const name =
        hospital?.name ||
        hospital?.hospitalName ||
        tokenPayload?.hospitalName ||
        localStorage.getItem("hospitalName") ||
        "Swasth QR Hospital";

      setHospitalId(String(id || ""));
      setHospitalName(name);

      if (id) {
        localStorage.setItem("hospitalId", String(id));
      }

      localStorage.setItem("hospitalName", name);
    } catch (error) {
      console.error("Hospital data error:", error);
    }
  }, []);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setDoctorsLoading(true);
        setDoctorError("");

        const res = await api.get("/doctors/public");

        const list = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.doctors)
          ? res.data.doctors
          : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

        console.log("PUBLIC DOCTORS:", list);

        list.forEach((item) => {
          console.log("Doctor queue data:", {
            name: item?.name,
            queueCount: item?.queueCount,
            waitingCount: item?.waitingCount,
            currentQueue: item?.currentQueue,
            queue: item?.queue,
            appointmentsCount: item?.appointmentsCount,
            appointmentCount: item?.appointmentCount,
            currentToken: item?.currentToken,
          });
        });

        setDoctors(list);

        if (list.length === 0) {
          setDoctorError("No doctors are available.");
        }
      } catch (error) {
        console.error("Get doctors error:", error);

        setDoctorError(
          error.response?.data?.message ||
            error.response?.data?.error ||
            "Unable to load doctors."
        );

        setDoctors([]);
      } finally {
        setDoctorsLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const hospitalDoctors = useMemo(() => {
    if (!Array.isArray(doctors)) return [];

    const currentId = String(hospitalId || "").trim();

    const currentName = String(hospitalName || "")
      .trim()
      .toLowerCase();

    if (!currentId && !currentName) {
      return doctors;
    }

    const hasHospitalData = doctors.some((item) => {
      return (
        getDoctorHospitalId(item) ||
        getDoctorHospitalName(item)
      );
    });

    if (!hasHospitalData) {
      return doctors;
    }

    return doctors.filter((item) => {
      const doctorHospitalId = String(
        getDoctorHospitalId(item) || ""
      ).trim();

      const doctorHospitalName = String(
        getDoctorHospitalName(item) || ""
      )
        .trim()
        .toLowerCase();

      if (currentId && doctorHospitalId) {
        return doctorHospitalId === currentId;
      }

      if (currentName && doctorHospitalName) {
        return doctorHospitalName === currentName;
      }

      return false;
    });
  }, [doctors, hospitalId, hospitalName]);

  const departments = useMemo(() => {
    return [
      ...new Set(
        hospitalDoctors
          .map(
            (item) =>
              item?.department ||
              item?.specialization
          )
          .filter(Boolean)
      ),
    ];
  }, [hospitalDoctors]);

  const startQRScan = () => {
    setVerificationMode("qr");
    setScanning(true);
    setPatient(null);
    setScanError("");
  };

  const handleScanError = (error) => {
    console.error("QR scanner error:", error);
  };

  const handleScan = async (data) => {
    if (!data || patient || searching) {
      return;
    }

    try {
      setSearching(true);
      setScanError("");

      const qrValue = String(data).trim();

      const res = await api.get(`/patients/${qrValue}`);

      if (!res.data) {
        throw new Error("Patient not found");
      }

      setPatient(res.data);
      setScanning(false);
      setVerificationMode("verified");
      setStep(2);
    } catch (error) {
      console.error("QR patient error:", error);

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

  const handleAadhaarSearch = async () => {
    if (!aadhaar.trim()) {
      setScanError("Please enter Aadhaar number.");
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
      setStep(2);
    } catch (error) {
      console.error("Aadhaar search error:", error);

      setPatient(null);

      setScanError(
        error.response?.data?.message ||
          "Patient not found with this Aadhaar number."
      );
    } finally {
      setSearching(false);
    }
  };

  const findDoctor = () => {
    if (!patient) {
      setScanError("Please verify patient first.");
      return;
    }

    if (!department) {
      setScanError("Please select a department.");
      return;
    }

    if (!problem.trim()) {
      setScanError(
        "Please enter patient's problem/disease."
      );
      return;
    }

    setScanError("");

    const matchingDoctors = hospitalDoctors.filter(
      (item) => {
        const doctorDepartment =
          item?.department ||
          item?.specialization ||
          "";

        return (
          String(doctorDepartment)
            .trim()
            .toLowerCase() ===
          String(department)
            .trim()
            .toLowerCase()
        );
      }
    );

    const activeDoctors = matchingDoctors.filter(
      (item) => item.active !== false
    );

    if (activeDoctors.length === 0) {
      setDoctor(null);
      setRecommendedDoctors([]);

      setScanError(
        `No active doctor found for ${department} at ${hospitalName}.`
      );

      return;
    }

    const sortedDoctors = [...activeDoctors].sort(
      (a, b) => {
        const loadA = getDoctorLoad(a);
        const loadB = getDoctorLoad(b);

        return loadA - loadB;
      }
    );

    setRecommendedDoctors(sortedDoctors);
    setDoctor(sortedDoctors[0]);
    setStep(3);
  };

  const selectDoctor = (selectedDoctor) => {
    if (!selectedDoctor) return;

    if (selectedDoctor.active === false) {
      setScanError(
        "This doctor is currently unavailable."
      );
      return;
    }

    setDoctor(selectedDoctor);
    setScanError("");
  };

  const generateToken = async () => {
    if (!patient || !doctor) {
      return;
    }

    const token = getHospitalToken();

    if (!token) {
      setScanError(
        "Hospital login token is missing. Please login again."
      );
      return;
    }

    const doctorId = doctor._id || doctor.id;

    const currentHospitalId =
      hospitalId ||
      getDoctorHospitalId(doctor);

    if (!doctorId) {
      setScanError(
        "Doctor ID is missing. Cannot create appointment."
      );
      return;
    }

    if (!currentHospitalId) {
      setScanError(
        "Hospital ID is missing. Please login again."
      );
      return;
    }

    if (doctor.active === false) {
      setScanError(
        "This doctor is currently unavailable."
      );
      return;
    }

    if (!problem.trim()) {
      setScanError(
        "Please enter patient's problem/disease."
      );
      return;
    }

    try {
      setBooking(true);
      setScanError("");

      const res = await api.post(
        "/appointments/kiosk",
        {
          patientId: patient._id,
          doctorId,
          hospitalId: currentHospitalId,
          disease: problem.trim(),
        },
        getAuthConfig()
      );

      if (res.data?.success === false) {
        throw new Error(
          res.data?.message ||
            "Unable to create appointment."
        );
      }

      const appointment =
        res.data?.appointment ||
        res.data?.data?.appointment ||
        res.data?.data ||
        res.data;

      const snapshot =
        appointment?.patientSnapshot || {};

      const tokenNumber =
        res.data?.tokenNumber ??
        snapshot?.tokenNumber ??
        appointment?.tokenNumber ??
        "-";

      const patientAddress =
        patient?.address &&
        typeof patient.address === "object"
          ? [
              patient.address.house,
              patient.address.street,
              patient.address.city,
              patient.address.district,
              patient.address.state,
              patient.address.pincode,
            ]
              .filter(Boolean)
              .join(", ")
          : patient?.address || "-";

      const finalResult = {
        ...appointment,

        appointmentId:
          res.data?.appointmentId ||
          appointment?._id ||
          "",

        tokenNumber,

        hospitalId:
          appointment?.hospitalId ||
          currentHospitalId,

        hospitalName,

        doctorId,

        doctorName:
          snapshot?.doctor ||
          doctor?.name ||
          "-",

        department:
          snapshot?.department ||
          doctor?.department ||
          doctor?.specialization ||
          department ||
          "-",

        room:
          snapshot?.roomNo ||
          doctor?.roomNumber ||
          doctor?.room ||
          "-",

        problem:
          snapshot?.disease ||
          problem.trim(),

        patientId:
          appointment?.patientId ||
          patient?._id ||
          "",

        patientName:
          snapshot?.name ||
          patient?.name ||
          "Patient",

        patientAadhaar:
          patient?.adhar_no ||
          "-",

        patientFatherName:
          patient?.fatherName ||
          patient?.father_name ||
          patient?.father ||
          "-",

        patientAge:
          patient?.age ??
          "-",

        patientGender:
          patient?.gender ||
          "-",

        patientPhone:
          snapshot?.phone ||
          patient?.phone ||
          patient?.mobile ||
          "-",

        patientAddress,

        date:
          snapshot?.visitDate ||
          appointment?.createdAt ||
          new Date().toISOString(),

        status:
          snapshot?.status ||
          "waiting",
      };

      console.log(
        "KIOSK APPOINTMENT CREATED:",
        finalResult
      );

      setResult(finalResult);
      setStep(4);
    } catch (error) {
      console.error(
        "Kiosk appointment error:",
        error
      );

      if (error.response?.status === 401) {
        setScanError(
          error.response?.data?.message ||
            "Hospital token is invalid or expired. Please login again."
        );
      } else {
        setScanError(
          error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            "Unable to create appointment."
        );
      }
    } finally {
      setBooking(false);
    }
  };

  const formatDate = (value) => {
    if (!value) {
      return new Date().toLocaleDateString("en-IN");
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString("en-IN");
  };

  const formatTime = (value) => {
    if (!value) {
      return new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const printSlip = () => {
    if (!result) return;

    const printWindow = window.open(
      "",
      "_blank",
      "width=650,height=900"
    );

    if (!printWindow) {
      alert(
        "Please allow pop-ups to print the slip."
      );
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <title>Swasth QR Appointment Slip</title>

        <style>
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 20px;
            font-family: Arial, sans-serif;
            color: #111827;
            background: #ffffff;
          }

          .slip {
            width: 430px;
            max-width: 100%;
            margin: auto;
            border: 1px solid #d1d5db;
            border-radius: 14px;
            overflow: hidden;
            background: #ffffff;
          }

          .header {
            text-align: center;
            padding: 20px;
            border-bottom: 1px solid #e5e7eb;
          }

          .hospital {
            font-size: 21px;
            font-weight: 700;
          }

          .title {
            margin-top: 6px;
            color: #2563eb;
            font-size: 13px;
            font-weight: 700;
          }

          .token-section {
            padding: 18px 20px;
            text-align: center;
            background: #eff6ff;
            border-bottom: 1px solid #dbeafe;
          }

          .token-label {
            color: #64748b;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
          }

          .token {
            margin-top: 3px;
            color: #2563eb;
            font-size: 46px;
            line-height: 1.1;
            font-weight: 800;
          }

          .status {
            margin-top: 6px;
            color: #16a34a;
            font-size: 12px;
            font-weight: 600;
            text-transform: capitalize;
          }

          .section {
            padding: 16px 20px 4px;
          }

          .section-title {
            margin-bottom: 8px;
            padding-bottom: 7px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 14px;
            font-weight: 700;
          }

          .row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 12px;
            padding: 5px 0;
            font-size: 13px;
          }

          .label {
            min-width: 100px;
            color: #64748b;
          }

          .value {
            max-width: 68%;
            text-align: right;
            font-weight: 600;
            word-break: break-word;
          }

          .footer {
            margin-top: 16px;
            padding: 14px 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #64748b;
            font-size: 11px;
            line-height: 1.5;
          }

          @media print {
            body {
              padding: 0;
            }

            .slip {
              width: 100%;
              border-radius: 0;
            }
          }
        </style>
      </head>

      <body>
        <div class="slip">

          <div class="header">
            <div class="hospital">
              ${result.hospitalName || "-"}
            </div>

            <div class="title">
              SWASTH QR APPOINTMENT SLIP
            </div>
          </div>

          <div class="token-section">
            <div class="token-label">
              TOKEN NUMBER
            </div>

            <div class="token">
              #${result.tokenNumber}
            </div>

            <div class="status">
              Status: ${result.status || "waiting"}
            </div>
          </div>

          <div class="section">
            <div class="section-title">
              Patient Details
            </div>

            <div class="row">
              <span class="label">Name</span>
              <span class="value">${result.patientName || "-"}</span>
            </div>

            <div class="row">
              <span class="label">Aadhaar</span>
              <span class="value">${result.patientAadhaar || "-"}</span>
            </div>

            <div class="row">
              <span class="label">Father Name</span>
              <span class="value">${result.patientFatherName || "-"}</span>
            </div>

            <div class="row">
              <span class="label">Age</span>
              <span class="value">${result.patientAge || "-"}</span>
            </div>

            <div class="row">
              <span class="label">Gender</span>
              <span class="value">${result.patientGender || "-"}</span>
            </div>

            <div class="row">
              <span class="label">Phone</span>
              <span class="value">${result.patientPhone || "-"}</span>
            </div>

            <div class="row">
              <span class="label">Address</span>
              <span class="value">${result.patientAddress || "-"}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">
              Appointment Details
            </div>

            <div class="row">
              <span class="label">Department</span>
              <span class="value">${result.department || "-"}</span>
            </div>

            <div class="row">
              <span class="label">Doctor</span>
              <span class="value">${result.doctorName || "-"}</span>
            </div>

            <div class="row">
              <span class="label">Room</span>
              <span class="value">${result.room || "-"}</span>
            </div>

            <div class="row">
              <span class="label">Problem</span>
              <span class="value">${result.problem || "-"}</span>
            </div>

            <div class="row">
              <span class="label">Visit Date</span>
              <span class="value">${formatDate(result.date)}</span>
            </div>

            <div class="row">
              <span class="label">Visit Time</span>
              <span class="value">${formatTime(result.date)}</span>
            </div>

            <div class="row">
              <span class="label">Appointment ID</span>
              <span class="value">${result.appointmentId || "-"}</span>
            </div>
          </div>

          <div class="footer">
            Please keep this slip for queue tracking.
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
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const resetKiosk = () => {
    setStep(1);
    setVerificationMode(null);
    setScanning(false);

    setPatient(null);
    setAadhaar("");

    setSearching(false);
    setScanError("");

    setDepartment("");
    setProblem("");

    setDoctor(null);
    setRecommendedDoctors([]);

    setBooking(false);
    setResult(null);
  };

  const steps = [
    { number: 1, label: "Verify" },
    { number: 2, label: "Visit" },
    { number: 3, label: "Doctor" },
    { number: 4, label: "Done" },
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xl font-black text-white">
              S
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold text-slate-900 sm:text-xl">
                Swasth QR
              </h1>

              <p className="truncate text-xs text-slate-500 sm:text-sm">
                Hospital OPD Kiosk
              </p>
            </div>
          </div>

          <Link
            to="/hospital-dashboard"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 sm:px-4 sm:text-sm"
          >
            <span>←</span>

            <span className="hidden sm:inline">
              Hospital Dashboard
            </span>

            <span className="sm:hidden">
              Dashboard
            </span>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Hospital header */}
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
              OPD Registration
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
              {hospitalName}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Verify patient, select department and generate
              an OPD token.
            </p>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-full bg-green-50 px-3 py-2 text-xs font-semibold text-green-700">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Kiosk Online
          </div>
        </div>

        {doctorError && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {doctorError}
          </div>
        )}

        {/* Main */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Stepper */}
          <div className="border-b border-slate-200 px-4 py-5 sm:px-8">
            <div className="mx-auto max-w-3xl">
              <div className="flex items-center">
                {steps.map((item, index) => {
                  const completed = item.number < step;
                  const current = item.number === step;

                  return (
                    <div
                      key={item.number}
                      className="flex flex-1 items-center"
                    >
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${
                            completed || current
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          {completed ? "✓" : item.number}
                        </div>

                        <span
                          className={`mt-2 text-[11px] font-semibold sm:text-xs ${
                            current || completed
                              ? "text-blue-600"
                              : "text-slate-400"
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>

                      {index < steps.length - 1 && (
                        <div
                          className={`mx-2 mb-5 h-0.5 flex-1 ${
                            item.number < step
                              ? "bg-blue-600"
                              : "bg-slate-200"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-7 lg:p-10">
            {/* STEP 1 */}
            {step === 1 && (
              <div className="mx-auto max-w-2xl">
                <div className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
                    🪪
                  </div>

                  <p className="mt-5 text-xs font-bold uppercase tracking-wider text-blue-600">
                    Step 1 of 4
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                    Verify Patient
                  </h2>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Scan the patient's Swasth QR or search
                    using Aadhaar number.
                  </p>
                </div>

                {!verificationMode && (
                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={startQRScan}
                      className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-left transition hover:border-blue-400 hover:bg-blue-100"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xl text-white">
                          📷
                        </div>

                        <div>
                          <p className="font-bold text-slate-900">
                            Scan Patient QR
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Fast verification
                          </p>
                        </div>

                        <span className="ml-auto text-lg text-blue-600">
                          →
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setVerificationMode("aadhaar");
                        setScanError("");
                      }}
                      className="rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-blue-300 hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xl">
                          🔎
                        </div>

                        <div>
                          <p className="font-bold text-slate-900">
                            Search Aadhaar
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Enter 12-digit Aadhaar
                          </p>
                        </div>

                        <span className="ml-auto text-lg text-slate-400">
                          →
                        </span>
                      </div>
                    </button>
                  </div>
                )}

                {/* QR */}
                {verificationMode === "qr" && (
                  <div className="mt-7">
                    {scanning && (
                      <>
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black">
                          <QrReader
                            delay={300}
                            onError={handleScanError}
                            onScan={handleScan}
                            style={{
                              width: "100%",
                            }}
                          />
                        </div>

                        {searching && (
                          <div className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-blue-600">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
                            Verifying patient...
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setScanning(false);
                            setVerificationMode(null);
                          }}
                          className="mt-4 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
                        >
                          Cancel Scan
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* Aadhaar */}
                {verificationMode === "aadhaar" && (
                  <div className="mx-auto mt-7 max-w-lg rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
                    <label className="block text-left text-sm font-semibold text-slate-700">
                      Aadhaar Number

                      <input
                        type="text"
                        value={aadhaar}
                        maxLength={12}
                        inputMode="numeric"
                        onChange={(e) => {
                          setAadhaar(
                            e.target.value.replace(
                              /\D/g,
                              ""
                            )
                          );
                        }}
                        placeholder="Enter 12-digit Aadhaar number"
                        className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={handleAadhaarSearch}
                      disabled={searching}
                      className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white hover:bg-blue-700 disabled:bg-blue-300"
                    >
                      {searching
                        ? "Searching Patient..."
                        : "Search Patient"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setVerificationMode(null);
                        setAadhaar("");
                        setScanError("");
                      }}
                      className="mt-2 w-full rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-white"
                    >
                      ← Choose another method
                    </button>
                  </div>
                )}

                {scanError && (
                  <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left text-sm text-red-700">
                    {scanError}
                  </div>
                )}
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && patient && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Step 2 of 4
                </p>

                <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                  Patient Visit Details
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Select the department and enter the patient's
                  main problem.
                </p>

                <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100 text-lg font-bold text-green-700">
                        {patient.name
                          ?.charAt(0)
                          ?.toUpperCase() || "P"}
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900">
                          {patient.name || "Patient"}
                        </h3>

                        <p className="mt-1 text-sm text-slate-600">
                          Age: {patient.age || "-"} · Gender:{" "}
                          {patient.gender || "-"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Aadhaar:{" "}
                          {patient.adhar_no || "-"}
                        </p>
                      </div>
                    </div>

                    <span className="w-fit rounded-full bg-white px-3 py-2 text-xs font-bold text-green-700 shadow-sm">
                      ✓ Patient Verified
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-bold text-slate-700">
                      Department
                    </label>

                    {doctorsLoading ? (
                      <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-500">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
                        Loading departments...
                      </div>
                    ) : (
                      <select
                        value={department}
                        onChange={(e) => {
                          setDepartment(e.target.value);
                          setDoctor(null);
                          setRecommendedDoctors([]);
                          setScanError("");
                        }}
                        className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      >
                        <option value="">
                          Choose department
                        </option>

                        {departments.map((item) => (
                          <option
                            key={item}
                            value={item}
                          >
                            {item}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-bold text-slate-700">
                      Patient Problem
                    </label>

                    <input
                      value={problem}
                      onChange={(e) =>
                        setProblem(e.target.value)
                      }
                      placeholder="e.g. fever, knee pain..."
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {scanError && (
                  <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {scanError}
                  </div>
                )}

                <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={resetKiosk}
                    className="rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Scan Different Patient
                  </button>

                  <button
                    type="button"
                    onClick={findDoctor}
                    disabled={
                      !department ||
                      !problem.trim() ||
                      doctorsLoading
                    }
                    className="rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white hover:bg-blue-700 disabled:bg-blue-300 sm:flex-1"
                  >
                    Find Available Doctor →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && doctor && (
              <div className="mx-auto max-w-4xl">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Step 3 of 4
                </p>

                <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                  Select Doctor
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Choose an available doctor for this patient's
                  visit.
                </p>

                {/* Selected doctor */}
                <div className="mt-6 overflow-hidden rounded-2xl border border-blue-200 bg-blue-50">
                  <div className="border-b border-blue-100 px-5 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                          Selected Doctor
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Recommended based on availability
                          and queue
                        </p>
                      </div>

                      <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700">
                        ● Available
                      </span>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold text-white">
                          {getDoctorInitial(
                            doctor.name
                          )}
                        </div>

                        <div>
                          <h3 className="text-xl font-bold text-slate-900">
                            {doctor.name || "Doctor"}
                          </h3>

                          <p className="mt-1 text-sm font-semibold text-blue-600">
                            {doctor.department ||
                              doctor.specialization ||
                              department}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
                              Room{" "}
                              {doctor.roomNumber ||
                                doctor.room ||
                                "-"}
                            </span>

                            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
                              {doctor.availableTime?.from &&
                              doctor.availableTime?.to
                                ? `${doctor.availableTime.from} - ${doctor.availableTime.to}`
                                : doctor.timing ||
                                  doctor.timings ||
                                  "As per schedule"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* REAL QUEUE */}
                      {(() => {
                        const queue =
                          formatQueue(doctor);

                        return (
                          <div className="min-w-[150px] rounded-xl border border-blue-100 bg-white px-4 py-3 text-center shadow-sm">
                            <p className="text-xs font-semibold text-slate-500">
                              Current Queue
                            </p>

                            {queue.value === null ? (
                              <>
                                <p className="mt-1 text-base font-bold text-amber-600">
                                  Not available
                                </p>

                                <p className="mt-1 text-[11px] text-slate-400">
                                  Queue data not returned
                                </p>
                              </>
                            ) : (
                              <>
                                <p className="mt-1 text-3xl font-extrabold text-slate-900">
                                  {queue.label}
                                </p>

                                <p className="text-[11px] text-slate-500">
                                  {queue.subLabel}
                                </p>
                              </>
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    <div className="mt-5 rounded-xl border border-blue-100 bg-white p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Patient Problem
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {problem}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Other doctors */}
                {recommendedDoctors.length > 0 && (
                  <div className="mt-8">
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-slate-900">
                        Available Doctors
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Other active doctors in{" "}
                        {department}.
                      </p>
                    </div>

                    <div className="grid gap-3">
                      {recommendedDoctors.map(
                        (recommendedDoctor, index) => {
                          const isSelected =
                            String(
                              recommendedDoctor._id ||
                                recommendedDoctor.id
                            ) ===
                            String(
                              doctor._id ||
                                doctor.id
                            );

                          const queue =
                            formatQueue(
                              recommendedDoctor
                            );

                          return (
                            <button
                              key={
                                recommendedDoctor._id ||
                                recommendedDoctor.id ||
                                `${recommendedDoctor.name}-${index}`
                              }
                              type="button"
                              onClick={() =>
                                selectDoctor(
                                  recommendedDoctor
                                )
                              }
                              className={`w-full rounded-2xl border p-4 text-left transition ${
                                isSelected
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                              }`}
                            >
                              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex min-w-0 items-center gap-3">
                                  <div
                                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                                      isSelected
                                        ? "bg-blue-600 text-white"
                                        : "bg-slate-100 text-slate-600"
                                    }`}
                                  >
                                    {getDoctorInitial(
                                      recommendedDoctor.name
                                    )}
                                  </div>

                                  <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <h4 className="truncate text-base font-bold text-slate-900">
                                        {recommendedDoctor.name ||
                                          "Doctor"}
                                      </h4>

                                      {isSelected && (
                                        <span className="rounded-full bg-blue-600 px-2 py-1 text-[10px] font-bold text-white">
                                          Selected
                                        </span>
                                      )}
                                    </div>

                                    <p className="mt-1 text-sm text-blue-600">
                                      {recommendedDoctor.specialization ||
                                        recommendedDoctor.department ||
                                        department}
                                    </p>
                                  </div>
                                </div>

                                {/* Queue */}
                                <div className="flex flex-wrap items-center gap-2">
                                  {queue.value ===
                                  null ? (
                                    <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                                      Queue unavailable
                                    </span>
                                  ) : queue.value ===
                                    0 ? (
                                    <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                                      No Queue
                                    </span>
                                  ) : (
                                    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                                      {queue.value}{" "}
                                      {queue.value ===
                                      1
                                        ? "patient"
                                        : "patients"}{" "}
                                      waiting
                                    </span>
                                  )}

                                  {index === 0 &&
                                    queue.value !==
                                      null && (
                                      <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                                        Lowest Queue
                                      </span>
                                    )}
                                </div>
                              </div>

                              <div className="mt-4 grid gap-3 border-t border-slate-100 pt-3 text-xs sm:grid-cols-3">
                                <p className="text-slate-500">
                                  Room:{" "}
                                  <span className="font-semibold text-slate-700">
                                    {recommendedDoctor.roomNumber ||
                                      recommendedDoctor.room ||
                                      "-"}
                                  </span>
                                </p>

                                <p className="text-slate-500">
                                  Timing:{" "}
                                  <span className="font-semibold text-slate-700">
                                    {recommendedDoctor.availableTime?.from &&
                                    recommendedDoctor.availableTime?.to
                                      ? `${recommendedDoctor.availableTime.from} - ${recommendedDoctor.availableTime.to}`
                                      : recommendedDoctor.timing ||
                                        recommendedDoctor.timings ||
                                        "As per schedule"}
                                  </span>
                                </p>

                                <p className="text-slate-500">
                                  Status:{" "}
                                  <span className="font-semibold text-green-600">
                                    Available
                                  </span>
                                </p>
                              </div>
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>
                )}

                {scanError && (
                  <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {scanError}
                  </div>
                )}

                <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(2);
                      setDoctor(null);
                      setRecommendedDoctors([]);
                    }}
                    disabled={booking}
                    className="rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
                  >
                    ← Change Department
                  </button>

                  <button
                    type="button"
                    onClick={generateToken}
                    disabled={
                      booking ||
                      doctor.active === false
                    }
                    className="rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white hover:bg-blue-700 disabled:bg-blue-300 sm:flex-1"
                  >
                    {booking
                      ? "Creating Appointment..."
                      : "Generate Token →"}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4 */}
            {step === 4 && result && (
              <div className="mx-auto max-w-3xl">
                <div className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">
                    ✓
                  </div>

                  <p className="mt-5 text-xs font-bold uppercase tracking-wider text-green-600">
                    Appointment Confirmed
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                    Token Generated
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Appointment successfully created.
                  </p>
                </div>

                <div className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-200 px-5 py-6 text-center">
                    <p className="text-xl font-bold text-slate-900">
                      {result.hospitalName}
                    </p>

                    <p className="mt-1 text-xs font-bold tracking-wide text-blue-600">
                      SWASTH QR APPOINTMENT SLIP
                    </p>
                  </div>

                  <div className="bg-blue-600 px-5 py-7 text-center text-white">
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-100">
                      Token Number
                    </p>

                    <p className="mt-1 text-6xl font-black">
                      #{result.tokenNumber}
                    </p>

                    <div className="mt-3 inline-flex rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold">
                      Status:
                      <span className="ml-1 capitalize">
                        {result.status || "waiting"}
                      </span>
                    </div>
                  </div>

                  <div className="border-b border-slate-200 p-5 sm:p-6">
                    <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-800">
                      Patient Details
                    </h3>

                    <div className="overflow-hidden rounded-xl border border-slate-200">
                      {[
                        ["Name", result.patientName],
                        [
                          "Aadhaar",
                          result.patientAadhaar,
                        ],
                        [
                          "Father Name",
                          result.patientFatherName,
                        ],
                        ["Age", result.patientAge],
                        [
                          "Gender",
                          result.patientGender,
                        ],
                        [
                          "Phone",
                          result.patientPhone,
                        ],
                        [
                          "Address",
                          result.patientAddress,
                        ],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="flex items-start justify-between gap-4 border-b border-slate-100 px-4 py-3 last:border-b-0"
                        >
                          <span className="shrink-0 text-sm text-slate-500">
                            {label}
                          </span>

                          <span className="max-w-[65%] break-words text-right text-sm font-semibold text-slate-800">
                            {value || "-"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-5 sm:p-6">
                    <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-800">
                      Appointment Details
                    </h3>

                    <div className="overflow-hidden rounded-xl border border-slate-200">
                      {[
                        [
                          "Department",
                          result.department,
                        ],
                        ["Doctor", result.doctorName],
                        ["Room", result.room],
                        ["Problem", result.problem],
                        [
                          "Visit Date",
                          formatDate(result.date),
                        ],
                        [
                          "Visit Time",
                          formatTime(result.date),
                        ],
                        [
                          "Appointment ID",
                          result.appointmentId,
                        ],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="flex items-start justify-between gap-4 border-b border-slate-100 px-4 py-3 last:border-b-0"
                        >
                          <span className="shrink-0 text-sm text-slate-500">
                            {label}
                          </span>

                          <span className="max-w-[65%] break-all text-right text-sm font-semibold text-slate-800">
                            {value || "-"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-200 bg-slate-50 px-5 py-4 text-center text-xs leading-5 text-slate-500">
                    Please keep this slip for queue tracking.
                    <br />
                    Generated by Swasth QR
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={printSlip}
                    className="rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white hover:bg-blue-700"
                  >
                    🖨 Print Appointment Slip
                  </button>

                  <button
                    type="button"
                    onClick={resetKiosk}
                    className="rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
                  >
                    + New Patient
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-col items-center justify-between gap-2 text-center text-xs text-slate-400 sm:flex-row sm:text-left">
          <p>
            © Swasth QR · Smart Hospital Queue System
          </p>

          <p>
            Need help? Contact hospital reception.
          </p>
        </div>
      </div>
    </main>
  );
}