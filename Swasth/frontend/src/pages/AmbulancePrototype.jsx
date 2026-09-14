import React, { useEffect, useMemo, useState } from "react";

/*
===========================================================
 SWASTH QR - AMBULANCE MODULE PROTOTYPE
===========================================================

 SINGLE FILE DEMO

 No backend
 No API
 No database
 No external package required

 Demo Flow:

 Patient
   ↓
 Select Ambulance
   ↓
 Book Ambulance
   ↓
 Driver receives request
   ↓
 Driver accepts
   ↓
 Driver starts trip
   ↓
 Live tracking
   ↓
 Patient receives ambulance
   ↓
 Trip completed

 Views:
 1. Patient
 2. Driver
 3. Admin
===========================================================
*/

const INITIAL_AMBULANCES = [
  {
    id: "AMB-101",
    vehicleNo: "UP32 AB 1021",
    type: "BLS",
    hospital: "District Hospital Ayodhya",
    driver: "Rahul Verma",
    phone: "9876543210",
    experience: "6 years",
    rating: 4.8,
    status: "AVAILABLE",
    duty: true,
    distance: 2.4,
    eta: 8,
    price: 450,
    equipment: [
      "Oxygen Support",
      "First Aid Kit",
      "BP Monitor",
      "Wheelchair",
    ],
    location: {
      x: 28,
      y: 70,
    },
  },
  {
    id: "AMB-102",
    vehicleNo: "UP32 CD 4567",
    type: "ALS",
    hospital: "District Hospital Ayodhya",
    driver: "Amit Singh",
    phone: "9911223344",
    experience: "8 years",
    rating: 4.9,
    status: "AVAILABLE",
    duty: true,
    distance: 4.1,
    eta: 12,
    price: 750,
    equipment: [
      "Advanced Oxygen",
      "ECG Monitor",
      "Defibrillator",
      "Suction Unit",
      "Stretcher",
    ],
    location: {
      x: 45,
      y: 58,
    },
  },
  {
    id: "AMB-103",
    vehicleNo: "UP32 EF 8910",
    type: "ICU",
    hospital: "District Hospital Ayodhya",
    driver: "Vikas Yadav",
    phone: "9988776655",
    experience: "10 years",
    rating: 5.0,
    status: "AVAILABLE",
    duty: true,
    distance: 6.8,
    eta: 18,
    price: 1200,
    equipment: [
      "Ventilator",
      "ICU Monitor",
      "Defibrillator",
      "Oxygen",
      "Suction Unit",
      "Emergency Kit",
    ],
    location: {
      x: 68,
      y: 32,
    },
  },
  {
    id: "AMB-104",
    vehicleNo: "UP32 GH 3344",
    type: "PATIENT",
    hospital: "Government Medical Centre Lucknow",
    driver: "Suresh Kumar",
    phone: "9123456789",
    experience: "5 years",
    rating: 4.7,
    status: "AVAILABLE",
    duty: true,
    distance: 9.2,
    eta: 24,
    price: 350,
    equipment: [
      "Wheelchair",
      "Stretcher",
      "Basic First Aid",
    ],
    location: {
      x: 75,
      y: 76,
    },
  },
];

const DEMO_PATIENT = {
  name: "Akash Kumar",
  phone: "9559155555",
  age: 24,
  gender: "Male",
  address: "Civil Lines, Ayodhya",
};

const HOSPITALS = [
  {
    id: "H001",
    name: "District Hospital Ayodhya",
    city: "Ayodhya",
    emergency: true,
    phone: "05278-222100",
  },
  {
    id: "H002",
    name: "Government Medical Centre Lucknow",
    city: "Lucknow",
    emergency: true,
    phone: "0522-2501200",
  },
];

const formatCurrency = (value) => {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
};

const getTypeIcon = (type) => {
  switch (type) {
    case "BLS":
      return "🚑";
    case "ALS":
      return "🚑";
    case "ICU":
      return "🏥";
    case "PATIENT":
      return "🚐";
    default:
      return "🚑";
  }
};

const getTypeDescription = (type) => {
  switch (type) {
    case "BLS":
      return "Basic Life Support";
    case "ALS":
      return "Advanced Life Support";
    case "ICU":
      return "Mobile ICU";
    case "PATIENT":
      return "Patient Transport";
    default:
      return "Ambulance";
  }
};

