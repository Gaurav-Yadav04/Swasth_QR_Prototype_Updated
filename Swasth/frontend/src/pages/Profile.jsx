
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

  const [profile, setProfile] = useState(defaultProfile);

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
        const res = await api.get(
          `/patients/${patientId}`
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">
          Loading profile...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

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

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">

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
                <img
                  src={profile.qrCode}
                  alt="Patient QR"
                  className="h-40 w-40 rounded-xl border bg-white p-2 object-contain"
                />
              ) : (
                <div className="flex h-40 w-40 items-center justify-center rounded-xl border-2 border-dashed border-blue-300 bg-white text-6xl text-slate-700">
                  ▦
                </div>
              )}

              <p className="text-center text-sm leading-6 text-slate-500">
                Scan this QR at a Swasth QR hospital kiosk
                to quickly identify the patient.
              </p>

            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
