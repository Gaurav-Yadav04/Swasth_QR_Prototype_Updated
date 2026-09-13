import React, { useState } from "react";

const AppointmentPage = () => {
  const [appointments, setAppointments] = useState([
    {
      _id: "1",
      department: "Cardiology",
      doctor: "Dr. Sharma",
      disease: "Heart Pain",
      roomNo: "101",
      tokenNumber: 1,
      status: "pending",
      date: new Date(),
    },
    {
      _id: "2",
      department: "Orthopedic",
      doctor: "Dr. Verma",
      disease: "Knee Pain",
      roomNo: "202",
      tokenNumber: 2,
      status: "done",
      date: new Date(),
    },
  ]);

  const [form, setForm] = useState({
    department: "",
    doctor: "",
    disease: "",
    roomNo: "",
  });

  /* =====================
     Add Appointment
  ===================== */
  const addAppointment = () => {
    if (!form.department || !form.doctor) {
      alert("Department & Doctor required");
      return;
    }

    const newAppointment = {
      _id: Date.now().toString(),
      ...form,
      tokenNumber: appointments.length + 1,
      status: "pending",
      date: new Date(),
    };

    setAppointments([newAppointment, ...appointments]);

    setForm({
      department: "",
      doctor: "",
      disease: "",
      roomNo: "",
    });
  };

  /* =====================
     Mark Done
  ===================== */
  const markDone = (id) => {
    const updated = appointments.map((a) =>
      a._id === id ? { ...a, status: "done" } : a
    );
    setAppointments(updated);
  };

  /* =====================
     Delete Appointment
  ===================== */
  const deleteAppointment = (id) => {
    const filtered = appointments.filter((a) => a._id !== id);
    setAppointments(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">

        {/* ================= FORM ================= */}
        <div className="bg-white shadow-lg rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">
            Create Appointment
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              className="border p-2 rounded"
              placeholder="Department"
              value={form.department}
              onChange={(e) =>
                setForm({ ...form, department: e.target.value })
              }
            />

            <input
              className="border p-2 rounded"
              placeholder="Doctor Name"
              value={form.doctor}
              onChange={(e) =>
                setForm({ ...form, doctor: e.target.value })
              }
            />

            <input
              className="border p-2 rounded"
              placeholder="Disease"
              value={form.disease}
              onChange={(e) =>
                setForm({ ...form, disease: e.target.value })
              }
            />

            <input
              className="border p-2 rounded"
              placeholder="Room No"
              value={form.roomNo}
              onChange={(e) =>
                setForm({ ...form, roomNo: e.target.value })
              }
            />
          </div>

          <button
            onClick={addAppointment}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
          >
            Add Appointment
          </button>
        </div>

        {/* ================= LIST ================= */}
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-4">
            Appointment List
          </h2>

          <div className="space-y-4">
            {appointments.map((a) => (
              <div
                key={a._id}
                className="border rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-semibold text-lg">
                    {a.doctor}
                  </h3>
                  <p className="text-gray-600">
                    Department: {a.department}
                  </p>
                  <p className="text-gray-600">
                    Disease: {a.disease}
                  </p>
                  <p className="text-gray-600">
                    Room: {a.roomNo}
                  </p>
                  <p className="text-gray-600">
                    Token: {a.tokenNumber}
                  </p>

                  <p
                    className={`font-medium mt-1 ${
                      a.status === "done"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    Status: {a.status}
                  </p>
                </div>

                <div className="flex gap-3">
                  {a.status !== "done" && (
                    <button
                      onClick={() => markDone(a._id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                    >
                      Done
                    </button>
                  )}

                  <button
                    onClick={() => deleteAppointment(a._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default AppointmentPage;