function StatusBadge({ status }) {
  const styles = {
    AVAILABLE:
      "bg-emerald-50 text-emerald-700 border-emerald-200",
    BOOKED:
      "bg-amber-50 text-amber-700 border-amber-200",
    ACCEPTED:
      "bg-blue-50 text-blue-700 border-blue-200",
    ON_THE_WAY:
      "bg-indigo-50 text-indigo-700 border-indigo-200",
    ARRIVED:
      "bg-purple-50 text-purple-700 border-purple-200",
    COMPLETED:
      "bg-gray-100 text-gray-700 border-gray-200",
  };

  const labels = {
    AVAILABLE: "Available",
    BOOKED: "Booking Received",
    ACCEPTED: "Accepted",
    ON_THE_WAY: "On The Way",
    ARRIVED: "Arrived",
    COMPLETED: "Completed",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
        styles[status] || styles.COMPLETED
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "AVAILABLE"
            ? "bg-emerald-500"
            : status === "ARRIVED"
            ? "bg-purple-500"
            : status === "ON_THE_WAY"
            ? "bg-indigo-500"
            : status === "ACCEPTED"
            ? "bg-blue-500"
            : status === "BOOKED"
            ? "bg-amber-500"
            : "bg-gray-500"
        }`}
      />
      {labels[status] || status}
    </span>
  );
}

function StatCard({ icon, label, value, subtext }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          {subtext && (
            <p className="mt-1 text-xs text-gray-500">{subtext}</p>
          )}
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-xl">
          {icon}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ eyebrow, title, description }) {
  return (
    <div className="mb-5">
      {eyebrow && (
        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-blue-600">
          {eyebrow}
        </p>
      )}

      <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
        {title}
      </h2>

      {description && (
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          {description}
        </p>
      )}
    </div>
  );
}

function TrackingMap({
  ambulance,
  tracking,
  booking,
}) {
  if (!ambulance) {
    return (
      <div className="flex h-full min-h-[360px] items-center justify-center rounded-2xl border border-gray-200 bg-gray-50">
        <div className="text-center">
          <div className="text-4xl">🗺️</div>
          <p className="mt-2 text-sm text-gray-500">
            No ambulance selected
          </p>
        </div>
      </div>
    );
  }

  const ambulanceX = tracking?.ambulanceX ?? ambulance.location.x;
  const ambulanceY = tracking?.ambulanceY ?? ambulance.location.y;

  return (
    <div className="relative h-full min-h-[360px] overflow-hidden rounded-2xl border border-gray-200 bg-[#eef3f7]">
      {/* Map grid */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(#d9e2ea 1px, transparent 1px), linear-gradient(90deg, #d9e2ea 1px, transparent 1px)",
          backgroundSize: "35px 35px",
        }}
      />

      {/* City blocks */}
      <div className="absolute left-[8%] top-[10%] h-[18%] w-[20%] rounded-xl bg-white/80 shadow-sm" />
      <div className="absolute left-[35%] top-[8%] h-[14%] w-[22%] rounded-xl bg-white/70 shadow-sm" />
      <div className="absolute right-[7%] top-[13%] h-[22%] w-[23%] rounded-xl bg-white/80 shadow-sm" />
      <div className="absolute left-[5%] bottom-[15%] h-[23%] w-[25%] rounded-xl bg-white/70 shadow-sm" />
      <div className="absolute left-[38%] bottom-[10%] h-[18%] w-[25%] rounded-xl bg-white/80 shadow-sm" />
      <div className="absolute right-[8%] bottom-[14%] h-[20%] w-[22%] rounded-xl bg-white/70 shadow-sm" />

      {/* Roads */}
      <div className="absolute left-0 top-[52%] h-4 w-full bg-white/90 shadow-sm" />
      <div className="absolute left-[48%] top-0 h-full w-4 bg-white/90 shadow-sm" />
      <div className="absolute left-[22%] top-0 h-full w-3 rotate-[18deg] bg-white/70" />
      <div className="absolute left-0 top-[28%] h-3 w-full rotate-[-8deg] bg-white/70" />

      {/* Route */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <polyline
          points={`${ambulanceX},${ambulanceY} 48,56 30,70 72,78`}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.9"
          strokeDasharray="2 1.5"
          className="text-blue-600"
        />
      </svg>

      {/* Hospital */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{
          left: "72%",
          top: "78%",
        }}
      >
        <div className="flex flex-col items-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-red-500 text-lg shadow-lg">
            🏥
          </div>
          <div className="mt-1 whitespace-nowrap rounded-lg bg-white px-2 py-1 text-[10px] font-semibold shadow-md">
            Hospital
          </div>
        </div>
      </div>

      {/* Patient */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{
          left: "30%",
          top: "70%",
        }}
      >
        <div className="flex flex-col items-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border-4 border-white bg-green-500 text-base shadow-lg">
            👤
          </div>
          <div className="mt-1 whitespace-nowrap rounded-lg bg-white px-2 py-1 text-[10px] font-semibold shadow-md">
            Patient
          </div>
        </div>
      </div>

      {/* Ambulance */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-700"
        style={{
          left: `${ambulanceX}%`,
          top: `${ambulanceY}%`,
        }}
      >
        <div className="relative">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-blue-600 text-xl shadow-xl">
            🚑
          </div>

          {booking?.status === "ON_THE_WAY" && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex h-4 w-4 rounded-full bg-blue-500" />
            </span>
          )}
        </div>

        <div className="mt-1 whitespace-nowrap rounded-lg bg-gray-900 px-2 py-1 text-[10px] font-bold text-white shadow-md">
          {ambulance.id}
        </div>
      </div>

      {/* Map controls */}
      <div className="absolute right-3 top-3 flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <button className="flex h-9 w-9 items-center justify-center text-lg hover:bg-gray-50">
          +
        </button>
        <div className="h-px bg-gray-200" />
        <button className="flex h-9 w-9 items-center justify-center text-lg hover:bg-gray-50">
          −
        </button>
      </div>

      {/* Live label */}
      <div className="absolute left-3 top-3 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
          <span className="text-xs font-bold text-gray-800">
            Live Tracking
          </span>
        </div>
        <p className="mt-0.5 text-[10px] text-gray-500">
          GPS simulation active
        </p>
      </div>

      {/* ETA */}
      <div className="absolute bottom-3 left-3 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-md">
        <p className="text-[10px] font-medium text-gray-500">
          Estimated arrival
        </p>
        <p className="text-lg font-bold text-gray-900">
          {tracking?.eta ?? ambulance.eta} min
        </p>
      </div>
    </div>
  );
}

function AmbulanceCard({
  ambulance,
  onBook,
  disabled,
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="border-b border-gray-100 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-2xl">
              {getTypeIcon(ambulance.type)}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-gray-900">
                  {ambulance.id}
                </h3>
                <StatusBadge status={ambulance.status} />
              </div>

              <p className="mt-0.5 text-xs text-gray-500">
                {ambulance.vehicleNo}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(ambulance.price)}
            </p>
            <p className="text-[10px] text-gray-400">
              estimated fare
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
              Type
            </p>
            <p className="mt-1 text-sm font-bold text-gray-800">
              {ambulance.type}
            </p>
            <p className="text-[10px] text-gray-500">
              {getTypeDescription(ambulance.type)}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
              Distance
            </p>
            <p className="mt-1 text-sm font-bold text-gray-800">
              {ambulance.distance} km
            </p>
            <p className="text-[10px] text-gray-500">
              ~{ambulance.eta} min away
            </p>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-bold text-gray-700">
            Driver
          </p>

          <div className="flex items-center justify-between rounded-xl border border-gray-100 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-sm">
                👨‍✈️
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {ambulance.driver}
                </p>
                <p className="text-[10px] text-gray-500">
                  {ambulance.experience} experience
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm font-bold text-gray-800">
                ⭐ {ambulance.rating}
              </p>
              <p className="text-[10px] text-gray-400">
                rating
              </p>
            </div>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-bold text-gray-700">
            Equipment
          </p>

          <div className="flex flex-wrap gap-1.5">
            {ambulance.equipment.map((item) => (
              <span
                key={item}
                className="rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-[10px] text-gray-600"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onBook(ambulance)}
          disabled={disabled || ambulance.status !== "AVAILABLE"}
          className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {ambulance.status === "AVAILABLE"
            ? "Book Ambulance"
            : "Currently Unavailable"}
        </button>
      </div>
    </div>
  );
}

function DriverProfile({ ambulance }) {
  if (!ambulance) return null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl">
          👨‍✈️
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-900">
            {ambulance.driver}
          </h3>
          <p className="text-sm text-gray-500">
            Professional Ambulance Driver
          </p>

          <div className="mt-1 flex flex-wrap gap-3 text-xs">
            <span>⭐ {ambulance.rating}</span>
            <span>•</span>
            <span>{ambulance.experience}</span>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-[10px] text-gray-400">Phone</p>
          <p className="mt-1 text-xs font-bold text-gray-800">
            {ambulance.phone}
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-[10px] text-gray-400">Vehicle</p>
          <p className="mt-1 text-xs font-bold text-gray-800">
            {ambulance.vehicleNo}
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-[10px] text-gray-400">Ambulance</p>
          <p className="mt-1 text-xs font-bold text-gray-800">
            {ambulance.type}
          </p>
        </div>
      </div>
    </div>
  );
}

function BookingModal({
  ambulance,
  onClose,
  onConfirm,
}) {
  const [reason, setReason] = useState("Medical Emergency");
  const [notes, setNotes] = useState("");

  if (!ambulance) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Book Ambulance
            </h2>
            <p className="text-xs text-gray-500">
              Confirm ambulance request
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
          >
            ✕
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl shadow-sm">
                {getTypeIcon(ambulance.type)}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-gray-900">
                    {ambulance.id}
                  </h3>
                  <StatusBadge status={ambulance.status} />
                </div>

                <p className="text-xs text-gray-500">
                  {ambulance.vehicleNo} • {ambulance.type}
                </p>
              </div>

              <div className="text-right">
                <p className="font-bold text-gray-900">
                  {formatCurrency(ambulance.price)}
                </p>
                <p className="text-[10px] text-gray-500">
                  ~{ambulance.eta} min
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold text-gray-700">
              Emergency / Reason
            </label>

            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option>Medical Emergency</option>
              <option>Accident</option>
              <option>Patient Transfer</option>
              <option>Pregnancy / Maternity</option>
              <option>Routine Transport</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold text-gray-700">
              Additional Notes
            </label>

            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe patient's condition or special requirement..."
              className="w-full resize-none rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="rounded-2xl border border-gray-200 p-4">
            <p className="mb-3 text-xs font-bold text-gray-700">
              Patient Details
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-gray-400">Name</p>
                <p className="text-sm font-semibold text-gray-800">
                  {DEMO_PATIENT.name}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-gray-400">Age</p>
                <p className="text-sm font-semibold text-gray-800">
                  {DEMO_PATIENT.age} years
                </p>
              </div>

              <div>
                <p className="text-[10px] text-gray-400">Gender</p>
                <p className="text-sm font-semibold text-gray-800">
                  {DEMO_PATIENT.gender}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-gray-400">Phone</p>
                <p className="text-sm font-semibold text-gray-800">
                  {DEMO_PATIENT.phone}
                </p>
              </div>
            </div>

            <div className="mt-3">
              <p className="text-[10px] text-gray-400">
                Pickup Location
              </p>
              <p className="text-sm font-semibold text-gray-800">
                {DEMO_PATIENT.address}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() =>
                onConfirm({
                  reason,
                  notes,
                })
              }
              className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700"
            >
              Confirm Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BookingTracker({
  booking,
  ambulance,
  tracking,
  onCancel,
}) {
  if (!booking || !ambulance) return null;

  const steps = [
    {
      key: "BOOKED",
      label: "Booking Placed",
      icon: "📝",
    },
    {
      key: "ACCEPTED",
      label: "Driver Accepted",
      icon: "✓",
    },
    {
      key: "ON_THE_WAY",
      label: "On The Way",
      icon: "🚑",
    },
    {
      key: "ARRIVED",
      label: "Arrived",
      icon: "📍",
    },
    {
      key: "COMPLETED",
      label: "Completed",
      icon: "✓",
    },
  ];

  const order = [
    "BOOKED",
    "ACCEPTED",
    "ON_THE_WAY",
    "ARRIVED",
    "COMPLETED",
  ];

  const currentIndex = order.indexOf(booking.status);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Ambulance Booking
            </p>

            <h2 className="mt-1 text-xl font-bold text-gray-900">
              {booking.bookingId}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {ambulance.id} • {ambulance.vehicleNo}
            </p>
          </div>

          <StatusBadge status={booking.status} />
        </div>

        <div className="mt-6 overflow-x-auto">
          <div className="flex min-w-[650px] items-start">
            {steps.map((step, index) => {
              const completed = index <= currentIndex;
              const isCurrent = index === currentIndex;

              return (
                <React.Fragment key={step.key}>
                  <div className="flex w-[130px] flex-col items-center text-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold ${
                        completed
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-gray-200 bg-white text-gray-400"
                      } ${isCurrent ? "ring-4 ring-blue-100" : ""}`}
                    >
                      {step.icon}
                    </div>

                    <p
                      className={`mt-2 text-xs font-semibold ${
                        completed
                          ? "text-gray-900"
                          : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>

                  {index < steps.length - 1 && (
                    <div
                      className={`mt-5 h-0.5 flex-1 ${
                        index < currentIndex
                          ? "bg-blue-600"
                          : "bg-gray-200"
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="min-h-[360px]">
          <TrackingMap
            ambulance={ambulance}
            tracking={tracking}
            booking={booking}
          />
        </div>

        <div className="space-y-5">
          <DriverProfile ambulance={ambulance} />

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="font-bold text-gray-900">
              Live Trip Details
            </h3>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-[10px] text-gray-400">
                  Distance
                </p>
                <p className="mt-1 text-lg font-bold text-gray-900">
                  {tracking.distance.toFixed(1)} km
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-[10px] text-gray-400">
                  ETA
                </p>
                <p className="mt-1 text-lg font-bold text-gray-900">
                  {Math.max(0, Math.ceil(tracking.eta))} min
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-[10px] text-gray-400">
                  Speed
                </p>
                <p className="mt-1 text-lg font-bold text-gray-900">
                  {tracking.speed} km/h
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-[10px] text-gray-400">
                  Fare
                </p>
                <p className="mt-1 text-lg font-bold text-gray-900">
                  {formatCurrency(ambulance.price)}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Driver</span>
                <span className="font-semibold text-gray-800">
                  {ambulance.driver}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500">Phone</span>
                <span className="font-semibold text-gray-800">
                  {ambulance.phone}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500">Hospital</span>
                <span className="max-w-[180px] text-right font-semibold text-gray-800">
                  {ambulance.hospital}
                </span>
              </div>
            </div>

            {booking.status !== "COMPLETED" && (
              <button
                type="button"
                onClick={onCancel}
                className="mt-5 w-full rounded-xl border border-red-200 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50"
              >
                Cancel Booking
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex gap-3">
          <div className="text-xl">💡</div>
          <div>
            <p className="text-sm font-bold text-amber-900">
              Prototype Demo
            </p>
            <p className="mt-1 text-xs leading-5 text-amber-800">
              The ambulance location and ETA are simulated for this
              college prototype. In the final system, GPS location
              can be received from the driver's mobile device.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DriverDashboard({
  ambulance,
  booking,
  onAccept,
  onStartTrip,
  onArrive,
  onComplete,
  onDutyChange,
  duty,
}) {
  const [activeTab, setActiveTab] = useState("overview");

  if (!ambulance) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
        <div className="text-4xl">🚑</div>
        <h2 className="mt-3 text-lg font-bold text-gray-900">
          No ambulance assigned
        </h2>
      </div>
    );
  }

  const tabs = [
    {
      id: "overview",
      label: "Overview",
    },
    {
      id: "request",
      label: "Current Request",
    },
    {
      id: "vehicle",
      label: "Vehicle",
    },
  ];

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-3xl">
              👨‍✈️
            </div>

            <div>
              <p className="text-xs text-gray-400">
                Driver Dashboard
              </p>

              <h1 className="text-xl font-bold text-gray-900">
                {ambulance.driver}
              </h1>

              <p className="text-sm text-gray-500">
                {ambulance.id} • {ambulance.vehicleNo}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 px-4 py-3 sm:min-w-[180px]">
            <div>
              <p className="text-xs font-bold text-gray-800">
                Duty Status
              </p>
              <p className="text-[10px] text-gray-500">
                {duty ? "Available for requests" : "Currently offline"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onDutyChange(!duty)}
              className={`relative h-7 w-12 rounded-full transition ${
                duty ? "bg-emerald-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                  duty ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex overflow-x-auto px-5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`border-b-2 px-4 py-3 text-sm font-semibold whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "overview" && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon="🚑"
              label="Ambulance"
              value={ambulance.type}
              subtext={ambulance.vehicleNo}
            />

            <StatCard
              icon="⭐"
              label="Rating"
              value={ambulance.rating}
              subtext="Driver rating"
            />

            <StatCard
              icon="📍"
              label="Location"
              value={`${ambulance.distance} km`}
              subtext="From patient"
            />

            <StatCard
              icon="⏱️"
              label="ETA"
              value={`${ambulance.eta} min`}
              subtext="Estimated arrival"
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <DriverProfile ambulance={ambulance} />

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="font-bold text-gray-900">
                Current Status
              </h3>

              <div className="mt-4 flex items-center justify-between rounded-xl bg-gray-50 p-4">
                <div>
                  <p className="text-xs text-gray-400">
                    Ambulance Status
                  </p>
                  <div className="mt-2">
                    <StatusBadge status={ambulance.status} />
                  </div>
                </div>

                <div className="text-4xl">
                  {getTypeIcon(ambulance.type)}
                </div>
              </div>

              {booking ? (
                <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <p className="text-xs font-bold text-blue-800">
                    Active Booking
                  </p>

                  <p className="mt-1 text-sm font-bold text-gray-900">
                    {booking.bookingId}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Patient: {booking.patient.name}
                  </p>
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-dashed border-gray-200 p-5 text-center">
                  <p className="text-sm font-semibold text-gray-700">
                    No active booking
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    New requests will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === "request" && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">
            Current Booking Request
          </h2>

          {!booking ? (
            <div className="mt-6 rounded-2xl border border-dashed border-gray-200 p-10 text-center">
              <div className="text-4xl">📭</div>
              <p className="mt-3 font-semibold text-gray-800">
                No booking request
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Waiting for a new patient request.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-5">
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
                      Booking ID
                    </p>

                    <h3 className="mt-1 text-xl font-bold text-gray-900">
                      {booking.bookingId}
                    </h3>
                  </div>

                  <StatusBadge status={booking.status} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="text-xs font-bold text-gray-700">
                    Patient
                  </p>

                  <p className="mt-2 text-sm font-bold text-gray-900">
                    {booking.patient.name}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {booking.patient.age} years •{" "}
                    {booking.patient.gender}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    📞 {booking.patient.phone}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="text-xs font-bold text-gray-700">
                    Pickup
                  </p>

                  <p className="mt-2 text-sm font-bold text-gray-900">
                    {booking.patient.address}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Reason: {booking.reason}
                  </p>
                </div>
              </div>

              {booking.notes && (
                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="text-xs font-bold text-gray-700">
                    Patient Notes
                  </p>

                  <p className="mt-2 text-sm text-gray-600">
                    {booking.notes}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                {booking.status === "BOOKED" && (
                  <button
                    type="button"
                    onClick={onAccept}
                    className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
                  >
                    Accept Request
                  </button>
                )}

                {booking.status === "ACCEPTED" && (
                  <button
                    type="button"
                    onClick={onStartTrip}
                    className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700"
                  >
                    Start Trip
                  </button>
                )}

                {booking.status === "ON_THE_WAY" && (
                  <button
                    type="button"
                    onClick={onArrive}
                    className="rounded-xl bg-purple-600 px-5 py-3 text-sm font-bold text-white hover:bg-purple-700"
                  >
                    Mark Arrived
                  </button>
                )}

                {booking.status === "ARRIVED" && (
                  <button
                    type="button"
                    onClick={onComplete}
                    className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700"
                  >
                    Complete Trip
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "vehicle" && (
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
                {getTypeIcon(ambulance.type)}
              </div>

              <div>
                <p className="text-xs text-gray-400">
                  Vehicle
                </p>

                <h2 className="text-xl font-bold text-gray-900">
                  {ambulance.vehicleNo}
                </h2>

                <p className="text-sm text-gray-500">
                  {ambulance.type} Ambulance
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {ambulance.equipment.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-xl bg-gray-50 p-3"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-sm">
                    ✓
                  </span>

                  <span className="text-sm font-medium text-gray-700">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="font-bold text-gray-900">
              Vehicle Information
            </h3>

            <div className="mt-5 space-y-4">
              <div className="flex justify-between border-b border-gray-100 pb-3">
                <span className="text-sm text-gray-500">
                  Ambulance ID
                </span>
                <span className="text-sm font-semibold text-gray-800">
                  {ambulance.id}
                </span>
              </div>

              <div className="flex justify-between border-b border-gray-100 pb-3">
                <span className="text-sm text-gray-500">
                  Vehicle Number
                </span>
                <span className="text-sm font-semibold text-gray-800">
                  {ambulance.vehicleNo}
                </span>
              </div>

              <div className="flex justify-between border-b border-gray-100 pb-3">
                <span className="text-sm text-gray-500">
                  Type
                </span>
                <span className="text-sm font-semibold text-gray-800">
                  {getTypeDescription(ambulance.type)}
                </span>
              </div>

              <div className="flex justify-between border-b border-gray-100 pb-3">
                <span className="text-sm text-gray-500">
                  Hospital
                </span>
                <span className="max-w-[220px] text-right text-sm font-semibold text-gray-800">
                  {ambulance.hospital}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-500">
                  Driver
                </span>
                <span className="text-sm font-semibold text-gray-800">
                  {ambulance.driver}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminDashboard({
  ambulances,
  booking,
  selectedAmbulance,
  onReset,
}) {
  const available = ambulances.filter(
    (item) =>
      item.status === "AVAILABLE" && item.duty
  ).length;

  const booked = ambulances.filter(
    (item) =>
      item.status !== "AVAILABLE" &&
      item.status !== "COMPLETED"
  ).length;

  const offline = ambulances.filter(
    (item) => !item.duty
  ).length;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon="🚑"
          label="Total Ambulances"
          value={ambulances.length}
          subtext="Registered fleet"
        />

        <StatCard
          icon="🟢"
          label="Available"
          value={available}
          subtext="Ready for booking"
        />

        <StatCard
          icon="🚨"
          label="Active Trips"
          value={booked}
          subtext="Currently assigned"
        />

        <StatCard
          icon="⚪"
          label="Offline"
          value={offline}
          subtext="Not on duty"
        />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Ambulance Fleet
            </h2>
            <p className="text-xs text-gray-500">
              Monitor all demo ambulances
            </p>
          </div>

          <button
            type="button"
            onClick={onReset}
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50"
          >
            Reset Demo
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[800px] w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-xs font-bold text-gray-500">
                  Ambulance
                </th>
                <th className="px-5 py-3 text-xs font-bold text-gray-500">
                  Driver
                </th>
                <th className="px-5 py-3 text-xs font-bold text-gray-500">
                  Hospital
                </th>
                <th className="px-5 py-3 text-xs font-bold text-gray-500">
                  Type
                </th>
                <th className="px-5 py-3 text-xs font-bold text-gray-500">
                  Duty
                </th>
                <th className="px-5 py-3 text-xs font-bold text-gray-500">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {ambulances.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">
                        {getTypeIcon(item.type)}
                      </span>

                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {item.id}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.vehicleNo}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-gray-800">
                      {item.driver}
                    </p>
                    <p className="text-xs text-gray-400">
                      ⭐ {item.rating}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-600">
                    {item.hospital}
                  </td>

                  <td className="px-5 py-4">
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                      {item.type}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`text-xs font-bold ${
                        item.duty
                          ? "text-emerald-600"
                          : "text-gray-400"
                      }`}
                    >
                      {item.duty ? "ON DUTY" : "OFF DUTY"}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge status={item.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {booking && selectedAmbulance && (
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
                Active Demo Trip
              </p>

              <h3 className="mt-1 text-lg font-bold text-gray-900">
                {booking.bookingId}
              </h3>

              <p className="mt-1 text-sm text-gray-600">
                {selectedAmbulance.id} •{" "}
                {selectedAmbulance.driver} •{" "}
                {booking.patient.name}
              </p>
            </div>

            <StatusBadge status={booking.status} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function AmbulancePrototype() {
  const [activeView, setActiveView] = useState("patient");

  const [ambulances, setAmbulances] = useState(
    INITIAL_AMBULANCES
  );

  const [selectedAmbulance, setSelectedAmbulance] =
    useState(null);

  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedHospital, setSelectedHospital] =
    useState("ALL");

  const [bookingModal, setBookingModal] = useState(false);

  const [booking, setBooking] = useState(null);

  const [dutyMap, setDutyMap] = useState(() => {
    const map = {};

    INITIAL_AMBULANCES.forEach((item) => {
      map[item.id] = item.duty;
    });

    return map;
  });

  const [tracking, setTracking] = useState({
    ambulanceX: 48,
    ambulanceY: 56,
    distance: 2.4,
    eta: 8,
    speed: 32,
  });

  const filteredAmbulances = useMemo(() => {
    return ambulances.filter((ambulance) => {
      const typeMatch =
        selectedType === "ALL" ||
        ambulance.type === selectedType;

      const hospitalMatch =
        selectedHospital === "ALL" ||
        ambulance.hospital === selectedHospital;

      const dutyMatch = dutyMap[ambulance.id];

      return (
        typeMatch &&
        hospitalMatch &&
        dutyMatch &&
        ambulance.status === "AVAILABLE"
      );
    });
  }, [
    ambulances,
    selectedType,
    selectedHospital,
    dutyMap,
  ]);

  const handleOpenBooking = (ambulance) => {
    setSelectedAmbulance(ambulance);
    setBookingModal(true);
  };

  const handleConfirmBooking = ({
    reason,
    notes,
  }) => {
    if (!selectedAmbulance) return;

    const bookingId = `SWQ-${Math.floor(
      100000 + Math.random() * 900000
    )}`;

    const newBooking = {
      bookingId,
      status: "BOOKED",
      createdAt: new Date().toISOString(),
      reason,
      notes,
      patient: DEMO_PATIENT,
      ambulanceId: selectedAmbulance.id,
    };

    setBooking(newBooking);

    setAmbulances((prev) =>
      prev.map((item) =>
        item.id === selectedAmbulance.id
          ? {
              ...item,
              status: "BOOKED",
            }
          : item
      )
    );

    setBookingModal(false);

    setTracking({
      ambulanceX: selectedAmbulance.location.x,
      ambulanceY: selectedAmbulance.location.y,
      distance: selectedAmbulance.distance,
      eta: selectedAmbulance.eta,
      speed: 32,
    });

    setActiveView("patient");
  };

  const handleDriverAccept = () => {
    if (!booking || !selectedAmbulance) return;

    setBooking((prev) => ({
      ...prev,
      status: "ACCEPTED",
    }));

    setAmbulances((prev) =>
      prev.map((item) =>
        item.id === selectedAmbulance.id
          ? {
              ...item,
              status: "ACCEPTED",
            }
          : item
      )
    );
  };

  const handleStartTrip = () => {
    if (!booking || !selectedAmbulance) return;

    setBooking((prev) => ({
      ...prev,
      status: "ON_THE_WAY",
    }));

    setAmbulances((prev) =>
      prev.map((item) =>
        item.id === selectedAmbulance.id
          ? {
              ...item,
              status: "ON_THE_WAY",
            }
          : item
      )
    );

    setTracking({
      ambulanceX: selectedAmbulance.location.x,
      ambulanceY: selectedAmbulance.location.y,
      distance: selectedAmbulance.distance,
      eta: selectedAmbulance.eta,
      speed: 32,
    });
  };

  const handleArrive = () => {
    if (!booking || !selectedAmbulance) return;

    setBooking((prev) => ({
      ...prev,
      status: "ARRIVED",
    }));

    setAmbulances((prev) =>
      prev.map((item) =>
        item.id === selectedAmbulance.id
          ? {
              ...item,
              status: "ARRIVED",
            }
          : item
      )
    );

    setTracking((prev) => ({
      ...prev,
      ambulanceX: 30,
      ambulanceY: 70,
      distance: 0,
      eta: 0,
    }));
  };

  const handleComplete = () => {
    if (!booking || !selectedAmbulance) return;

    setBooking((prev) => ({
      ...prev,
      status: "COMPLETED",
    }));

    setAmbulances((prev) =>
      prev.map((item) =>
        item.id === selectedAmbulance.id
          ? {
              ...item,
              status: "AVAILABLE",
            }
          : item
      )
    );
  };

  const handleCancel = () => {
    if (!booking || !selectedAmbulance) {
      setBooking(null);
      setSelectedAmbulance(null);
      return;
    }

    setAmbulances((prev) =>
      prev.map((item) =>
        item.id === selectedAmbulance.id
          ? {
              ...item,
              status: "AVAILABLE",
            }
          : item
      )
    );

    setBooking(null);
    setSelectedAmbulance(null);

    setTracking({
      ambulanceX: 48,
      ambulanceY: 56,
      distance: 2.4,
      eta: 8,
      speed: 32,
    });
  };

  const handleDutyChange = (ambulanceId, value) => {
    setDutyMap((prev) => ({
      ...prev,
      [ambulanceId]: value,
    }));

    setAmbulances((prev) =>
      prev.map((item) =>
        item.id === ambulanceId
          ? {
              ...item,
              duty: value,
              status:
                value && item.status === "COMPLETED"
                  ? "AVAILABLE"
                  : item.status,
            }
          : item
      )
    );
  };

  useEffect(() => {
    if (
      !booking ||
      booking.status !== "ON_THE_WAY" ||
      !selectedAmbulance
    ) {
      return undefined;
    }

    const interval = setInterval(() => {
      setTracking((prev) => {
        const nextDistance = Math.max(
          0,
          prev.distance - 0.18
        );

        const nextEta = Math.max(
          0,
          prev.eta - 0.6
        );

        const currentX = prev.ambulanceX;
        const currentY = prev.ambulanceY;

        const targetX = 30;
        const targetY = 70;

        const nextX =
          currentX + (targetX - currentX) * 0.055;

        const nextY =
          currentY + (targetY - currentY) * 0.055;

        if (nextDistance <= 0.3) {
          setBooking((prevBooking) => {
            if (
              !prevBooking ||
              prevBooking.status !== "ON_THE_WAY"
            ) {
              return prevBooking;
            }

            return {
              ...prevBooking,
              status: "ARRIVED",
            };
          });

          setAmbulances((prevAmbulances) =>
            prevAmbulances.map((item) =>
              item.id === selectedAmbulance.id
                ? {
                    ...item,
                    status: "ARRIVED",
                  }
                : item
            )
          );

          return {
            ...prev,
            ambulanceX: targetX,
            ambulanceY: targetY,
            distance: 0,
            eta: 0,
          };
        }

        return {
          ...prev,
          ambulanceX: nextX,
          ambulanceY: nextY,
          distance: nextDistance,
          eta: nextEta,
        };
      });
    }, 1800);

    return () => clearInterval(interval);
  }, [booking, selectedAmbulance]);

  const resetDemo = () => {
    setAmbulances(INITIAL_AMBULANCES);

    const newDutyMap = {};

    INITIAL_AMBULANCES.forEach((item) => {
      newDutyMap[item.id] = item.duty;
    });

    setDutyMap(newDutyMap);

    setSelectedAmbulance(null);
    setBooking(null);
    setBookingModal(false);

    setTracking({
      ambulanceX: 48,
      ambulanceY: 56,
      distance: 2.4,
      eta: 8,
      speed: 32,
    });

    setSelectedType("ALL");
    setSelectedHospital("ALL");
    setActiveView("patient");
  };

  const currentDriverAmbulance =
    selectedAmbulance ||
    ambulances.find((item) => dutyMap[item.id]) ||
    ambulances[0];

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-gray-900">

      {/* MAIN */}
      <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        {/* PATIENT VIEW */}
        {activeView === "patient" && (
          <div className="space-y-6">
            {!booking ? (
              <>
                <section className="overflow-hidden rounded-3xl bg-gray-900 p-6 text-white shadow-sm sm:p-8">
                  <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                    <div>
                      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                        Ambulance Service Available
                      </div>

                      <h1 className="max-w-2xl text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                        Get the right ambulance,
                        <span className="text-blue-400">
                          {" "}when you need it.
                        </span>
                      </h1>

                      <p className="mt-4 max-w-xl text-sm leading-6 text-gray-300 sm:text-base">
                        Find nearby ambulances, compare emergency
                        support, book instantly and track the
                        vehicle in real time.
                      </p>

                      <div className="mt-6 flex flex-wrap gap-3">
                        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                          <p className="text-lg font-bold">
                            {ambulances.filter(
                              (a) =>
                                a.status === "AVAILABLE" &&
                                a.duty
                            ).length}
                          </p>
                          <p className="text-xs text-gray-400">
                            Available now
                          </p>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                          <p className="text-lg font-bold">
                            &lt; 10 min
                          </p>
                          <p className="text-xs text-gray-400">
                            Average response
                          </p>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                          <p className="text-lg font-bold">
                            24×7
                          </p>
                          <p className="text-xs text-gray-400">
                            Emergency support
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="hidden justify-center lg:flex">
                      <div className="relative flex h-64 w-64 items-center justify-center rounded-full border border-white/10 bg-white/5">
                        <div className="absolute h-48 w-48 rounded-full border border-white/10" />
                        <div className="absolute h-32 w-32 rounded-full border border-white/10" />

                        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-blue-600 text-5xl shadow-2xl">
                          🚑
                        </div>

                        <div className="absolute right-5 top-12 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs backdrop-blur">
                          <span className="font-bold">
                            Live GPS
                          </span>
                        </div>

                        <div className="absolute bottom-10 left-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs backdrop-blur">
                          <span className="font-bold">
                            Fast Response
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <SectionTitle
                    eyebrow="Find ambulance"
                    title="Choose an ambulance"
                    description="Select the ambulance according to your medical requirement."
                  />

                  <div className="mb-5 grid gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-bold text-gray-700">
                        Ambulance Type
                      </label>

                      <select
                        value={selectedType}
                        onChange={(e) =>
                          setSelectedType(e.target.value)
                        }
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="ALL">
                          All Types
                        </option>
                        <option value="BLS">
                          BLS - Basic Life Support
                        </option>
                        <option value="ALS">
                          ALS - Advanced Life Support
                        </option>
                        <option value="ICU">
                          ICU - Mobile ICU
                        </option>
                        <option value="PATIENT">
                          Patient Transport
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-bold text-gray-700">
                        Hospital
                      </label>

                      <select
                        value={selectedHospital}
                        onChange={(e) =>
                          setSelectedHospital(e.target.value)
                        }
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="ALL">
                          All Hospitals
                        </option>

                        {HOSPITALS.map((hospital) => (
                          <option
                            key={hospital.id}
                            value={hospital.name}
                          >
                            {hospital.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {filteredAmbulances.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
                      <div className="text-4xl">🚑</div>

                      <h3 className="mt-3 text-lg font-bold text-gray-900">
                        No ambulance available
                      </h3>

                      <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
                        Try selecting another ambulance type or
                        hospital.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-5 md:grid-cols-2">
                      {filteredAmbulances.map((ambulance) => (
                        <AmbulanceCard
                          key={ambulance.id}
                          ambulance={ambulance}
                          onBook={handleOpenBooking}
                        />
                      ))}
                    </div>
                  )}
                </section>

                <section>
                  <SectionTitle
                    eyebrow="How it works"
                    title="Simple ambulance booking flow"
                    description="Designed for a quick and easy emergency experience."
                  />

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      {
                        number: "01",
                        icon: "🔎",
                        title: "Find",
                        text: "Choose ambulance based on type, hospital and availability.",
                      },
                      {
                        number: "02",
                        icon: "📲",
                        title: "Book",
                        text: "Enter emergency details and confirm your request.",
                      },
                      {
                        number: "03",
                        icon: "🚑",
                        title: "Track",
                        text: "Driver accepts the request and starts the trip.",
                      },
                      {
                        number: "04",
                        icon: "📍",
                        title: "Arrive",
                        text: "Track ambulance location and estimated arrival.",
                      },
                    ].map((item) => (
                      <div
                        key={item.number}
                        className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">
                            {item.icon}
                          </span>

                          <span className="text-xs font-black text-gray-300">
                            {item.number}
                          </span>
                        </div>

                        <h3 className="mt-5 font-bold text-gray-900">
                          {item.title}
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-gray-500">
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            ) : (
              <>
                <SectionTitle
                  eyebrow="Your ambulance"
                  title="Track your booking"
                  description="You can monitor the complete ambulance journey from booking to arrival."
                />

                <BookingTracker
                  booking={booking}
                  ambulance={selectedAmbulance}
                  tracking={tracking}
                  onCancel={handleCancel}
                />
              </>
            )}
          </div>
        )}

        {/* DRIVER VIEW */}
        {activeView === "driver" && (
          <div>
            <SectionTitle
              eyebrow="Driver module"
              title="Ambulance Driver Dashboard"
              description="Manage ambulance duty, booking requests and trip status."
            />

            <DriverDashboard
              ambulance={currentDriverAmbulance}
              booking={booking}
              duty={
                currentDriverAmbulance
                  ? !!dutyMap[currentDriverAmbulance.id]
                  : false
              }
              onAccept={handleDriverAccept}
              onStartTrip={handleStartTrip}
              onArrive={handleArrive}
              onComplete={handleComplete}
              onDutyChange={(value) =>
                currentDriverAmbulance &&
                handleDutyChange(
                  currentDriverAmbulance.id,
                  value
                )
              }
            />
          </div>
        )}

        {/* ADMIN VIEW */}
        {activeView === "admin" && (
          <div>
            <SectionTitle
              eyebrow="Admin module"
              title="Ambulance Fleet Management"
              description="Monitor availability, active bookings and ambulance fleet."
            />

            <AdminDashboard
              ambulances={ambulances}
              booking={booking}
              selectedAmbulance={selectedAmbulance}
              onReset={resetDemo}
            />
          </div>
        )}

        {/* MOBILE / DESKTOP VIEW SWITCHER */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
          <span className="mr-2 text-xs font-bold text-gray-500">
            Demo View:
          </span>

          <button
            type="button"
            onClick={() => setActiveView("patient")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeView === "patient"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            👤 Patient
          </button>

          <button
            type="button"
            onClick={() => setActiveView("driver")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeView === "driver"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            👨‍✈️ Driver
          </button>

          <button
            type="button"
            onClick={() => setActiveView("admin")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeView === "admin"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            🛠️ Admin
          </button>
        </div>
      </main>

      {/* BOOKING MODAL */}
      {bookingModal && selectedAmbulance && (
        <BookingModal
          ambulance={selectedAmbulance}
          onClose={() => {
            setBookingModal(false);
            setSelectedAmbulance(null);
          }}
          onConfirm={handleConfirmBooking}
        />
      )}
    </div>
  );
}
