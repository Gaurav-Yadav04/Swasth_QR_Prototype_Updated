export const DEMO_HOSPITALS = [
  {
    id: "dh-01",
    name: "District Hospital Ayodhya",
    city: "Ayodhya",
    departments: ["General Medicine", "Orthopedic", "Pediatrics", "Neurology"],
  },
  {
    id: "gh-01",
    name: "Government Medical Centre",
    city: "Lucknow",
    departments: ["General Medicine", "Orthopedic", "Cardiology", "ENT"],
  },
];

export const DEMO_DOCTORS = [
  {
    id: "doc-1",
    name: "Dr. Ananya Sharma",
    specialization: "General Medicine",
    hospitalId: "dh-01",
    hospitalName: "District Hospital Ayodhya",
    room: "204",
    from: "09:00",
    to: "14:00",
    active: true,
    currentToken: 41,
    queueCount: 12,
    avgMinutes: 5,
  },
  {
    id: "doc-2",
    name: "Dr. Rahul Verma",
    specialization: "Orthopedic",
    hospitalId: "dh-01",
    hospitalName: "District Hospital Ayodhya",
    room: "202",
    from: "10:00",
    to: "15:00",
    active: true,
    currentToken: 18,
    queueCount: 7,
    avgMinutes: 7,
  },
  {
    id: "doc-3",
    name: "Dr. Priya Singh",
    specialization: "Pediatrics",
    hospitalId: "dh-01",
    hospitalName: "District Hospital Ayodhya",
    room: "105",
    from: "09:00",
    to: "13:00",
    active: false,
    currentToken: 11,
    queueCount: 0,
    avgMinutes: 6,
  },
  {
    id: "doc-4",
    name: "Dr. Arjun Mehta",
    specialization: "Cardiology",
    hospitalId: "gh-01",
    hospitalName: "Government Medical Centre",
    room: "301",
    from: "11:00",
    to: "16:00",
    active: true,
    currentToken: 23,
    queueCount: 9,
    avgMinutes: 8,
  },
];

export const DEFAULT_QUEUE = [
  { id: "q1", token: 41, patient: "Rahul", doctorId: "doc-1", status: "in-progress" },
  { id: "q2", token: 42, patient: "Amit", doctorId: "doc-1", status: "waiting" },
  { id: "q3", token: 43, patient: "Neha", doctorId: "doc-1", status: "waiting" },
  { id: "q4", token: 44, patient: "Suresh", doctorId: "doc-1", status: "waiting" },
  { id: "q5", token: 45, patient: "Pooja", doctorId: "doc-1", status: "waiting" },
  { id: "q6", token: 46, patient: "Vikas", doctorId: "doc-1", status: "waiting" },
  { id: "q7", token: 47, patient: "Demo Patient", doctorId: "doc-1", status: "waiting" },
  { id: "q8", token: 48, patient: "Kiran", doctorId: "doc-1", status: "waiting" },
];

const QUEUE_KEY = "swasth_demo_queue_v2";
const APPOINTMENT_KEY = "swasth_demo_appointment_v2";
const STATUS_KEY = "swasth_demo_doctor_status_v2";

export function getQueue() {
  try {
    const saved = JSON.parse(localStorage.getItem(QUEUE_KEY));
    return Array.isArray(saved) && saved.length ? saved : DEFAULT_QUEUE;
  } catch {
    return DEFAULT_QUEUE;
  }
}

export function saveQueue(queue) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  window.dispatchEvent(new Event("swasth-queue-updated"));
}

export function resetDemoQueue() {
  saveQueue(DEFAULT_QUEUE);
  localStorage.removeItem(APPOINTMENT_KEY);
}

export function getMyAppointment() {
  try {
    return JSON.parse(localStorage.getItem(APPOINTMENT_KEY));
  } catch {
    return null;
  }
}

export function saveMyAppointment(appointment) {
  localStorage.setItem(APPOINTMENT_KEY, JSON.stringify(appointment));
  window.dispatchEvent(new Event("swasth-queue-updated"));
}

export function nextTokenForDoctor(doctorId) {
  const queue = getQueue().filter((item) => item.doctorId === doctorId);
  return queue.length ? Math.max(...queue.map((item) => Number(item.token) || 0)) + 1 : 1;
}

export function estimateWait(doctor, token) {
  const queue = getQueue().filter(
    (item) => item.doctorId === doctor.id && item.status !== "completed"
  );
  const ahead = queue.filter((item) => Number(item.token) < Number(token)).length;
  return {
    ahead,
    minutes: Math.max(0, ahead * (doctor.avgMinutes || 5)),
  };
}


export function getDoctorActive(doctorId, fallback = true) {
  try {
    const statuses = JSON.parse(localStorage.getItem(STATUS_KEY)) || {};
    return statuses[doctorId] === undefined ? fallback : statuses[doctorId];
  } catch {
    return fallback;
  }
}

export function setDoctorActive(doctorId, active) {
  const statuses = JSON.parse(localStorage.getItem(STATUS_KEY) || "{}");
  statuses[doctorId] = active;
  localStorage.setItem(STATUS_KEY, JSON.stringify(statuses));
  window.dispatchEvent(new Event("swasth-queue-updated"));
}
