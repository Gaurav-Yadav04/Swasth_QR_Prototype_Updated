
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import html2canvas from "html2canvas";
import api from "../api/api";

const defaultProfile = {
  name: "",
  fatherName: "",
  email: "",
  phone: "",
  age: "",
  gender: "",
  bloodGroup: "",
  adhar_no: "",
  address: "",
  allergies: "None",
  medicines: "None",
  medicalHistory: "No major medical history",
  emergencyContact: "",
  qrCode: "",
};

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingQR, setDownloadingQR] = useState(false);

  const [profile, setProfile] = useState(defaultProfile);

  const cardRef = useRef(null);

  const patientId = localStorage.getItem("swasth_patient_id");

  useEffect(() => {
    const loadProfile = async () => {
      if (!patientId) {
        const localProfile = localStorage.getItem(
          "swasth_patient_profile"
        );

        if (localProfile) {
          try {
            setProfile({
              ...defaultProfile,
              ...JSON.parse(localProfile),
            });
          } catch {
            setProfile(defaultProfile);
          }
        }

        setLoading(false);
        return;
      }

      try {
        const res = await api.get(`/patients/${patientId}`);

        const patient = res.data;

        setProfile({
          ...defaultProfile,
          name: patient.name || "",
          fatherName: patient.fatherName || "",
          age: patient.age || "",
          gender: patient.gender || "",
          phone: patient.phone || "",
          adhar_no: patient.adhar_no || "",
          address: patient.address || "",
          email: patient.email || "",
          bloodGroup: patient.bloodGroup || "",
          allergies: patient.allergies || "None",
          medicines: patient.medicines || "None",
          medicalHistory:
            patient.medicalHistory ||
            "No major medical history",
          emergencyContact:
            patient.emergencyContact || "",
          qrCode: patient.qrCode || "",
        });

        localStorage.setItem(
          "swasth_patient_profile",
          JSON.stringify(patient)
        );
      } catch (err) {
        console.error("Profile load error:", err);

        const localProfile = localStorage.getItem(
          "swasth_patient_profile"
        );

        if (localProfile) {
          try {
            setProfile({
              ...defaultProfile,
              ...JSON.parse(localProfile),
            });
          } catch {
            setProfile(defaultProfile);
          }
        } else {
          setError("Unable to load profile.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [patientId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSaved(false);
    setError("");
  };

  const handleSave = async () => {
    try {
      setError("");

      if (!patientId) {
        localStorage.setItem(
          "swasth_patient_profile",
          JSON.stringify(profile)
        );

        setIsEditing(false);
        setSaved(true);

        setTimeout(() => {
          setSaved(false);
        }, 2500);

        return;
      }

      const res = await api.put(
        `/patients/${patientId}`,
        profile
      );

      const patient = res.data;

      setProfile({
        ...defaultProfile,
        name: patient.name || "",
        fatherName: patient.fatherName || "",
        age: patient.age || "",
        gender: patient.gender || "",
        phone: patient.phone || "",
        adhar_no: patient.adhar_no || "",
        address: patient.address || "",
        email: patient.email || "",
        bloodGroup: patient.bloodGroup || "",
        allergies: patient.allergies || "None",
        medicines: patient.medicines || "None",
        medicalHistory:
          patient.medicalHistory ||
          "No major medical history",
        emergencyContact:
          patient.emergencyContact || "",
        qrCode: patient.qrCode || "",
      });

      localStorage.setItem(
        "swasth_patient_profile",
        JSON.stringify(patient)
      );

      setIsEditing(false);
      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (err) {
      console.error("Profile update error:", err);

      setError(
        err.response?.data?.message ||
          "Profile could not be updated."
      );
    }
  };

  // =========================================================
  // DOWNLOAD COMPACT SWASTH QR CARD
  // =========================================================
  const handleDownloadQR = async () => {
    if (!profile.qrCode) {
      setError("QR code is not available.");
      return;
    }

    if (!cardRef.current) {
      setError("Unable to generate patient card.");
      return;
    }

    try {
      setError("");
      setDownloadingQR(true);

      await new Promise((resolve) =>
        setTimeout(resolve, 300)
      );

      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const image = canvas.toDataURL(
        "image/png",
        1.0
      );

      const link = document.createElement("a");

      const safeName =
        profile.name
          ?.trim()
          ?.replace(/[^a-zA-Z0-9]/g, "-") ||
        "Patient";

      link.download = `Swasth-QR-Card-${safeName}.png`;
      link.href = image;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(
        "Patient QR card download error:",
        err
      );

      setError(
        "Unable to download Swasth QR card. Please try again."
      );
    } finally {
      setDownloadingQR(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500">
          Loading profile...
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">

          {/* HEADER */}
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-600">
                <Link
                  to="/"
                  className="hover:underline"
                >
                  Home
                </Link>

                <span className="text-slate-400">
                  /
                </span>

                <span className="text-slate-500">
                  Profile
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                My Profile
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-slate-500 sm:text-base">
                Manage your personal and healthcare
                information in one place.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {saved && (
                <span className="text-sm font-medium text-green-600">
                  ✓ Saved
                </span>
              )}

              <button
                type="button"
                onClick={() =>
                  isEditing
                    ? handleSave()
                    : setIsEditing(true)
                }
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
              >
                {isEditing
                  ? "Save Changes"
                  : "Edit Profile"}
              </button>
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">

            {/* PERSONAL INFORMATION */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl">
                  👤
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Personal Information
                  </h2>

                  <p className="text-sm text-slate-500">
                    Basic information about you
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">

                {/* FULL NAME */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-600"
                  />
                </div>

                {/* FATHER NAME */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Father Name
                  </label>

                  <input
                    type="text"
                    name="fatherName"
                    value={profile.fatherName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                  />
                </div>

                {/* AGE */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Age
                  </label>

                  <input
                    type="number"
                    name="age"
                    value={profile.age}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                  />
                </div>

                {/* GENDER */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Gender
                  </label>

                  <select
                    name="gender"
                    value={profile.gender}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                  >
                    <option value="">
                      Select Gender
                    </option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>

                {/* BLOOD GROUP */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Blood Group
                  </label>

                  <select
                    name="bloodGroup"
                    value={profile.bloodGroup}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                  >
                    <option value="">
                      Select Blood Group
                    </option>
                    <option>A+</option>
                    <option>A-</option>
                    <option>B+</option>
                    <option>B-</option>
                    <option>AB+</option>
                    <option>AB-</option>
                    <option>O+</option>
                    <option>O-</option>
                  </select>
                </div>

                {/* AADHAAR */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Aadhaar Number
                  </label>

                  <input
                    type="text"
                    name="adhar_no"
                    value={profile.adhar_no}
                    disabled
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600"
                  />
                </div>

                {/* EMAIL */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                  />
                </div>

                {/* PHONE */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                  />
                </div>

                {/* ADDRESS */}
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Address
                  </label>

                  <textarea
                    name="address"
                    value={profile.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                  />
                </div>
              </div>
            </section>

            {/* MEDICAL INFORMATION */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl">
                  ⚕️
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Medical Information
                  </h2>

                  <p className="text-sm text-slate-500">
                    Important healthcare information
                  </p>
                </div>
              </div>

              <div className="space-y-4">

                {/* ALLERGIES */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Allergies
                  </label>

                  <textarea
                    name="allergies"
                    value={profile.allergies}
                    onChange={handleChange}
                    disabled={!isEditing}
                    rows={3}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                  />
                </div>

                {/* MEDICINES */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Current Medicines
                  </label>

                  <textarea
                    name="medicines"
                    value={profile.medicines}
                    onChange={handleChange}
                    disabled={!isEditing}
                    rows={3}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                  />
                </div>

                {/* MEDICAL HISTORY */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Medical History
                  </label>

                  <textarea
                    name="medicalHistory"
                    value={profile.medicalHistory}
                    onChange={handleChange}
                    disabled={!isEditing}
                    rows={3}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                  />
                </div>
              </div>
            </section>

            {/* EMERGENCY CONTACT */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-xl">
                  🚨
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Emergency Contact
                  </h2>

                  <p className="text-sm text-slate-500">
                    Person to contact during an emergency
                  </p>
                </div>
              </div>

              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Emergency Contact Number
              </label>

              <input
                type="tel"
                name="emergencyContact"
                value={profile.emergencyContact}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
              />
            </section>

            {/* SWASTH QR */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl">
                  ▦
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    My Swasth QR
                  </h2>

                  <p className="text-sm text-slate-500">
                    Quick hospital check-in
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-5 rounded-2xl bg-slate-50 p-5">

                {profile.qrCode ? (
                  <>
                    <img
                      src={profile.qrCode}
                      alt="Patient QR"
                      className="h-40 w-40 rounded-xl border bg-white p-2 object-contain"
                    />

                    <button
                      type="button"
                      onClick={handleDownloadQR}
                      disabled={downloadingQR}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                    >
                      {downloadingQR ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Creating Card...
                        </>
                      ) : (
                        <>
                          <span className="text-base">
                            ↓
                          </span>
                          Download QR Card
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <div className="flex h-40 w-40 items-center justify-center rounded-xl border-2 border-dashed border-blue-300 bg-white text-6xl text-slate-700">
                    ▦
                  </div>
                )}

                <p className="text-center text-sm leading-6 text-slate-500">
                  Download your Swasth QR Patient Card
                  for quick hospital check-in.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* =====================================================
          COMPACT SWASTH QR DOWNLOAD CARD
          Emergency contact removed from this card.
          ===================================================== */}
      <div
        style={{
          position: "fixed",
          left: "-10000px",
          top: "0",
          width: "860px",
          pointerEvents: "none",
        }}
      >
        <div
          ref={cardRef}
          style={{
            width: "860px",
            height: "480px",
            background: "#ffffff",
            border: "1px solid #dbe3ef",
            borderRadius: "24px",
            overflow: "hidden",
            fontFamily:
              "Arial, Helvetica, sans-serif",
          }}
        >
          {/* HEADER */}
          <div
            style={{
              height: "90px",
              background:
                "linear-gradient(135deg, #2563eb, #1d4ed8)",
              padding: "18px 28px",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "27px",
                  fontWeight: "800",
                  letterSpacing: "-0.5px",
                }}
              >
                Swasth QR
              </div>

              <div
                style={{
                  marginTop: "3px",
                  fontSize: "13px",
                  opacity: "0.9",
                }}
              >
                Digital Patient Identity Card
              </div>
            </div>

            <div
              style={{
                textAlign: "right",
              }}
            >
              <div
                style={{
                  fontSize: "10px",
                  opacity: "0.8",
                  letterSpacing: "1px",
                }}
              >
                PATIENT CARD
              </div>

              <div
                style={{
                  marginTop: "3px",
                  fontSize: "14px",
                  fontWeight: "700",
                }}
              >
                SWASTH
              </div>
            </div>
          </div>

          {/* BODY */}
          <div
            style={{
              display: "flex",
              height: "340px",
            }}
          >
            {/* LEFT DETAILS */}
            <div
              style={{
                width: "62%",
                padding: "23px 28px",
                borderRight: "1px solid #e2e8f0",
              }}
            >
              {/* NAME */}
              <div
                style={{
                  marginBottom: "17px",
                }}
              >
                <div
                  style={{
                    fontSize: "10px",
                    color: "#64748b",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Patient Name
                </div>

                <div
                  style={{
                    marginTop: "3px",
                    fontSize: "23px",
                    color: "#0f172a",
                    fontWeight: "800",
                  }}
                >
                  {profile.name || "Patient Name"}
                </div>
              </div>

              {/* DETAILS */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap: "15px 28px",
                }}
              >
                {/* FATHER NAME */}
                <div>
                  <div
                    style={{
                      fontSize: "9px",
                      color: "#64748b",
                      fontWeight: "700",
                    }}
                  >
                    FATHER NAME
                  </div>

                  <div
                    style={{
                      marginTop: "3px",
                      fontSize: "13px",
                      color: "#1e293b",
                      fontWeight: "600",
                    }}
                  >
                    {profile.fatherName ||
                      "Not Provided"}
                  </div>
                </div>

                {/* AGE */}
                <div>
                  <div
                    style={{
                      fontSize: "9px",
                      color: "#64748b",
                      fontWeight: "700",
                    }}
                  >
                    AGE
                  </div>

                  <div
                    style={{
                      marginTop: "3px",
                      fontSize: "13px",
                      color: "#1e293b",
                      fontWeight: "600",
                    }}
                  >
                    {profile.age || "--"} Years
                  </div>
                </div>

                {/* GENDER */}
                <div>
                  <div
                    style={{
                      fontSize: "9px",
                      color: "#64748b",
                      fontWeight: "700",
                    }}
                  >
                    GENDER
                  </div>

                  <div
                    style={{
                      marginTop: "3px",
                      fontSize: "13px",
                      color: "#1e293b",
                      fontWeight: "600",
                    }}
                  >
                    {profile.gender || "--"}
                  </div>
                </div>

                {/* BLOOD GROUP */}
                <div>
                  <div
                    style={{
                      fontSize: "9px",
                      color: "#64748b",
                      fontWeight: "700",
                    }}
                  >
                    BLOOD GROUP
                  </div>

                  <div
                    style={{
                      marginTop: "2px",
                      fontSize: "16px",
                      color: "#dc2626",
                      fontWeight: "800",
                    }}
                  >
                    {profile.bloodGroup || "--"}
                  </div>
                </div>

                {/* PHONE */}
                <div>
                  <div
                    style={{
                      fontSize: "9px",
                      color: "#64748b",
                      fontWeight: "700",
                    }}
                  >
                    PHONE
                  </div>

                  <div
                    style={{
                      marginTop: "3px",
                      fontSize: "13px",
                      color: "#1e293b",
                      fontWeight: "600",
                    }}
                  >
                    {profile.phone ||
                      "Not Provided"}
                  </div>
                </div>

                {/* AADHAAR */}
                <div>
                  <div
                    style={{
                      fontSize: "9px",
                      color: "#64748b",
                      fontWeight: "700",
                    }}
                  >
                    AADHAAR NUMBER
                  </div>

                  <div
                    style={{
                      marginTop: "3px",
                      fontSize: "13px",
                      color: "#1e293b",
                      fontWeight: "600",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {profile.adhar_no ||
                      "Not Provided"}
                  </div>
                </div>

                {/* ADDRESS */}
                <div
                  style={{
                    gridColumn: "1 / -1",
                  }}
                >
                  <div
                    style={{
                      fontSize: "9px",
                      color: "#64748b",
                      fontWeight: "700",
                    }}
                  >
                    ADDRESS
                  </div>

                  <div
                    style={{
                      marginTop: "3px",
                      fontSize: "12px",
                      color: "#334155",
                      lineHeight: "1.4",
                    }}
                  >
                    {profile.address ||
                      "Address not provided"}
                  </div>
                </div>
              </div>
            </div>

            {/* QR SIDE */}
            <div
              style={{
                width: "38%",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "#f8fafc",
              }}
            >
              <div
                style={{
                  fontSize: "15px",
                  color: "#0f172a",
                  fontWeight: "800",
                  marginBottom: "10px",
                }}
              >
                Scan to Identify
              </div>

              <div
                style={{
                  width: "215px",
                  height: "215px",
                  padding: "10px",
                  background: "#ffffff",
                  border: "2px solid #cbd5e1",
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={profile.qrCode}
                  alt="Swasth Patient QR"
                  crossOrigin="anonymous"
                  style={{
                    width: "190px",
                    height: "190px",
                    objectFit: "contain",
                  }}
                />
              </div>

              <div
                style={{
                  marginTop: "10px",
                  textAlign: "center",
                  color: "#64748b",
                  fontSize: "10px",
                  lineHeight: "1.4",
                  maxWidth: "220px",
                }}
              >
                Scan this QR at a Swasth QR
                hospital kiosk for quick patient
                identification.
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div
            style={{
              height: "50px",
              padding: "0 28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "1px solid #e2e8f0",
              background: "#ffffff",
            }}
          >
            <div
              style={{
                fontSize: "10px",
                color: "#64748b",
              }}
            >
              Swasth QR • Digital Healthcare
            </div>

            <div
              style={{
                fontSize: "10px",
                color: "#64748b",
              }}
            >
              Keep this card safe
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

