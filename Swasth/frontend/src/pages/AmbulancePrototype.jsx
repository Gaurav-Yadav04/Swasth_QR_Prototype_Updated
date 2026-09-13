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
 Driver goes ON THE WAY
   ↓
 Live GPS simulation
   ↓
 Ambulance arrives
   ↓
 Trip completed

===========================================================
*/

/* =========================================================
   AMBULANCE DATA
========================================================= */

const INITIAL_AMBULANCES = [
  {
    id: "AMB-101",
    number: "UP32 AB 1021",
    type: "BLS",
    typeFull: "Basic Life Support",
    hospital: "District Hospital Ayodhya",
    hospitalShort: "District Hospital",
    hospitalLocation: "Ayodhya, Uttar Pradesh",
    driver: "Rahul Verma",
    driverPhone: "9876543210",
    driverExperience: "6 years",
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
    number: "UP32 CD 4567",
    type: "ALS",
    typeFull: "Advanced Life Support",
    hospital: "District Hospital Ayodhya",
    hospitalShort: "District Hospital",
    hospitalLocation: "Ayodhya, Uttar Pradesh",
    driver: "Amit Singh",
    driverPhone: "9911223344",
    driverExperience: "8 years",
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
    number: "UP32 EF 8910",
    type: "ICU",
    typeFull: "ICU Ambulance",
    hospital: "District Hospital Ayodhya",
    hospitalShort: "District Hospital",
    hospitalLocation: "Ayodhya, Uttar Pradesh",
    driver: "Vikas Yadav",
    driverPhone: "9988776655",
    driverExperience: "10 years",
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
    number: "UP32 GH 3344",
    type: "PATIENT",
    typeFull: "Patient Transport",
    hospital: "Government Medical Centre Lucknow",
    hospitalShort: "Govt Medical Centre",
    hospitalLocation: "Lucknow, Uttar Pradesh",
    driver: "Suresh Kumar",
    driverPhone: "9123456789",
    driverExperience: "5 years",
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

/* =========================================================
   DEMO PATIENT
========================================================= */

const DEMO_PATIENT = {
  name: "Akash Kumar",
  phone: "9559155555",
  age: 24,
  gender: "Male",
  location: "Civil Lines, Ayodhya",
};

/* =========================================================
   HOSPITALS
========================================================= */

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

/* =========================================================
   HELPER FUNCTIONS
========================================================= */

const formatCurrency = (amount) => `₹${amount}`;

const getTypeIcon = (type) => {
  if (type === "ALS") return "⚕️";
  if (type === "ICU") return "🫀";
  if (type === "PATIENT") return "♿";
  return "🚑";
};

const getTypeDescription = (type) => {
  if (type === "ALS") {
    return "Advanced emergency care with cardiac monitoring";
  }

  if (type === "ICU") {
    return "Critical care transport with ICU equipment";
  }

  if (type === "PATIENT") {
    return "Comfortable non-emergency patient transport";
  }

  return "Basic emergency support and oxygen facility";
};

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }) {
  const map = {
    AVAILABLE: {
      text: "Available",
      className:
        "bg-emerald-50 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-500",
    },

    BOOKED: {
      text: "Booking Request",
      className:
        "bg-orange-50 text-orange-700 border-orange-200",
      dot: "bg-orange-500",
    },

    ACCEPTED: {
      text: "Accepted",
      className:
        "bg-blue-50 text-blue-700 border-blue-200",
      dot: "bg-blue-500",
    },

    ON_THE_WAY: {
      text: "On the way",
      className:
        "bg-amber-50 text-amber-700 border-amber-200",
      dot: "bg-amber-500",
    },

    ARRIVED: {
      text: "Arrived",
      className:
        "bg-purple-50 text-purple-700 border-purple-200",
      dot: "bg-purple-500",
    },

    COMPLETED: {
      text: "Completed",
      className:
        "bg-gray-100 text-gray-700 border-gray-200",
      dot: "bg-gray-500",
    },
  };

  const item = map[status] || map.AVAILABLE;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${item.className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${item.dot}`}
      />
      {item.text}
    </span>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({ icon, label, value, sub }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-xl">
          {icon}
        </div>
      </div>

      <div className="text-2xl font-bold text-gray-900">
        {value}
      </div>

      <div className="mt-1 text-sm font-medium text-gray-700">
        {label}
      </div>

      {sub && (
        <div className="mt-1 text-xs text-gray-500">
          {sub}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   SECTION TITLE
========================================================= */

function SectionTitle({
  eyebrow,
  title,
  description,
}) {
  return (
    <div className="mb-5">
      {eyebrow && (
        <div className="mb-1 text-xs font-bold uppercase tracking-wider text-blue-600">
          {eyebrow}
        </div>
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

/* =========================================================
   MAP COMPONENT
========================================================= */

function TrackingMap({
  ambulance,
  tracking,
  patientPosition,
  hospitalPosition,
}) {
  const ambulanceX =
    tracking && ambulance
      ? tracking.ambulanceX
      : ambulance?.location?.x || 40;

  const ambulanceY =
    tracking && ambulance
      ? tracking.ambulanceY
      : ambulance?.location?.y || 50;

  return (
    <div className="relative h-[430px] overflow-hidden rounded-3xl border border-gray-200 bg-[#eef3f7]">
      {/* MAP GRID */}

      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(#d8e0e7 1px, transparent 1px), linear-gradient(90deg, #d8e0e7 1px, transparent 1px)",
          backgroundSize: "42px 42px",
        }}
      />

      {/* CITY BLOCKS */}

      <div className="absolute left-[5%] top-[8%] h-20 w-32 rounded-xl bg-white/70" />

      <div className="absolute right-[7%] top-[12%] h-28 w-40 rounded-xl bg-white/70" />

      <div className="absolute bottom-[12%] left-[12%] h-24 w-44 rounded-xl bg-white/70" />

      <div className="absolute bottom-[10%] right-[12%] h-20 w-36 rounded-xl bg-white/70" />

      {/* ROADS */}

      <div className="absolute left-0 right-0 top-[48%] h-5 -rotate-3 bg-white shadow-sm" />

      <div className="absolute bottom-0 left-[42%] top-0 w-5 rotate-6 bg-white shadow-sm" />

      <div className="absolute left-[15%] right-[5%] top-[22%] h-4 rotate-12 bg-white shadow-sm" />

      <div className="absolute bottom-[18%] left-0 right-[20%] h-4 -rotate-12 bg-white shadow-sm" />

      {/* ROUTE */}

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <polyline
          points={`${patientPosition.x},${patientPosition.y} ${ambulanceX},${ambulanceY} ${hospitalPosition.x},${hospitalPosition.y}`}
          fill="none"
          stroke="#2563eb"
          strokeWidth="0.9"
          strokeDasharray="2 1.5"
          opacity="0.9"
        />

        <circle
          cx={patientPosition.x}
          cy={patientPosition.y}
          r="1.6"
          fill="#ef4444"
        />

        <circle
          cx={hospitalPosition.x}
          cy={hospitalPosition.y}
          r="1.6"
          fill="#16a34a"
        />
      </svg>

      {/* PATIENT */}

      <div
        className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${patientPosition.x}%`,
          top: `${patientPosition.y}%`,
        }}
      >
        <div className="relative">
          <div className="absolute -inset-2 animate-ping rounded-full bg-red-400/20" />

          <div className="relative flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-red-500 text-lg shadow-lg">
            📍
          </div>

          <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-2 py-1 text-[10px] font-semibold text-white">
            You
          </div>
        </div>
      </div>

      {/* HOSPITAL */}

      <div
        className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${hospitalPosition.x}%`,
          top: `${hospitalPosition.y}%`,
        }}
      >
        <div className="relative">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border-4 border-white bg-emerald-600 text-xl shadow-lg">
            🏥
          </div>

          <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-2 py-1 text-[10px] font-semibold text-white">
            Hospital
          </div>
        </div>
      </div>

      {/* AMBULANCE */}

      {ambulance && (
        <div
          className="absolute z-30 -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-linear"
          style={{
            left: `${ambulanceX}%`,
            top: `${ambulanceY}%`,
          }}
        >
          <div className="relative">
            <div className="absolute -inset-3 animate-pulse rounded-full bg-blue-500/20" />

            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border-4 border-white bg-blue-600 text-2xl shadow-xl">
              🚑
            </div>

            <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-blue-700 px-2 py-1 text-[10px] font-bold text-white shadow">
              {ambulance.number}
            </div>
          </div>
        </div>
      )}

      {/* TOP INFO */}

      <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-3">
        <div className="rounded-xl border border-gray-200 bg-white/95 px-3 py-2 shadow-sm backdrop-blur">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
            Live Tracking
          </div>

          <div className="mt-0.5 flex items-center gap-1.5 text-sm font-bold text-gray-900">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            GPS Active
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white/95 px-3 py-2 text-right shadow-sm backdrop-blur">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
            Demo Map
          </div>

          <div className="text-xs font-semibold text-gray-700">
            Ayodhya
          </div>
        </div>
      </div>

      {/* BOTTOM INFO */}

      <div className="absolute bottom-4 left-4 right-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white/95 p-3 shadow-lg backdrop-blur">
          <div className="flex items-center gap-4 text-xs font-medium text-gray-600">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              Patient
            </span>

            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
              Ambulance
            </span>

            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-green-600" />
              Hospital
            </span>
          </div>

          <div className="text-xs font-bold text-blue-600">
            Live location updates
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   AMBULANCE CARD
========================================================= */

function AmbulanceCard({
  ambulance,
  selected,
  onSelect,
  onBook,
}) {
  return (
    <div
      className={`group rounded-2xl border bg-white p-4 transition ${
        selected
          ? "border-blue-500 ring-2 ring-blue-100"
          : "border-gray-200 hover:border-blue-300 hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
            {getTypeIcon(ambulance.type)}
          </div>

          <div>
            <div className="text-sm font-bold text-gray-900">
              {ambulance.typeFull}
            </div>

            <div className="mt-0.5 text-xs font-medium text-gray-500">
              {ambulance.number}
            </div>
          </div>
        </div>

        <StatusBadge status={ambulance.status} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-gray-50 p-2.5">
          <div className="text-[10px] uppercase text-gray-400">
            ETA
          </div>

          <div className="mt-0.5 text-sm font-bold text-gray-900">
            {ambulance.eta} min
          </div>
        </div>

        <div className="rounded-xl bg-gray-50 p-2.5">
          <div className="text-[10px] uppercase text-gray-400">
            Distance
          </div>

          <div className="mt-0.5 text-sm font-bold text-gray-900">
            {ambulance.distance} km
          </div>
        </div>

        <div className="rounded-xl bg-gray-50 p-2.5">
          <div className="text-[10px] uppercase text-gray-400">
            Fare
          </div>

          <div className="mt-0.5 text-sm font-bold text-gray-900">
            {formatCurrency(ambulance.price)}
          </div>
        </div>
      </div>

      <div className="mt-4 border-t border-gray-100 pt-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-400">
              Driver
            </div>

            <div className="mt-0.5 flex items-center gap-1 text-sm font-semibold text-gray-800">
              👨‍✈️ {ambulance.driver}
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-gray-400">
              Rating
            </div>

            <div className="mt-0.5 text-sm font-bold text-gray-800">
              ⭐ {ambulance.rating}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-500">
        🏥 {ambulance.hospital}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {ambulance.equipment.slice(0, 3).map((item) => (
          <span
            key={item}
            className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-medium text-blue-700"
          >
            {item}
          </span>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => onSelect(ambulance)}
          className={`flex-1 rounded-xl border px-3 py-2.5 text-xs font-bold transition ${
            selected
              ? "border-blue-600 bg-blue-600 text-white"
              : "border-gray-200 bg-white text-gray-700 hover:border-blue-500 hover:text-blue-600"
          }`}
        >
          {selected ? "Selected" : "View Details"}
        </button>

        <button
          type="button"
          onClick={() => onBook(ambulance)}
          className="flex-1 rounded-xl bg-gray-900 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-blue-600"
        >
          Book Now
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   DRIVER PROFILE
========================================================= */

function DriverProfile({ ambulance }) {
  if (!ambulance) return null;

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-2xl text-white">
          👨‍✈️
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-lg font-bold text-gray-900">
            {ambulance.driver}
          </div>

          <div className="mt-1 text-sm text-gray-500">
            Verified Ambulance Driver
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
              ✓ Verified
            </span>

            <span className="rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-bold text-yellow-700">
              ⭐ {ambulance.rating}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-gray-50 p-3">
          <div className="text-xs text-gray-400">
            Experience
          </div>

          <div className="mt-1 text-sm font-bold text-gray-800">
            {ambulance.driverExperience}
          </div>
        </div>

        <div className="rounded-xl bg-gray-50 p-3">
          <div className="text-xs text-gray-400">
            Ambulance
          </div>

          <div className="mt-1 text-sm font-bold text-gray-800">
            {ambulance.number}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-3">
        <div className="text-xs font-semibold text-blue-600">
          Hospital
        </div>

        <div className="mt-1 text-sm font-bold text-gray-900">
          {ambulance.hospital}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   BOOKING MODAL
========================================================= */

function BookingModal({
  ambulance,
  onClose,
  onConfirm,
}) {
  const [problem, setProblem] = useState("");
  const [priority, setPriority] = useState("Normal");

  if (!ambulance) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="border-b border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold text-gray-900">
                Confirm Ambulance Booking
              </div>

              <div className="mt-1 text-xs text-gray-500">
                Review your booking details
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl shadow-sm">
                {getTypeIcon(ambulance.type)}
              </div>

              <div className="flex-1">
                <div className="text-sm font-bold text-gray-900">
                  {ambulance.typeFull}
                </div>

                <div className="mt-1 text-xs text-gray-500">
                  {ambulance.number} • {ambulance.driver}
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-gray-400">
                  Fare
                </div>

                <div className="text-lg font-bold text-gray-900">
                  ₹{ambulance.price}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-gray-700">
              Patient
            </label>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm">
              <div className="font-semibold text-gray-900">
                {DEMO_PATIENT.name}
              </div>

              <div className="mt-1 text-xs text-gray-500">
                {DEMO_PATIENT.age} years •{" "}
                {DEMO_PATIENT.gender} •{" "}
                {DEMO_PATIENT.phone}
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-gray-700">
              Emergency / Patient Problem
            </label>

            <textarea
              value={problem}
              onChange={(e) =>
                setProblem(e.target.value)
              }
              placeholder="Example: Severe chest pain, accident, patient transfer..."
              rows={3}
              className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-gray-700">
              Priority
            </label>

            <div className="grid grid-cols-3 gap-2">
              {["Normal", "Urgent", "Emergency"].map(
                (item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() =>
                      setPriority(item)
                    }
                    className={`rounded-xl border px-3 py-2.5 text-xs font-bold ${
                      priority === item
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-gray-200 text-gray-700 hover:border-blue-400"
                    }`}
                  >
                    {item}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
            <b>Demo note:</b> This prototype simulates
            ambulance dispatch and live GPS tracking. In
            the real system, driver GPS would come from the
            driver's mobile device.
          </div>

          <button
            type="button"
            onClick={() =>
              onConfirm({
                problem:
                  problem || "Not specified",
                priority,
              })
            }
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
          >
            🚑 Confirm & Book Ambulance
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   BOOKING TRACKER
========================================================= */

function BookingTracker({
  ambulance,
  booking,
  tracking,
  onDriverAccept,
  onStartTrip,
  onComplete,
  onCancel,
}) {
  if (!ambulance || !booking) return null;

  const steps = [
    {
      key: "BOOKED",
      title: "Booking placed",
      icon: "✓",
    },

    {
      key: "ACCEPTED",
      title: "Driver accepted",
      icon: "👨‍✈️",
    },

    {
      key: "ON_THE_WAY",
      title: "Ambulance on the way",
      icon: "🚑",
    },

    {
      key: "ARRIVED",
      title: "Ambulance arrived",
      icon: "📍",
    },

    {
      key: "COMPLETED",
      title: "Trip completed",
      icon: "✓",
    },
  ];

  const statusOrder = [
    "BOOKED",
    "ACCEPTED",
    "ON_THE_WAY",
    "ARRIVED",
    "COMPLETED",
  ];

  const currentIndex = statusOrder.indexOf(
    booking.status
  );

  return (
    <div className="space-y-5">
      {/* STATUS HEADER */}

      <div className="rounded-3xl bg-gray-900 p-5 text-white shadow-xl">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Active Ambulance Booking
            </div>

            <div className="mt-2 text-2xl font-bold">
              {booking.status === "COMPLETED"
                ? "Trip completed"
                : booking.status === "ARRIVED"
                ? "Ambulance has arrived"
                : booking.status === "ON_THE_WAY"
                ? "Ambulance is on the way"
                : booking.status === "ACCEPTED"
                ? "Driver accepted your request"
                : "Waiting for driver confirmation"}
            </div>

            <div className="mt-2 text-sm text-gray-400">
              Booking ID:{" "}
              <b className="text-gray-200">
                {booking.id}
              </b>
            </div>
          </div>

          <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
            <div className="text-xs text-gray-400">
              Ambulance
            </div>

            <div className="mt-1 text-lg font-bold">
              {ambulance.number}
            </div>

            <div className="mt-1 text-xs text-gray-400">
              {ambulance.typeFull}
            </div>
          </div>
        </div>
      </div>

      {/* PROGRESS */}

      <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-5 text-sm font-bold text-gray-900">
          Booking Progress
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => {
            const done = index <= currentIndex;
            const active = index === currentIndex;

            return (
              <div
                key={step.key}
                className="flex items-start gap-3"
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                      done
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-400"
                    } ${
                      active
                        ? "ring-4 ring-blue-100"
                        : ""
                    }`}
                  >
                    {step.icon}
                  </div>

                  {index < steps.length - 1 && (
                    <div
                      className={`mt-1 h-7 w-0.5 ${
                        index < currentIndex
                          ? "bg-blue-600"
                          : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>

                <div className="pt-1">
                  <div
                    className={`text-sm font-bold ${
                      done
                        ? "text-gray-900"
                        : "text-gray-400"
                    }`}
                  >
                    {step.title}
                  </div>

                  {active && (
                    <div className="mt-1 text-xs text-blue-600">
                      Current status
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* LIVE TRACKING */}

      {booking.status !== "BOOKED" &&
        booking.status !== "COMPLETED" && (
          <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <div className="text-lg font-bold text-gray-900">
                  Live Ambulance Tracking
                </div>

                <div className="mt-1 text-xs text-gray-500">
                  Driver location is being updated in real
                  time
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />

                <span className="text-xs font-bold text-green-600">
                  LIVE
                </span>
              </div>
            </div>

            <TrackingMap
              ambulance={ambulance}
              tracking={tracking}
              patientPosition={{
                x: 23,
                y: 70,
              }}
              hospitalPosition={{
                x: 78,
                y: 28,
              }}
            />
          </div>
        )}

      {/* ETA INFO */}

      {booking.status === "ON_THE_WAY" && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            icon="⏱️"
            label="Estimated Arrival"
            value={`${tracking.eta} min`}
            sub="Updated live"
          />

          <StatCard
            icon="📍"
            label="Distance"
            value={`${tracking.distance} km`}
            sub="Remaining"
          />

          <StatCard
            icon="🚑"
            label="Speed"
            value={`${tracking.speed} km/h`}
            sub="Current speed"
          />

          <StatCard
            icon="🛰️"
            label="GPS"
            value="Live"
            sub="Location active"
          />
        </div>
      )}

      {/* BOOKING DETAILS */}

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <SectionTitle
            eyebrow="Booking"
            title="Patient Details"
          />

          <div className="space-y-3">
            <div className="flex justify-between gap-4 text-sm">
              <span className="text-gray-500">
                Patient
              </span>

              <span className="font-semibold text-gray-900">
                {DEMO_PATIENT.name}
              </span>
            </div>

            <div className="flex justify-between gap-4 text-sm">
              <span className="text-gray-500">
                Phone
              </span>

              <span className="font-semibold text-gray-900">
                {DEMO_PATIENT.phone}
              </span>
            </div>

            <div className="flex justify-between gap-4 text-sm">
              <span className="text-gray-500">
                Problem
              </span>

              <span className="max-w-[60%] text-right font-semibold text-gray-900">
                {booking.problem}
              </span>
            </div>

            <div className="flex justify-between gap-4 text-sm">
              <span className="text-gray-500">
                Priority
              </span>

              <span
                className={`font-bold ${
                  booking.priority === "Emergency"
                    ? "text-red-600"
                    : booking.priority === "Urgent"
                    ? "text-amber-600"
                    : "text-green-600"
                }`}
              >
                {booking.priority}
              </span>
            </div>

            <div className="flex justify-between gap-4 text-sm">
              <span className="text-gray-500">
                Pickup
              </span>

              <span className="max-w-[60%] text-right font-semibold text-gray-900">
                {DEMO_PATIENT.location}
              </span>
            </div>
          </div>
        </div>

        <DriverProfile ambulance={ambulance} />
      </div>

      {/* DRIVER DEMO CONTROLS */}

      <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5">
        <div className="mb-4">
          <div className="text-lg font-bold text-gray-900">
            👨‍✈️ Driver Demo Controls
          </div>

          <div className="mt-1 text-xs text-gray-500">
            Use these buttons during your college
            presentation to simulate the real driver
            application.
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {booking.status === "BOOKED" && (
            <button
              type="button"
              onClick={onDriverAccept}
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700"
            >
              ✓ Accept Booking
            </button>
          )}

          {booking.status === "ACCEPTED" && (
            <button
              type="button"
              onClick={onStartTrip}
              className="rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-amber-600"
            >
              🚑 Start & Go On The Way
            </button>
          )}

          {booking.status === "ARRIVED" && (
            <button
              type="button"
              onClick={onComplete}
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700"
            >
              ✓ Complete Trip
            </button>
          )}

          {booking.status !== "COMPLETED" && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50"
            >
              Cancel Demo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   DRIVER DASHBOARD
========================================================= */

function DriverDashboard({
  ambulance,
  booking,
  duty,
  setDuty,
  onAccept,
  onStartTrip,
  onArrive,
  onComplete,
}) {
  const [driverTab, setDriverTab] =
    useState("overview");

  if (!ambulance) return null;

  return (
    <div className="space-y-5">
      {/* DRIVER HEADER */}

      <div className="rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 p-5 text-white shadow-xl sm:p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-3xl">
              👨‍✈️
            </div>

            <div>
              <div className="text-xl font-bold">
                {ambulance.driver}
              </div>

              <div className="mt-1 text-sm text-gray-400">
                {ambulance.number} •{" "}
                {ambulance.typeFull}
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-300">
                  ✓ Verified Driver
                </span>

                <span className="rounded-full bg-yellow-500/10 px-2.5 py-1 text-xs font-bold text-yellow-300">
                  ⭐ {ambulance.rating}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setDuty(!duty)}
            disabled={
              booking &&
              ["ACCEPTED", "ON_THE_WAY", "ARRIVED"].includes(
                booking.status
              )
            }
            className={`rounded-2xl px-5 py-3 text-sm font-bold transition ${
              duty
                ? "bg-emerald-500 text-white hover:bg-emerald-600"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
          >
            {duty ? "🟢 ON DUTY" : "⚫ OFF DUTY"}
          </button>
        </div>
      </div>

      {/* DRIVER TABS */}

      <div className="flex overflow-x-auto rounded-2xl border border-gray-200 bg-white p-1 shadow-sm">
        {[
          ["overview", "Overview"],
          ["request", "Booking"],
          ["vehicle", "Ambulance"],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setDriverTab(key)}
            className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold ${
              driverTab === key
                ? "bg-blue-600 text-white"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}

      {driverTab === "overview" && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              icon="🚑"
              label="Duty Status"
              value={duty ? "ON" : "OFF"}
              sub="Availability"
            />

            <StatCard
              icon="📦"
              label="Today's Trips"
              value="07"
              sub="+2 from yesterday"
            />

            <StatCard
              icon="⭐"
              label="Rating"
              value={ambulance.rating}
              sub="Based on 124 trips"
            />

            <StatCard
              icon="🛣️"
              label="Today's Distance"
              value="68 km"
              sub="Total driven"
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
              <SectionTitle
                eyebrow="Driver"
                title="Profile"
              />

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Full Name
                  </span>

                  <span className="font-semibold">
                    {ambulance.driver}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Experience
                  </span>

                  <span className="font-semibold">
                    {ambulance.driverExperience}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Phone
                  </span>

                  <span className="font-semibold">
                    {ambulance.driverPhone}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Hospital
                  </span>

                  <span className="max-w-[60%] text-right font-semibold">
                    {ambulance.hospital}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
              <SectionTitle
                eyebrow="Current"
                title="Vehicle Status"
              />

              <div className="flex items-center gap-4 rounded-2xl bg-blue-50 p-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white text-2xl shadow-sm">
                  🚑
                </div>

                <div className="flex-1">
                  <div className="font-bold text-gray-900">
                    {ambulance.number}
                  </div>

                  <div className="mt-1 text-xs text-gray-500">
                    {ambulance.typeFull}
                  </div>
                </div>

                <StatusBadge
                  status={
                    booking
                      ? booking.status
                      : "AVAILABLE"
                  }
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* REQUEST */}

      {driverTab === "request" && (
        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <SectionTitle
            eyebrow="Incoming"
            title="Current Booking Request"
            description="This is how the request can appear on the driver's mobile dashboard."
          />

          {!booking ? (
            <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center">
              <div className="text-4xl">📭</div>

              <div className="mt-3 text-sm font-bold text-gray-700">
                No active booking
              </div>

              <div className="mt-1 text-xs text-gray-400">
                New requests will appear here
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-blue-600">
                    Booking {booking.id}
                  </div>

                  <div className="mt-1 text-xl font-bold text-gray-900">
                    {DEMO_PATIENT.name}
                  </div>

                  <div className="mt-1 text-sm text-gray-500">
                    📍 {DEMO_PATIENT.location}
                  </div>
                </div>

                <StatusBadge
                  status={booking.status}
                />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-white p-3">
                  <div className="text-xs text-gray-400">
                    Problem
                  </div>

                  <div className="mt-1 text-sm font-bold">
                    {booking.problem}
                  </div>
                </div>

                <div className="rounded-xl bg-white p-3">
                  <div className="text-xs text-gray-400">
                    Priority
                  </div>

                  <div className="mt-1 text-sm font-bold">
                    {booking.priority}
                  </div>
                </div>

                <div className="rounded-xl bg-white p-3">
                  <div className="text-xs text-gray-400">
                    Fare
                  </div>

                  <div className="mt-1 text-sm font-bold">
                    ₹{ambulance.price}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {booking.status === "BOOKED" && (
                  <button
                    type="button"
                    disabled={!duty}
                    onClick={onAccept}
                    className={`rounded-xl px-4 py-2.5 text-xs font-bold ${
                      duty
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "cursor-not-allowed bg-gray-200 text-gray-400"
                    }`}
                  >
                    ✓ Accept Request
                  </button>
                )}

                {booking.status === "ACCEPTED" && (
                  <button
                    type="button"
                    onClick={onStartTrip}
                    className="rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-amber-600"
                  >
                    🚑 Start Trip
                  </button>
                )}

                {booking.status === "ON_THE_WAY" && (
                  <button
                    type="button"
                    onClick={onArrive}
                    className="rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-purple-700"
                  >
                    📍 Mark Arrived
                  </button>
                )}

                {booking.status === "ARRIVED" && (
                  <button
                    type="button"
                    onClick={onComplete}
                    className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700"
                  >
                    ✓ Complete Trip
                  </button>
                )}
              </div>

              {!duty &&
                booking.status === "BOOKED" && (
                  <div className="mt-3 text-xs font-medium text-red-600">
                    Driver must be ON DUTY to accept a
                    booking.
                  </div>
                )}
            </div>
          )}
        </div>
      )}

      {/* VEHICLE */}

      {driverTab === "vehicle" && (
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <SectionTitle
              eyebrow="Ambulance"
              title="Vehicle Information"
            />

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  Registration
                </span>

                <span className="font-bold">
                  {ambulance.number}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  Type
                </span>

                <span className="font-bold">
                  {ambulance.typeFull}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  Hospital
                </span>

                <span className="max-w-[60%] text-right font-bold">
                  {ambulance.hospital}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  Status
                </span>

                <span className="font-bold text-emerald-600">
                  {duty ? "ON DUTY" : "OFF DUTY"}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <SectionTitle
              eyebrow="Equipment"
              title="Available Equipment"
            />

            <div className="grid grid-cols-2 gap-2">
              {ambulance.equipment.map((item) => (
                <div
                  key={item}
                  className="rounded-xl bg-gray-50 p-3 text-xs font-semibold text-gray-700"
                >
                  ✓ {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   ADMIN DASHBOARD
========================================================= */

function AdminDashboard({
  ambulances,
  booking,
  selectedAmbulance,
  dutyMap,
}) {
  const available = ambulances.filter(
    (a) =>
      a.duty &&
      a.status === "AVAILABLE"
  ).length;

  const onTrip =
    booking &&
    ["ACCEPTED", "ON_THE_WAY", "ARRIVED"].includes(
      booking.status
    )
      ? 1
      : 0;

  const hospitals = new Set(
    ambulances.map((a) => a.hospital)
  ).size;

  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-gradient-to-br from-blue-700 to-blue-600 p-6 text-white shadow-xl">
        <div className="text-xs font-bold uppercase tracking-widest text-blue-200">
          Hospital Operations
        </div>

        <div className="mt-2 text-2xl font-bold">
          Ambulance Control Centre
        </div>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
          Monitor ambulance availability, driver duty
          status, active bookings and live emergency trips
          from one dashboard.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon="🚑"
          label="Total Ambulances"
          value={ambulances.length}
          sub="Registered"
        />

        <StatCard
          icon="🟢"
          label="Available"
          value={available}
          sub="Ready for booking"
        />

        <StatCard
          icon="📍"
          label="Active Trips"
          value={onTrip}
          sub="Currently running"
        />

        <StatCard
          icon="🏥"
          label="Hospitals"
          value={hospitals}
          sub="Connected"
        />
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5">
          <div className="text-lg font-bold text-gray-900">
            Ambulance Fleet
          </div>

          <div className="mt-1 text-xs text-gray-500">
            Live operational status
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead className="bg-gray-50">
              <tr className="text-xs font-bold uppercase tracking-wide text-gray-400">
                <th className="px-5 py-3">
                  Ambulance
                </th>

                <th className="px-5 py-3">
                  Type
                </th>

                <th className="px-5 py-3">
                  Driver
                </th>

                <th className="px-5 py-3">
                  Hospital
                </th>

                <th className="px-5 py-3">
                  Duty
                </th>

                <th className="px-5 py-3">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {ambulances.map((a) => {
                const isDuty =
                  dutyMap[a.id] !== undefined
                    ? dutyMap[a.id]
                    : a.duty;

                const isActive =
                  booking &&
                  selectedAmbulance?.id === a.id;

                return (
                  <tr
                    key={a.id}
                    className={
                      isActive
                        ? "bg-blue-50"
                        : "hover:bg-gray-50"
                    }
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="text-xl">
                          {getTypeIcon(a.type)}
                        </div>

                        <div>
                          <div className="text-sm font-bold text-gray-900">
                            {a.number}
                          </div>

                          <div className="text-xs text-gray-400">
                            {a.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-gray-700">
                      {a.typeFull}
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-gray-700">
                      {a.driver}
                    </td>

                    <td className="px-5 py-4 text-xs text-gray-600">
                      {a.hospital}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                          isDuty
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {isDuty
                          ? "ON DUTY"
                          : "OFF DUTY"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge
                        status={
                          isActive
                            ? booking.status
                            : a.status
                        }
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {booking && selectedAmbulance && (
        <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Active Trip
              </div>

              <div className="mt-1 text-lg font-bold text-gray-900">
                {selectedAmbulance.number}
              </div>

              <div className="mt-1 text-sm text-gray-500">
                Driver: {selectedAmbulance.driver}
              </div>
            </div>

            <StatusBadge
              status={booking.status}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function AmbulancePrototype() {
  const [activeView, setActiveView] =
    useState("patient");

  const [ambulances, setAmbulances] = useState(
    INITIAL_AMBULANCES
  );

  const [selectedAmbulance, setSelectedAmbulance] =
    useState(null);

  const [selectedType, setSelectedType] =
    useState("ALL");

  const [selectedHospital, setSelectedHospital] =
    useState("ALL");

  const [bookingModal, setBookingModal] =
    useState(false);

  const [booking, setBooking] = useState(null);

  const [dutyMap, setDutyMap] = useState(() => {
    const result = {};

    INITIAL_AMBULANCES.forEach((item) => {
      result[item.id] = item.duty;
    });

    return result;
  });

  const [tracking, setTracking] = useState({
    ambulanceX: 48,
    ambulanceY: 56,
    distance: 2.4,
    eta: 8,
    speed: 32,
  });

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredAmbulances = useMemo(() => {
    return ambulances.filter((item) => {
      const typeMatch =
        selectedType === "ALL" ||
        item.type === selectedType;

      const hospitalMatch =
        selectedHospital === "ALL" ||
        item.hospital === selectedHospital;

      return (
        typeMatch &&
        hospitalMatch &&
        item.duty &&
        item.status === "AVAILABLE"
      );
    });
  }, [
    ambulances,
    selectedType,
    selectedHospital,
  ]);

  /* =======================================================
     OPEN BOOKING
  ======================================================= */

  const handleOpenBooking = (ambulance) => {
    setSelectedAmbulance(ambulance);
    setBookingModal(true);
  };

  /* =======================================================
     CONFIRM BOOKING
  ======================================================= */

  const handleConfirmBooking = ({
    problem,
    priority,
  }) => {
    if (!selectedAmbulance) return;

    const newBooking = {
      id: `SWQ-${Math.floor(
        100000 + Math.random() * 900000
      )}`,
      ambulanceId: selectedAmbulance.id,
      status: "BOOKED",
      problem,
      priority,
      createdAt: new Date().toLocaleTimeString(),
    };

    setBooking(newBooking);
    setBookingModal(false);
    setActiveView("patient");

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
  };

  /* =======================================================
     DRIVER ACCEPT
  ======================================================= */

  const handleDriverAccept = () => {
    if (!booking) return;

    setBooking((prev) => ({
      ...prev,
      status: "ACCEPTED",
    }));

    setAmbulances((prev) =>
      prev.map((item) =>
        item.id === selectedAmbulance?.id
          ? {
              ...item,
              status: "ACCEPTED",
            }
          : item
      )
    );
  };

  /* =======================================================
     START TRIP
  ======================================================= */

  const handleStartTrip = () => {
    if (!booking) return;

    setBooking((prev) => ({
      ...prev,
      status: "ON_THE_WAY",
    }));

    setAmbulances((prev) =>
      prev.map((item) =>
        item.id === selectedAmbulance?.id
          ? {
              ...item,
              status: "ON_THE_WAY",
            }
          : item
      )
    );

    setTracking({
      ambulanceX: 44,
      ambulanceY: 59,
      distance: 2.4,
      eta: 8,
      speed: 32,
    });
  };

  /* =======================================================
     ARRIVE
  ======================================================= */

  const handleArrive = () => {
    if (!booking) return;

    setBooking((prev) => ({
      ...prev,
      status: "ARRIVED",
    }));

    setAmbulances((prev) =>
      prev.map((item) =>
        item.id === selectedAmbulance?.id
          ? {
              ...item,
              status: "ARRIVED",
            }
          : item
      )
    );

    setTracking({
      ambulanceX: 23,
      ambulanceY: 70,
      distance: 0,
      eta: 0,
      speed: 0,
    });
  };

  /* =======================================================
     COMPLETE
  ======================================================= */

  const handleComplete = () => {
    if (!booking) return;

    setBooking((prev) => ({
      ...prev,
      status: "COMPLETED",
    }));

    setAmbulances((prev) =>
      prev.map((item) =>
        item.id === selectedAmbulance?.id
          ? {
              ...item,
              status: "AVAILABLE",
            }
          : item
      )
    );
  };

  /* =======================================================
     CANCEL
  ======================================================= */

  const handleCancel = () => {
    if (selectedAmbulance) {
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
    }

    setBooking(null);
    setBookingModal(false);
    setSelectedAmbulance(null);

    setTracking({
      ambulanceX: 48,
      ambulanceY: 56,
      distance: 2.4,
      eta: 8,
      speed: 32,
    });
  };

  /* =======================================================
     DUTY CHANGE
  ======================================================= */

  const handleDutyChange = (value) => {
    if (!selectedAmbulance) return;

    if (
      booking &&
      ["ACCEPTED", "ON_THE_WAY", "ARRIVED"].includes(
        booking.status
      )
    ) {
      return;
    }

    setDutyMap((prev) => ({
      ...prev,
      [selectedAmbulance.id]: value,
    }));

    setAmbulances((prev) =>
      prev.map((item) =>
        item.id === selectedAmbulance.id
          ? {
              ...item,
              duty: value,
              status: value
                ? "AVAILABLE"
                : "AVAILABLE",
            }
          : item
      )
    );
  };

  /* =======================================================
     AUTO GPS SIMULATION
  ======================================================= */

  useEffect(() => {
    if (!booking) return;

    if (booking.status !== "ON_THE_WAY") {
      return;
    }

    const timer = setInterval(() => {
      setTracking((prev) => {
        const nextX = Math.max(
          23,
          prev.ambulanceX - 1.15
        );

        const nextY =
          prev.ambulanceY < 70
            ? prev.ambulanceY + 0.5
            : 70;

        const nextDistance = Math.max(
          0.3,
          Number(
            (prev.distance - 0.18).toFixed(1)
          )
        );

        const nextEta = Math.max(
          1,
          Math.ceil(nextDistance * 3.2)
        );

        if (nextDistance <= 0.3) {
          setBooking((current) => {
            if (
              current &&
              current.status === "ON_THE_WAY"
            ) {
              return {
                ...current,
                status: "ARRIVED",
              };
            }

            return current;
          });

          setAmbulances((prevAmbulances) =>
            prevAmbulances.map((item) =>
              item.id === selectedAmbulance?.id
                ? {
                    ...item,
                    status: "ARRIVED",
                  }
                : item
            )
          );

          return {
            ambulanceX: 23,
            ambulanceY: 70,
            distance: 0,
            eta: 0,
            speed: 0,
          };
        }

        return {
          ambulanceX: nextX,
          ambulanceY: nextY,
          distance: nextDistance,
          eta: nextEta,
          speed: Math.max(
            20,
            Math.floor(prev.speed - 1)
          ),
        };
      });
    }, 1800);

    return () => clearInterval(timer);
  }, [booking, selectedAmbulance]);

  /* =======================================================
     RESET DEMO
  ======================================================= */

  const resetDemo = () => {
    setActiveView("patient");
    setAmbulances(INITIAL_AMBULANCES);
    setSelectedAmbulance(null);
    setSelectedType("ALL");
    setSelectedHospital("ALL");
    setBooking(null);
    setBookingModal(false);

    const result = {};

    INITIAL_AMBULANCES.forEach((item) => {
      result[item.id] = item.duty;
    });

    setDutyMap(result);

    setTracking({
      ambulanceX: 48,
      ambulanceY: 56,
      distance: 2.4,
      eta: 8,
      speed: 32,
    });
  };

  /* =======================================================
     CURRENT DRIVER
  ======================================================= */

  const currentDriverAmbulance =
    selectedAmbulance ||
    ambulances.find((item) => item.duty) ||
    ambulances[0];

  /* =======================================================
     HEADER + MAIN UI
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-gray-900">
      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xl text-white shadow-md">
              🚑
            </div>

            <div>
              <div className="text-base font-extrabold tracking-tight text-gray-900">
                Swasth QR
              </div>

              <div className="hidden text-[10px] font-semibold uppercase tracking-wider text-gray-400 sm:block">
                Smart Ambulance Network
              </div>
            </div>
          </div>

          {/* DESKTOP SWITCHER */}

          <div className="hidden items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1 md:flex">
            {[
              ["patient", "👤 Patient"],
              ["driver", "👨‍✈️ Driver"],
              ["admin", "🏥 Admin"],
            ].map(([key, label]) => (
              <button
                type="button"
                key={key}
                onClick={() =>
                  setActiveView(key)
                }
                className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                  activeView === key
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 sm:block">
              ● System Online
            </div>

            <button
              type="button"
              onClick={resetDemo}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600 hover:border-blue-300 hover:text-blue-600"
            >
              Reset
            </button>
          </div>
        </div>

        {/* MOBILE VIEW SWITCHER */}

        <div className="border-t border-gray-100 px-4 py-2 md:hidden">
          <div className="mx-auto flex max-w-7xl gap-1 rounded-xl bg-gray-100 p-1">
            {[
              ["patient", "👤 Patient"],
              ["driver", "👨‍✈️ Driver"],
              ["admin", "🏥 Admin"],
            ].map(([key, label]) => (
              <button
                type="button"
                key={key}
                onClick={() =>
                  setActiveView(key)
                }
                className={`flex-1 rounded-lg px-2 py-2 text-[11px] font-bold ${
                  activeView === key
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ==================================================
          MAIN
      ================================================== */}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* =================================================
            PATIENT VIEW
        ================================================= */}

        {activeView === "patient" && (
          <div className="space-y-7">
            {/* HERO */}

            <section className="overflow-hidden rounded-[28px] bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 p-6 text-white shadow-xl sm:p-8 lg:p-10">
              <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-blue-50">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-green-300" />
                    Emergency Transport Network
                  </div>

                  <h1 className="mt-5 max-w-2xl text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
                    Get the right ambulance,
                    <span className="text-blue-200">
                      {" "}
                      when you need it.
                    </span>
                  </h1>

                  <p className="mt-4 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
                    Find nearby ambulances, choose the
                    required medical support, book instantly
                    and track your ambulance in real time.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    <div className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold">
                      📍 Live GPS
                    </div>

                    <div className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold">
                      ⏱️ Live ETA
                    </div>

                    <div className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold">
                      👨‍✈️ Verified Drivers
                    </div>

                    <div className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold">
                      🏥 Hospital Connected
                    </div>
                  </div>
                </div>

                <div className="relative hidden min-h-[250px] lg:block">
                  <div className="absolute right-5 top-5 h-52 w-52 rounded-full border border-white/10 bg-white/5" />

                  <div className="absolute bottom-3 right-10 flex h-28 w-28 items-center justify-center rounded-[30px] border border-white/20 bg-white/10 text-6xl shadow-2xl backdrop-blur">
                    🚑
                  </div>

                  <div className="absolute left-5 top-12 rounded-2xl bg-white px-4 py-3 text-gray-900 shadow-xl">
                    <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                      Nearest ambulance
                    </div>

                    <div className="mt-1 text-lg font-extrabold">
                      8 min
                    </div>
                  </div>

                  <div className="absolute bottom-3 left-0 rounded-2xl bg-white px-4 py-3 text-gray-900 shadow-xl">
                    <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                      GPS status
                    </div>

                    <div className="mt-1 flex items-center gap-1.5 text-sm font-bold">
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                      Live
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ACTIVE BOOKING */}

            {booking && selectedAmbulance && (
              <BookingTracker
                ambulance={selectedAmbulance}
                booking={booking}
                tracking={tracking}
                onDriverAccept={
                  handleDriverAccept
                }
                onStartTrip={handleStartTrip}
                onComplete={handleComplete}
                onCancel={handleCancel}
              />
            )}

            {/* SEARCH */}

            {!booking && (
              <>
                <section>
                  <SectionTitle
                    eyebrow="Find ambulance"
                    title="Choose your ambulance"
                    description="Select the ambulance type and hospital network according to the patient's requirement."
                  />

                  <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                    <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
                      <div>
                        <label className="mb-1.5 block text-xs font-bold text-gray-700">
                          Ambulance Type
                        </label>

                        <select
                          value={selectedType}
                          onChange={(e) =>
                            setSelectedType(
                              e.target.value
                            )
                          }
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                          <option value="ALL">
                            All Ambulance Types
                          </option>

                          <option value="BLS">
                            🚑 Basic Life Support
                          </option>

                          <option value="ALS">
                            ⚕️ Advanced Life Support
                          </option>

                          <option value="ICU">
                            🫀 ICU Ambulance
                          </option>

                          <option value="PATIENT">
                            ♿ Patient Transport
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-bold text-gray-700">
                          Hospital
                        </label>

                        <select
                          value={selectedHospital}
                          onChange={(e) =>
                            setSelectedHospital(
                              e.target.value
                            )
                          }
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                          <option value="ALL">
                            All Hospitals
                          </option>

                          {HOSPITALS.map(
                            (hospital) => (
                              <option
                                key={hospital.id}
                                value={hospital.name}
                              >
                                {hospital.name}
                              </option>
                            )
                          )}
                        </select>
                      </div>

                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedType("ALL");
                            setSelectedHospital(
                              "ALL"
                            );
                          }}
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-600 hover:border-blue-400 hover:text-blue-600 lg:w-auto"
                        >
                          Clear Filters
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                {/* QUICK TYPE */}

                <section>
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-sm font-bold text-gray-900">
                      Ambulance categories
                    </div>

                    <div className="text-xs text-gray-400">
                      {filteredAmbulances.length}{" "}
                      available
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      {
                        type: "BLS",
                        title: "BLS",
                        desc: "Basic support",
                        icon: "🚑",
                      },
                      {
                        type: "ALS",
                        title: "ALS",
                        desc: "Advanced care",
                        icon: "⚕️",
                      },
                      {
                        type: "ICU",
                        title: "ICU",
                        desc: "Critical care",
                        icon: "🫀",
                      },
                      {
                        type: "PATIENT",
                        title: "Patient",
                        desc: "Transport",
                        icon: "♿",
                      },
                    ].map((item) => (
                      <button
                        type="button"
                        key={item.type}
                        onClick={() =>
                          setSelectedType(
                            item.type
                          )
                        }
                        className={`rounded-2xl border p-4 text-left transition ${
                          selectedType === item.type
                            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                            : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm"
                        }`}
                      >
                        <div className="text-2xl">
                          {item.icon}
                        </div>

                        <div className="mt-3 text-sm font-bold">
                          {item.title}
                        </div>

                        <div className="mt-1 text-xs text-gray-400">
                          {item.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </section>

                {/* AMBULANCE LIST */}

                <section>
                  <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                    <div>
                      <div className="text-xl font-bold text-gray-900">
                        Available near you
                      </div>

                      <div className="mt-1 text-xs text-gray-500">
                        Showing ambulances that are currently
                        ON DUTY.
                      </div>
                    </div>

                    <div className="text-xs font-bold text-emerald-600">
                      ● Live availability
                    </div>
                  </div>

                  {filteredAmbulances.length ===
                  0 ? (
                    <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center">
                      <div className="text-4xl">
                        🚑
                      </div>

                      <div className="mt-3 text-sm font-bold text-gray-700">
                        No ambulance available
                      </div>

                      <div className="mt-1 text-xs text-gray-400">
                        Try another ambulance type or
                        hospital.
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {filteredAmbulances.map(
                        (ambulance) => (
                          <AmbulanceCard
                            key={ambulance.id}
                            ambulance={ambulance}
                            selected={
                              selectedAmbulance?.id ===
                              ambulance.id
                            }
                            onSelect={(item) =>
                              setSelectedAmbulance(
                                item
                              )
                            }
                            onBook={
                              handleOpenBooking
                            }
                          />
                        )
                      )}
                    </div>
                  )}
                </section>

                {/* HOW IT WORKS */}

                <section>
                  <SectionTitle
                    eyebrow="Simple process"
                    title="How Swasth QR Ambulance works"
                  />

                  <div className="grid gap-3 md:grid-cols-4">
                    {[
                      [
                        "01",
                        "Choose",
                        "Select the required ambulance type.",
                        "🔎",
                      ],
                      [
                        "02",
                        "Book",
                        "Confirm pickup and patient details.",
                        "📱",
                      ],
                      [
                        "03",
                        "Track",
                        "Watch the ambulance move in real time.",
                        "📍",
                      ],
                      [
                        "04",
                        "Arrive",
                        "Driver reaches the patient and trip starts.",
                        "🚑",
                      ],
                    ].map(
                      ([
                        number,
                        title,
                        desc,
                        icon,
                      ]) => (
                        <div
                          key={number}
                          className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                        >
                          <div className="flex items-center justify-between">
                            <div className="text-2xl">
                              {icon}
                            </div>

                            <div className="text-xs font-black text-gray-200">
                              {number}
                            </div>
                          </div>

                          <div className="mt-5 text-sm font-bold">
                            {title}
                          </div>

                          <div className="mt-1 text-xs leading-5 text-gray-500">
                            {desc}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </section>

                {/* SAFETY */}

                <section className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5 sm:p-6">
                  <div className="grid gap-5 md:grid-cols-[auto_1fr] md:items-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
                      🛡️
                    </div>

                    <div>
                      <div className="text-lg font-bold text-gray-900">
                        Connected healthcare transport
                      </div>

                      <div className="mt-1 text-sm leading-6 text-gray-600">
                        Ambulance, driver and hospital
                        information stays connected throughout
                        the trip. The patient can see the vehicle
                        status and estimated arrival time.
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}
          </div>
        )}

        {/* =================================================
            DRIVER VIEW
        ================================================= */}

        {activeView === "driver" && (
          <DriverDashboard
            ambulance={currentDriverAmbulance}
            booking={booking}
            duty={
              dutyMap[
                currentDriverAmbulance.id
              ] !== undefined
                ? dutyMap[
                    currentDriverAmbulance.id
                  ]
                : currentDriverAmbulance.duty
            }
            setDuty={handleDutyChange}
            onAccept={handleDriverAccept}
            onStartTrip={handleStartTrip}
            onArrive={handleArrive}
            onComplete={handleComplete}
          />
        )}

        {/* =================================================
            ADMIN VIEW
        ================================================= */}

        {activeView === "admin" && (
          <AdminDashboard
            ambulances={ambulances}
            booking={booking}
            selectedAmbulance={
              selectedAmbulance
            }
            dutyMap={dutyMap}
          />
        )}
      </main>

      {/* ==================================================
          FOOTER
      ================================================== */}

      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-7 md:grid-cols-[1.5fr_1fr_1fr]">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-lg text-white">
                  🚑
                </div>

                <div className="font-extrabold text-gray-900">
                  Swasth QR
                </div>
              </div>

              <p className="mt-3 max-w-md text-xs leading-5 text-gray-500">
                Smart healthcare access platform connecting
                patients, doctors, hospitals and emergency
                transport services.
              </p>
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Ambulance
              </div>

              <div className="mt-3 space-y-2 text-xs text-gray-600">
                <div>BLS Ambulance</div>
                <div>ALS Ambulance</div>
                <div>ICU Ambulance</div>
                <div>Patient Transport</div>
              </div>
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
                System
              </div>

              <div className="mt-3 space-y-2 text-xs text-gray-600">
                <div>Live GPS Tracking</div>
                <div>Driver Management</div>
                <div>Hospital Network</div>
                <div>Emergency Dispatch</div>
              </div>
            </div>
          </div>

          <div className="mt-7 flex flex-col justify-between gap-2 border-t border-gray-100 pt-5 text-[11px] text-gray-400 sm:flex-row">
            <div>
              © 2026 Swasth QR • Prototype
            </div>

            <div>
              Smart Healthcare • Emergency Transport •
              Live Tracking
            </div>
          </div>
        </div>
      </footer>

      {/* ==================================================
          BOOKING MODAL
      ================================================== */}

      {bookingModal && (
        <BookingModal
          ambulance={selectedAmbulance}
          onClose={() =>
            setBookingModal(false)
          }
          onConfirm={handleConfirmBooking}
        />
      )}
    </div>
  );
}