import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  specialization: "",
  department: "",
  roomNumber: "",
  from: "",
  to: "",
  password: "",
  active: true,
};

export default function ManageDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  /*
  ====================================================
  HOSPITAL TOKEN
  ====================================================
  */

  const getHospitalToken = () => {
    return localStorage.getItem("hospitalToken") || "";
  };

  /*
  ====================================================
  AUTH HEADERS
  ====================================================
  */

  const getAuthConfig = () => {
    const token = getHospitalToken();

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  /*
  ====================================================
  FETCH DOCTORS
  ====================================================
  */

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getHospitalToken();

      if (!token) {
        setError("Hospital login required.");
        setDoctors([]);
        return;
      }

      const res = await api.get(
        "/doctors",
        getAuthConfig()
      );

      console.log(
        "HOSPITAL DOCTORS RESPONSE:",
        res.data
      );

      /*
      ==================================================
      NORMALIZE BACKEND RESPONSE
      ==================================================

      Supported:

      1. Array
         [
           doctor1,
           doctor2
         ]

      2. Object
         {
           doctors: []
         }

      3. Object
         {
           data: []
         }
      ==================================================
      */

      let doctorList = [];

      if (Array.isArray(res.data)) {
        doctorList = res.data;
      } else if (
        Array.isArray(res.data?.doctors)
      ) {
        doctorList = res.data.doctors;
      } else if (
        Array.isArray(res.data?.data)
      ) {
        doctorList = res.data.data;
      }

      console.log(
        "NORMALIZED DOCTORS:",
        doctorList
      );

      setDoctors(doctorList);
    } catch (err) {
      console.error(
        "GET DOCTORS ERROR:",
        err
      );

      if (err.response?.status === 401) {
        setError(
          "Hospital login expired. Please login again."
        );
      } else {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Unable to load doctors."
        );
      }

      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  /*
  ====================================================
  INITIAL LOAD
  ====================================================
  */

  useEffect(() => {
    fetchDoctors();
  }, []);

  /*
  ====================================================
  FORM CHANGE
  ====================================================
  */

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setError("");
  };

  /*
  ====================================================
  RESET FORM
  ====================================================
  */

  const resetForm = () => {
    setFormData({ ...emptyForm });
    setEditingId(null);
    setError("");
  };

  /*
  ====================================================
  ADD / UPDATE DOCTOR
  ====================================================
  */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    const token = getHospitalToken();

    if (!token) {
      setError("Hospital login required.");
      setSaving(false);
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        specialization:
          formData.specialization.trim(),
        department:
          formData.department.trim(),
        roomNumber:
          formData.roomNumber.trim(),
        active: formData.active,

        availableTime: {
          from: formData.from,
          to: formData.to,
        },
      };

      /*
      ==================================================
      PASSWORD
      ==================================================
      */

      if (formData.password.trim()) {
        payload.password =
          formData.password;
      }

      /*
      ==================================================
      UPDATE DOCTOR
      ==================================================
      */

      if (editingId) {
        await api.put(
          `/doctors/${editingId}`,
          payload,
          getAuthConfig()
        );

        setMessage(
          "Doctor updated successfully."
        );
      }

      /*
      ==================================================
      ADD DOCTOR
      ==================================================
      */

      else {
        if (!formData.password.trim()) {
          setError(
            "Password is required for a new doctor."
          );

          setSaving(false);
          return;
        }

        await api.post(
          "/doctors/add",
          payload,
          getAuthConfig()
        );

        setMessage(
          "Doctor added successfully."
        );
      }

      resetForm();

      await fetchDoctors();
    } catch (err) {
      console.error(
        "SAVE DOCTOR ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
  ====================================================
  EDIT DOCTOR
  ====================================================
  */

  const handleEdit = (doctor) => {
    if (!doctor) return;

    setEditingId(doctor._id);

    setFormData({
      name: doctor.name || "",
      email: doctor.email || "",
      phone: doctor.phone || "",
      specialization:
        doctor.specialization || "",
      department:
        doctor.department || "",
      roomNumber:
        doctor.roomNumber || "",

      from:
        doctor.availableTime?.from || "",

      to:
        doctor.availableTime?.to || "",

      password: "",

      active:
        doctor.active !== false,
    });

    setError("");
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
  ====================================================
  DELETE DOCTOR
  ====================================================
  */

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this doctor?"
    );

    if (!confirmDelete) {
      return;
    }

    const token = getHospitalToken();

    if (!token) {
      setError("Hospital login required.");
      return;
    }

    try {
      setError("");
      setMessage("");

      await api.delete(
        `/doctors/${id}`,
        getAuthConfig()
      );

      setMessage(
        "Doctor deleted successfully."
      );

      if (
        String(editingId) ===
        String(id)
      ) {
        resetForm();
      }

      await fetchDoctors();
    } catch (err) {
      console.error(
        "DELETE DOCTOR ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to delete doctor."
      );
    }
  };

  /*
  ====================================================
  TOGGLE DOCTOR STATUS
  ====================================================
  */

  const toggleStatus = async (doctor) => {
    const token = getHospitalToken();

    if (!token) {
      setError("Hospital login required.");
      return;
    }

    try {
      setError("");
      setMessage("");

      await api.put(
        `/doctors/${doctor._id}`,
        {
          active:
            doctor.active === false,
        },
        getAuthConfig()
      );

      setMessage(
        doctor.active === false
          ? "Doctor activated successfully."
          : "Doctor deactivated successfully."
      );

      await fetchDoctors();
    } catch (err) {
      console.error(
        "TOGGLE DOCTOR ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to update doctor status."
      );
    }
  };

  /*
  ====================================================
  SAFETY
  ====================================================
  */

  const doctorList = Array.isArray(doctors)
    ? doctors
    : [];

  /*
  ====================================================
  PAGE
  ====================================================
  */

  return (
    <main className="min-h-screen bg-gray-100 px-3 py-4 sm:px-4 sm:py-6">
      <div className="mx-auto w-full max-w-7xl">

        {/* BACK */}

        <div className="mb-4 sm:mb-5">
          <Link
            to="/hospital-dashboard"
            className="inline-flex items-center text-sm sm:text-base font-semibold text-blue-600 hover:text-blue-700"
          >
            ← Back to Hospital Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">

          {/* ==================================================
              ADD / EDIT FORM
          ================================================== */}

          <section className="h-fit min-w-0 rounded-2xl bg-white p-4 shadow-sm sm:p-6">

            <div className="mb-5">
              <p className="text-sm font-semibold text-blue-600">
                Hospital Panel
              </p>

              <h1 className="mt-1 text-xl font-bold text-gray-800 sm:text-2xl">
                {editingId
                  ? "Update Doctor"
                  : "Add Doctor"}
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Add or update doctor information.
              </p>
            </div>

            {/* ERROR */}

            {error && (
              <div className="mb-4 break-words rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-600 sm:px-4">
                {error}
              </div>
            )}

            {/* SUCCESS */}

            {message && (
              <div className="mb-4 break-words rounded-lg border border-green-200 bg-green-50 px-3 py-3 text-sm text-green-600 sm:px-4">
                {message}
              </div>
            )}

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >

              {/* NAME */}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Doctor Name
                </label>

                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Dr. Name"
                  required
                  className="w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* EMAIL */}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="doctor@example.com"
                  required
                  className="w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* PHONE */}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Phone
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone number"
                  inputMode="numeric"
                  className="w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* DEPARTMENT */}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Department
                </label>

                <input
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="General Medicine"
                  required
                  className="w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* SPECIALIZATION */}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Specialization
                </label>

                <input
                  name="specialization"
                  value={
                    formData.specialization
                  }
                  onChange={handleChange}
                  placeholder="General Medicine"
                  required
                  className="w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* ROOM */}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Room Number
                </label>

                <input
                  name="roomNumber"
                  value={
                    formData.roomNumber
                  }
                  onChange={handleChange}
                  placeholder="204"
                  className="w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* TIMING */}

              <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2">

                <div className="min-w-0">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    From
                  </label>

                  <input
                    type="time"
                    name="from"
                    value={formData.from}
                    onChange={handleChange}
                    className="w-full min-w-0 rounded-lg border border-gray-300 px-2 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="min-w-0">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    To
                  </label>

                  <input
                    type="time"
                    name="to"
                    value={formData.to}
                    onChange={handleChange}
                    className="w-full min-w-0 rounded-lg border border-gray-300 px-2 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

              </div>

              {/* PASSWORD */}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {editingId
                    ? "New Password (optional)"
                    : "Password"}
                </label>

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Doctor password"
                  required={!editingId}
                  className="w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* ACTIVE */}

              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 px-3 py-3">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                  className="h-4 w-4 shrink-0"
                />

                <span className="text-sm font-medium text-gray-700">
                  Doctor is active
                </span>
              </label>

              {/* BUTTONS */}

              <div className="flex flex-col gap-2 min-[380px]:flex-row">

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300 min-[380px]:flex-1"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Doctor"
                    : "Add Doctor"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="w-full rounded-lg bg-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-300 min-[380px]:w-auto"
                  >
                    Cancel
                  </button>
                )}

              </div>

            </form>
          </section>

          {/* ==================================================
              EXISTING DOCTORS
          ================================================== */}

          <section className="min-w-0 rounded-2xl bg-white p-4 shadow-sm sm:p-6 lg:col-span-2">

            <div className="mb-5">
              <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">
                Existing Doctors
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Only doctors belonging to your hospital are shown here.
              </p>
            </div>

            {/* LOADING */}

            {loading ? (
              <div className="py-10 text-center">
                <p className="text-sm text-gray-500">
                  Loading doctors...
                </p>
              </div>
            ) : doctorList.length === 0 ? (

              /* NO DOCTORS */

              <div className="rounded-xl border border-dashed p-8 text-center sm:p-10">
                <p className="text-sm text-gray-500">
                  No doctors found.
                </p>
              </div>

            ) : (

              /* DOCTOR LIST */

              <div className="space-y-4">

                {doctorList.map((doctor) => {

                  if (!doctor) {
                    return null;
                  }

                  return (
                    <div
                      key={doctor._id}
                      className="min-w-0 rounded-xl border p-4 sm:p-5"
                    >

                      {/* TOP */}

                      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">

                        <div className="min-w-0 flex-1">

                          <div className="flex flex-wrap items-center gap-2 sm:gap-3">

                            <h3 className="max-w-full break-words text-base font-bold text-gray-800 sm:text-lg">
                              {doctor.name ||
                                "Doctor"}
                            </h3>

                            <span
                              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                doctor.active ===
                                false
                                  ? "bg-red-100 text-red-600"
                                  : "bg-green-100 text-green-600"
                              }`}
                            >
                              {doctor.active ===
                              false
                                ? "Inactive"
                                : "Active"}
                            </span>

                          </div>

                          <p className="mt-1 break-words text-sm text-gray-500">
                            {doctor.specialization ||
                              "Specialization not set"}
                          </p>

                        </div>

                        {/* ACTIONS */}

                        <div className="flex w-full flex-wrap gap-2 xl:w-auto xl:justify-end">

                          <button
                            type="button"
                            onClick={() =>
                              toggleStatus(
                                doctor
                              )
                            }
                            className="flex-1 rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 min-[400px]:flex-none sm:text-sm"
                          >
                            {doctor.active ===
                            false
                              ? "Activate"
                              : "Deactivate"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(
                                doctor
                              )
                            }
                            className="flex-1 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-100 min-[400px]:flex-none sm:text-sm"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                doctor._id
                              )
                            }
                            className="flex-1 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 min-[400px]:flex-none sm:text-sm"
                          >
                            Delete
                          </button>

                        </div>

                      </div>

                      {/* DETAILS */}

                      <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">

                        <div className="min-w-0">
                          <span className="text-gray-500">
                            Email:
                          </span>{" "}
                          <span className="break-all">
                            {doctor.email || "-"}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <span className="text-gray-500">
                            Phone:
                          </span>{" "}
                          <span className="break-words">
                            {doctor.phone || "-"}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <span className="text-gray-500">
                            Department:
                          </span>{" "}
                          <span className="break-words">
                            {doctor.department || "-"}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <span className="text-gray-500">
                            Room:
                          </span>{" "}
                          {doctor.roomNumber || "-"}
                        </div>

                        <div className="min-w-0 sm:col-span-2">
                          <span className="text-gray-500">
                            Timing:
                          </span>{" "}
                          {doctor.availableTime?.from ||
                            "-"}
                          {" - "}
                          {doctor.availableTime?.to ||
                            "-"}
                        </div>

                      </div>

                    </div>
                  );
                })}

              </div>
            )}

          </section>

        </div>
      </div>
    </main>
  );
}