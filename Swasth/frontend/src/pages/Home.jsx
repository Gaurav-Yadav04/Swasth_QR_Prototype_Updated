import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
// import Footer from "../components/Footer";

export default function Home() {
  const [doctors, setDoctors] = useState([]);

  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("");
  const [hospital, setHospital] = useState("");

  const [selected, setSelected] = useState(null);
  const [disease, setDisease] = useState("");

  const [booked, setBooked] = useState(null);

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/doctors/public");

      const doctorList = Array.isArray(res.data)
        ? res.data
        : res.data?.doctors ||
          res.data?.data ||
          [];

      setDoctors(
        Array.isArray(doctorList)
          ? doctorList
          : []
      );
    } catch (err) {
      console.error("LOAD DOCTORS ERROR:", err);

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

  const getLocalProfile = () => {
    try {
      const raw = localStorage.getItem(
        "swasth_patient_profile"
      );

      if (!raw) return {};

      const profile = JSON.parse(raw);

      return profile &&
        typeof profile === "object"
        ? profile
        : {};
    } catch (err) {
      console.error(
        "PROFILE PARSE ERROR:",
        err
      );

      return {};
    }
  };

  const getHospitalId = (doctor) => {
    if (!doctor) return null;

    if (
      doctor.hospital &&
      typeof doctor.hospital === "object" &&
      doctor.hospital._id
    ) {
      return doctor.hospital._id;
    }

    if (
      typeof doctor.hospital === "string" &&
      doctor.hospital.trim()
    ) {
      return doctor.hospital;
    }

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

    if (
      typeof doctor.hospital_id === "string" &&
      doctor.hospital_id.trim()
    ) {
      return doctor.hospital_id;
    }

    if (
      doctor.hospital_id &&
      typeof doctor.hospital_id === "object" &&
      doctor.hospital_id._id
    ) {
      return doctor.hospital_id._id;
    }

    return null;
  };

  const getHospitalNameFromObject = (source) => {
    if (!source) return "";

    if (
      source.hospital &&
      typeof source.hospital === "object"
    ) {
      return (
        source.hospital.name ||
        source.hospital.hospitalName ||
        source.hospital.title ||
        ""
      );
    }

    if (
      typeof source.hospital === "string" &&
      source.hospital.trim()
    ) {
      return source.hospital;
    }

    if (
      source.hospitalId &&
      typeof source.hospitalId === "object"
    ) {
      return (
        source.hospitalId.name ||
        source.hospitalId.hospitalName ||
        ""
      );
    }

    return (
      source.hospitalName ||
      source.hospital_name ||
      source.hospitalTitle ||
      ""
    );
  };

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

  const hospitals = useMemo(() => {
    return [
      ...new Set(
        doctors
          .map((doctor) =>
            getHospitalNameFromObject(
              doctor
            )
          )
          .filter(Boolean)
      ),
    ];
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    const q = query
      .toLowerCase()
      .trim();

    return doctors.filter((doctor) => {
      const name =
        doctor.name?.toLowerCase() ||
        "";

      const specialization =
        doctor.specialization?.toLowerCase() ||
        "";

      const hospitalName =
        getHospitalNameFromObject(
          doctor
        ).toLowerCase();

      const doctorDepartment =
        doctor.department ||
        doctor.specialization ||
        "";

      const doctorHospital =
        getHospitalNameFromObject(
          doctor
        );

      const matchesSearch =
        !q ||
        name.includes(q) ||
        specialization.includes(q) ||
        hospitalName.includes(q);

      const matchesDepartment =
        !department ||
        doctorDepartment === department;

      const matchesHospital =
        !hospital ||
        doctorHospital === hospital;

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesHospital
      );
    });
  }, [
    doctors,
    query,
    department,
    hospital,
  ]);

  const createCompleteAppointment = (
    backendAppointment,
    doctor,
    enteredDisease
  ) => {
    const profile =
      getLocalProfile();

    const appointment =
      backendAppointment || {};

    const hospitalObject =
      appointment.hospital &&
      typeof appointment.hospital ===
        "object"
        ? appointment.hospital
        : doctor?.hospital &&
          typeof doctor.hospital ===
            "object"
        ? doctor.hospital
        : null;

    const hospitalName =
      hospitalObject?.name ||
      hospitalObject?.hospitalName ||
      hospitalObject?.title ||
      getHospitalNameFromObject(
        appointment
      ) ||
      getHospitalNameFromObject(
        doctor
      ) ||
      "Hospital";

    const doctorObject =
      appointment.doctor &&
      typeof appointment.doctor ===
        "object"
        ? appointment.doctor
        : doctor || {};

    const doctorName =
      doctorObject.name ||
      appointment.doctorName ||
      appointment.doctor_name ||
      doctor?.name ||
      "-";

    const departmentName =
      appointment.department ||
      appointment.departmentName ||
      appointment.specialization ||
      doctorObject.department ||
      doctorObject.specialization ||
      doctor?.department ||
      doctor?.specialization ||
      "-";

    const roomNumber =
      appointment.roomNo ||
      appointment.roomNumber ||
      appointment.room ||
      doctorObject.roomNo ||
      doctorObject.roomNumber ||
      doctorObject.room ||
      doctor?.roomNo ||
      doctor?.roomNumber ||
      doctor?.room ||
      "-";

    const finalDisease =
      appointment.disease ||
      appointment.problem ||
      appointment.reason ||
      appointment.complaint ||
      enteredDisease ||
      "Not specified";

    const patientObject =
      appointment.patient &&
      typeof appointment.patient ===
        "object"
        ? appointment.patient
        : {};

    const patientSnapshot =
      appointment.patientSnapshot &&
      typeof appointment.patientSnapshot ===
        "object"
        ? appointment.patientSnapshot
        : {};

    const patientName =
      patientSnapshot.name ||
      patientSnapshot.patientName ||
      patientObject.name ||
      appointment.patientName ||
      profile.name ||
      profile.patientName ||
      localStorage.getItem(
        "patientName"
      ) ||
      "Patient";

    const patientAadhaar =
      patientSnapshot.adhar_no ||
      patientSnapshot.aadhaar ||
      patientSnapshot.aadhaarNumber ||
      patientObject.adhar_no ||
      patientObject.aadhaar ||
      patientObject.aadhaarNumber ||
      appointment.adhar_no ||
      appointment.aadhaar ||
      appointment.patientAadhaar ||
      profile.adhar_no ||
      profile.aadhaar ||
      profile.aadhaarNumber ||
      profile.aadhaar_no ||
      "-";

    const patientAge =
      patientSnapshot.age ||
      patientObject.age ||
      appointment.patientAge ||
      profile.age ||
      "-";

    const patientGender =
      patientSnapshot.gender ||
      patientObject.gender ||
      appointment.patientGender ||
      profile.gender ||
      "-";

    const patientPhone =
      patientSnapshot.phone ||
      patientSnapshot.mobile ||
      patientObject.phone ||
      patientObject.mobile ||
      appointment.patientPhone ||
      appointment.phone ||
      profile.phone ||
      profile.mobile ||
      "-";

    const tokenNumber =
      appointment.tokenNumber ??
      appointment.token ??
      appointment.token_no ??
      appointment.queueToken ??
      appointment.queueNumber ??
      "-";

    const appointmentDate =
      appointment.date ||
      appointment.appointmentDate ||
      appointment.appointment_date ||
      null;

    const appointmentTime =
      appointment.time ||
      appointment.appointmentTime ||
      appointment.appointment_time ||
      null;

    return {
      ...appointment,

      doctor: doctorObject,
      doctorName,

      hospital:
        hospitalObject || hospitalName,

      hospitalName,

      department:
        departmentName,

      departmentName,

      roomNo:
        roomNumber,

      roomNumber,

      disease:
        finalDisease,

      problem:
        finalDisease,

      tokenNumber,

      patient: {
        ...patientObject,
        name: patientName,
        adhar_no: patientAadhaar,
        age: patientAge,
        gender: patientGender,
        phone: patientPhone,
      },

      patientSnapshot: {
        ...patientSnapshot,
        name: patientName,
        adhar_no: patientAadhaar,
        age: patientAge,
        gender: patientGender,
        phone: patientPhone,
      },

      patientName,
      patientAadhaar,
      patientAge,
      patientGender,
      patientPhone,

      date:
        appointmentDate,

      time:
        appointmentTime,
    };
  };

  const bookAppointment = async () => {
    if (!selected) return;

    const enteredProblem =
      disease.trim();

    if (!enteredProblem) {
      alert(
        "Please enter your problem/disease."
      );
      return;
    }

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

    if (!selected._id) {
      alert(
        "Doctor ID is missing."
      );
      return;
    }

    const hospitalId =
      getHospitalId(selected);

    if (!hospitalId) {
      alert(
        "Hospital ID is missing for this doctor."
      );
      return;
    }

    try {
      setBooking(true);

      const res = await api.post(
        "/appointments",
        {
          doctorId:
            selected._id,

          hospitalId,

          disease:
            enteredProblem,

          problem:
            enteredProblem,
        },
        {
          headers: {
            Authorization:
              `Bearer ${patientToken}`,

            "Content-Type":
              "application/json",
          },
        }
      );

      if (
        res.data?.success === false
      ) {
        alert(
          res.data?.message ||
            "Unable to book appointment."
        );
        return;
      }

      let backendAppointment = null;

      if (res.data?.appointment) {
        backendAppointment =
          res.data.appointment;
      } else if (
        res.data?.data?.appointment
      ) {
        backendAppointment =
          res.data.data.appointment;
      } else if (res.data?.data) {
        backendAppointment =
          res.data.data;
      } else {
        backendAppointment =
          res.data;
      }

      const completeAppointment =
        createCompleteAppointment(
          backendAppointment,
          selected,
          enteredProblem
        );

      console.log(
        "COMPLETE APPOINTMENT:",
        completeAppointment
      );

      setBooked(
        completeAppointment
      );

      setSelected(null);
      setDisease("");

      setTimeout(() => {
        document
          .getElementById(
            "appointment-slip"
          )
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 150);

    } catch (err) {
      console.error(
        "BOOK APPOINTMENT ERROR:",
        err
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

  const clearFilters = () => {
    setQuery("");
    setDepartment("");
    setHospital("");
  };

  const getInitials = (
    name = ""
  ) => {
    return name
      .replace(/^Dr\.\s*/i, "")
      .split(" ")
      .filter(Boolean)
      .map(
        (word) => word[0]
      )
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const getPatientSnapshot = () => {
    return (
      booked?.patientSnapshot ||
      booked?.patient ||
      {}
    );
  };

  const getPatientName = () => {
    const snapshot =
      getPatientSnapshot();

    const profile =
      getLocalProfile();

    return (
      snapshot.name ||
      snapshot.patientName ||
      booked?.patientName ||
      booked?.patient?.name ||
      booked?.patientSnapshot?.name ||
      profile.name ||
      profile.patientName ||
      localStorage.getItem(
        "patientName"
      ) ||
      "Patient"
    );
  };

  const getPatientAadhaar = () => {
    const snapshot =
      getPatientSnapshot();

    const profile =
      getLocalProfile();

    return (
      snapshot.adhar_no ||
      snapshot.aadhaar ||
      snapshot.aadhaarNumber ||
      snapshot.aadhaar_no ||
      booked?.patientAadhaar ||
      booked?.patient?.adhar_no ||
      booked?.patient?.aadhaar ||
      profile.adhar_no ||
      profile.aadhaar ||
      profile.aadhaarNumber ||
      profile.aadhaar_no ||
      "-"
    );
  };

  const getPatientAge = () => {
    const snapshot =
      getPatientSnapshot();

    const profile =
      getLocalProfile();

    return (
      snapshot.age ||
      booked?.patientAge ||
      booked?.patient?.age ||
      profile.age ||
      "-"
    );
  };

  const getPatientGender = () => {
    const snapshot =
      getPatientSnapshot();

    const profile =
      getLocalProfile();

    return (
      snapshot.gender ||
      booked?.patientGender ||
      booked?.patient?.gender ||
      profile.gender ||
      "-"
    );
  };

  const getPatientPhone = () => {
    const snapshot =
      getPatientSnapshot();

    const profile =
      getLocalProfile();

    return (
      snapshot.phone ||
      snapshot.mobile ||
      booked?.patientPhone ||
      booked?.patient?.phone ||
      booked?.patient?.mobile ||
      profile.phone ||
      profile.mobile ||
      "-"
    );
  };

  const getTokenNumber = () => {
    return (
      booked?.tokenNumber ??
      booked?.token ??
      booked?.token_no ??
      booked?.queueToken ??
      booked?.queueNumber ??
      "-"
    );
  };

  const getDoctorName = () => {
    return (
      booked?.doctor?.name ||
      booked?.doctorName ||
      booked?.doctor_name ||
      "-"
    );
  };

  const getRoomNumber = () => {
    return (
      booked?.roomNo ||
      booked?.roomNumber ||
      booked?.room ||
      booked?.doctor?.roomNo ||
      booked?.doctor?.roomNumber ||
      booked?.doctor?.room ||
      "-"
    );
  };

  const getHospitalName = () => {
    return (
      booked?.hospital?.name ||
      booked?.hospital?.hospitalName ||
      booked?.hospital?.title ||
      (typeof booked?.hospital ===
      "string"
        ? booked.hospital
        : "") ||
      booked?.hospitalName ||
      "Hospital"
    );
  };

  const getDepartmentName = () => {
    return (
      booked?.department ||
      booked?.departmentName ||
      booked?.specialization ||
      booked?.doctor?.department ||
      booked?.doctor?.specialization ||
      "-"
    );
  };

  const getDisease = () => {
    return (
      booked?.disease ||
      booked?.problem ||
      booked?.reason ||
      booked?.complaint ||
      "Not specified"
    );
  };

  const formatDate = (
    value
  ) => {
    if (!value) {
      return new Date().toLocaleDateString(
        "en-IN"
      );
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return String(value);
    }

    return date.toLocaleDateString(
      "en-IN"
    );
  };

  const formatTime = (
    value
  ) => {
    if (!value) {
      return new Date().toLocaleTimeString(
        "en-IN",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return String(value);
    }

    return date.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const getAppointmentDate = () => {
    if (
      booked?.date ||
      booked?.appointmentDate ||
      booked?.appointment_date
    ) {
      return formatDate(
        booked.date ||
          booked.appointmentDate ||
          booked.appointment_date
      );
    }

    if (booked?.createdAt) {
      return formatDate(
        booked.createdAt
      );
    }

    return formatDate();
  };

  const getAppointmentTime = () => {
    if (
      booked?.time ||
      booked?.appointmentTime ||
      booked?.appointment_time
    ) {
      return formatTime(
        booked.time ||
          booked.appointmentTime ||
          booked.appointment_time
      );
    }

    if (booked?.createdAt) {
      return formatTime(
        booked.createdAt
      );
    }

    return formatTime();
  };

  const escapeHTML = (
    value
  ) => {
    return String(
      value ?? ""
    )
      .replace(
        /&/g,
        "&amp;"
      )
      .replace(
        /</g,
        "&lt;"
      )
      .replace(
        />/g,
        "&gt;"
      )
      .replace(
        /"/g,
        "&quot;"
      )
      .replace(
        /'/g,
        "&#039;"
      );
  };

  const printSlip = () => {
    if (!booked) return;

    const printWindow =
      window.open(
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
<meta charset="UTF-8" />
<title>Swasth QR Appointment Slip</title>

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
  width: 420px;
  margin: 0 auto;
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
  margin-top: 5px;
  font-size: 13px;
  color: #2563eb;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.token-box {
  margin: 18px 0;
  padding: 16px;
  text-align: center;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 12px;
}

.token-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 700;
}

.token {
  margin-top: 4px;
  font-size: 42px;
  color: #2563eb;
  font-weight: 800;
}

.status {
  display: inline-block;
  margin-top: 8px;
  padding: 5px 10px;
  border-radius: 999px;
  background: #dcfce7;
  color: #15803d;
  font-size: 11px;
  font-weight: 700;
}

.section {
  margin-top: 18px;
}

.section-title {
  padding-bottom: 7px;
  margin-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 13px;
  font-weight: 700;
}

.row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 5px 0;
  font-size: 13px;
}

.label {
  color: #64748b;
}

.value {
  max-width: 250px;
  text-align: right;
  font-weight: 600;
  word-break: break-word;
}

.footer {
  margin-top: 18px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
  text-align: center;
  color: #64748b;
  font-size: 11px;
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
        getHospitalName()
      )}
    </div>

    <div class="title">
      Swasth QR Appointment Slip
    </div>
  </div>

  <div class="token-box">

    <div class="token-label">
      TOKEN NUMBER
    </div>

    <div class="token">
      #${escapeHTML(
        String(
          getTokenNumber()
        )
      )}
    </div>

    <div class="status">
      ● Waiting
    </div>

  </div>

  <div class="section">

    <div class="section-title">
      Patient Details
    </div>

    <div class="row">
      <span class="label">Name</span>
      <span class="value">
        ${escapeHTML(
          getPatientName()
        )}
      </span>
    </div>

    <div class="row">
      <span class="label">Aadhaar</span>
      <span class="value">
        ${escapeHTML(
          getPatientAadhaar()
        )}
      </span>
    </div>

    <div class="row">
      <span class="label">Age</span>
      <span class="value">
        ${escapeHTML(
          getPatientAge()
        )}
      </span>
    </div>

    <div class="row">
      <span class="label">Gender</span>
      <span class="value">
        ${escapeHTML(
          getPatientGender()
        )}
      </span>
    </div>

    <div class="row">
      <span class="label">Phone</span>
      <span class="value">
        ${escapeHTML(
          getPatientPhone()
        )}
      </span>
    </div>

  </div>

  <div class="section">

    <div class="section-title">
      Appointment Details
    </div>

    <div class="row">
      <span class="label">Hospital</span>
      <span class="value">
        ${escapeHTML(
          getHospitalName()
        )}
      </span>
    </div>

    <div class="row">
      <span class="label">Department</span>
      <span class="value">
        ${escapeHTML(
          getDepartmentName()
        )}
      </span>
    </div>

    <div class="row">
      <span class="label">Doctor</span>
      <span class="value">
        ${escapeHTML(
          getDoctorName()
        )}
      </span>
    </div>

    <div class="row">
      <span class="label">Room</span>
      <span class="value">
        ${escapeHTML(
          getRoomNumber()
        )}
      </span>
    </div>

    <div class="row">
      <span class="label">Problem</span>
      <span class="value">
        ${escapeHTML(
          getDisease()
        )}
      </span>
    </div>

    <div class="row">
      <span class="label">Date</span>
      <span class="value">
        ${escapeHTML(
          getAppointmentDate()
        )}
      </span>
    </div>

    <div class="row">
      <span class="label">Time</span>
      <span class="value">
        ${escapeHTML(
          getAppointmentTime()
        )}
      </span>
    </div>

    <div class="row">
      <span class="label">Status</span>
      <span
        class="value"
        style="color:#16a34a;"
      >
        Waiting
      </span>
    </div>

  </div>

  <div class="footer">
    Please keep this slip for your appointment
    and queue tracking.
    <br /><br />
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

  const downloadSlip = () => {
    if (!booked) return;

    const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />

<title>
Swasth QR Slip - Token ${escapeHTML(
      String(
        getTokenNumber()
      )
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
  width: 420px;
  margin: auto;
  padding: 22px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 14px;
}

.header {
  padding-bottom: 14px;
  text-align: center;
  border-bottom: 1px solid #e5e7eb;
}

.hospital {
  font-size: 20px;
  font-weight: 700;
}

.title {
  margin-top: 5px;
  color: #2563eb;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
}

.token-box {
  margin: 18px 0;
  padding: 16px;
  text-align: center;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 12px;
}

.token-label {
  color: #6b7280;
  font-size: 12px;
  font-weight: 700;
}

.token {
  margin-top: 4px;
  color: #2563eb;
  font-size: 42px;
  font-weight: 800;
}

.status {
  display: inline-block;
  margin-top: 8px;
  padding: 5px 10px;
  background: #dcfce7;
  color: #15803d;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}

.section {
  margin-top: 18px;
}

.section-title {
  padding-bottom: 7px;
  margin-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 13px;
  font-weight: 700;
}

.row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 5px 0;
  font-size: 13px;
}

.label {
  color: #64748b;
}

.value {
  max-width: 250px;
  text-align: right;
  font-weight: 600;
  word-break: break-word;
}

.footer {
  margin-top: 18px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
  text-align: center;
  color: #64748b;
  font-size: 11px;
}

</style>
</head>

<body>

<div class="slip">

  <div class="header">

    <div class="hospital">
      ${escapeHTML(
        getHospitalName()
      )}
    </div>

    <div class="title">
      Swasth QR Appointment Slip
    </div>

  </div>

  <div class="token-box">

    <div class="token-label">
      TOKEN NUMBER
    </div>

    <div class="token">
      #${escapeHTML(
        String(
          getTokenNumber()
        )
      )}
    </div>

    <div class="status">
      ● Waiting
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
          getPatientName()
        )}
      </span>
    </div>

    <div class="row">
      <span class="label">
        Aadhaar
      </span>

      <span class="value">
        ${escapeHTML(
          getPatientAadhaar()
        )}
      </span>
    </div>

    <div class="row">
      <span class="label">
        Age
      </span>

      <span class="value">
        ${escapeHTML(
          getPatientAge()
        )}
      </span>
    </div>

    <div class="row">
      <span class="label">
        Gender
      </span>

      <span class="value">
        ${escapeHTML(
          getPatientGender()
        )}
      </span>
    </div>

    <div class="row">
      <span class="label">
        Phone
      </span>

      <span class="value">
        ${escapeHTML(
          getPatientPhone()
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
        Hospital
      </span>

      <span class="value">
        ${escapeHTML(
          getHospitalName()
        )}
      </span>
    </div>

    <div class="row">
      <span class="label">
        Department
      </span>

      <span class="value">
        ${escapeHTML(
          getDepartmentName()
        )}
      </span>
    </div>

    <div class="row">
      <span class="label">
        Doctor
      </span>

      <span class="value">
        ${escapeHTML(
          getDoctorName()
        )}
      </span>
    </div>

    <div class="row">
      <span class="label">
        Room
      </span>

      <span class="value">
        ${escapeHTML(
          getRoomNumber()
        )}
      </span>
    </div>

    <div class="row">
      <span class="label">
        Problem
      </span>

      <span class="value">
        ${escapeHTML(
          getDisease()
        )}
      </span>
    </div>

    <div class="row">
      <span class="label">
        Date
      </span>

      <span class="value">
        ${escapeHTML(
          getAppointmentDate()
        )}
      </span>
    </div>

    <div class="row">
      <span class="label">
        Time
      </span>

      <span class="value">
        ${escapeHTML(
          getAppointmentTime()
        )}
      </span>
    </div>

    <div class="row">
      <span class="label">
        Status
      </span>

      <span
        class="value"
        style="color:#16a34a;"
      >
        Waiting
      </span>
    </div>

  </div>

  <div class="footer">

    Generated by Swasth QR

    <br /><br />

    Please keep this slip for queue tracking.

  </div>

</div>

</body>
</html>
`;

    const blob =
      new Blob(
        [html],
        {
          type:
            "text/html;charset=utf-8",
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href = url;

    link.download =
      `Swasth-QR-Slip-Token-${getTokenNumber()}.html`;

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );

    URL.revokeObjectURL(
      url
    );
  };

  return (
    <main className="min-h-screen bg-[#f6f9fc] text-slate-900">

      <section className="px-4 pb-10 pt-6 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-7xl">

          <div className="relative overflow-hidden rounded-[28px] bg-[#0757c9] px-6 py-10 shadow-xl sm:px-10 sm:py-14 lg:px-14">

            <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10" />

            <div className="absolute -bottom-32 right-28 h-80 w-80 rounded-full bg-white/5" />

            <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-white/5" />

            <div className="relative grid items-center gap-10 lg:grid-cols-[1.25fr_.75fr]">

              <div className="max-w-3xl">

                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur">

                  <span className="h-2 w-2 animate-pulse rounded-full bg-green-300" />

                  SMART OPD MANAGEMENT

                </div>

                <h1 className="text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">

                  Healthcare,

                  <br />

                  <span className="text-blue-100">
                    without the waiting.
                  </span>

                </h1>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base">

                  Find doctors, book your OPD token and
                  track your queue in real time — all from
                  one simple platform.

                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">

                  <Link
                    to="/kiosk"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#0757c9] shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50"
                  >
                    <span>⌖</span>
                    Hospital Kiosk
                  </Link>

                  <Link
                    to="/patient"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
                  >
                    Track My Queue
                    <span>→</span>
                  </Link>

                </div>

              </div>

              <div className="hidden lg:block">

                <div className="rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur-md">

                  <div className="mb-4 flex items-center justify-between">

                    <div>

                      <p className="text-xs font-medium text-blue-100">
                        SWASTH QR
                      </p>

                      <p className="mt-1 text-lg font-bold text-white">
                        OPD at a glance
                      </p>

                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-xl">
                      🏥
                    </div>

                  </div>

                  <div className="space-y-3">

                    <div className="rounded-2xl bg-white p-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                          ✓
                        </div>

                        <div>

                          <p className="text-sm font-bold text-slate-900">
                            Doctor availability
                          </p>

                          <p className="text-xs text-slate-500">
                            Check active doctors
                          </p>

                        </div>

                      </div>

                    </div>

                    <div className="rounded-2xl bg-white p-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          #
                        </div>

                        <div>

                          <p className="text-sm font-bold text-slate-900">
                            Live token tracking
                          </p>

                          <p className="text-xs text-slate-500">
                            Know your queue position
                          </p>

                        </div>

                      </div>

                    </div>

                    <div className="rounded-2xl bg-white p-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                          QR
                        </div>

                        <div>

                          <p className="text-sm font-bold text-slate-900">
                            Quick check-in
                          </p>

                          <p className="text-xs text-slate-500">
                            Simple hospital workflow
                          </p>

                        </div>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      <section className="px-4 sm:px-6 lg:px-8">

        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 sm:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

            <p className="text-2xl font-black text-[#0757c9]">
              {doctors.length}
            </p>

            <p className="mt-1 text-xs font-medium text-slate-500">
              Doctors listed
            </p>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

            <p className="text-2xl font-black text-[#0757c9]">
              {hospitals.length}
            </p>

            <p className="mt-1 text-xs font-medium text-slate-500">
              Hospitals
            </p>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

            <p className="text-2xl font-black text-[#0757c9]">
              {departments.length}
            </p>

            <p className="mt-1 text-xs font-medium text-slate-500">
              Departments
            </p>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

            <p className="text-2xl font-black text-green-600">
              LIVE
            </p>

            <p className="mt-1 text-xs font-medium text-slate-500">
              OPD monitoring
            </p>

          </div>

        </div>

      </section>

      {booked && (

        <section
          id="appointment-slip"
          className="px-4 pt-8 sm:px-6 lg:px-8"
        >

          <div className="mx-auto max-w-7xl">

            <div className="overflow-hidden rounded-3xl border border-green-200 bg-white shadow-lg">

              <div className="border-b border-green-100 bg-green-50 px-5 py-5 sm:px-7">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex items-center gap-3">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-xl text-green-700">
                      ✓
                    </div>

                    <div>

                      <span className="rounded-full bg-green-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-green-700">
                        Appointment Confirmed
                      </span>

                      <h2 className="mt-2 text-xl font-black text-slate-900">
                        Your appointment is booked
                      </h2>

                    </div>

                  </div>

                  <div className="text-left sm:text-right">

                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Token Number
                    </p>

                    <p className="text-3xl font-black text-[#0757c9]">
                      #{getTokenNumber()}
                    </p>

                  </div>

                </div>

              </div>

              <div className="p-4 sm:p-8">

                <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-7">

                  <div className="border-b border-slate-200 pb-5 text-center">

                    <h3 className="text-xl font-black text-slate-900">
                      {getHospitalName()}
                    </h3>

                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.15em] text-[#0757c9]">
                      Swasth QR Appointment Slip
                    </p>

                  </div>

                  <div className="my-5 rounded-2xl border border-blue-100 bg-blue-50 p-5 text-center">

                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Token Number
                    </p>

                    <p className="mt-1 text-5xl font-black text-[#0757c9]">
                      #{getTokenNumber()}
                    </p>

                    <span className="mt-2 inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                      ● Waiting
                    </span>

                  </div>

                  <div className="mb-6">

                    <h4 className="mb-3 border-b border-slate-200 pb-2 text-sm font-black text-slate-800">
                      Patient Details
                    </h4>

                    <div className="space-y-2 text-sm">

                      <div className="flex justify-between gap-4">
                        <span className="text-slate-500">
                          Name
                        </span>

                        <span className="text-right font-semibold text-slate-800">
                          {getPatientName()}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-slate-500">
                          Aadhaar
                        </span>

                        <span className="text-right font-semibold text-slate-800">
                          {getPatientAadhaar()}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-slate-500">
                          Age
                        </span>

                        <span className="font-semibold text-slate-800">
                          {getPatientAge()}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-slate-500">
                          Gender
                        </span>

                        <span className="font-semibold text-slate-800">
                          {getPatientGender()}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-slate-500">
                          Phone
                        </span>

                        <span className="font-semibold text-slate-800">
                          {getPatientPhone()}
                        </span>
                      </div>

                    </div>

                  </div>

                  <div>

                    <h4 className="mb-3 border-b border-slate-200 pb-2 text-sm font-black text-slate-800">
                      Appointment Details
                    </h4>

                    <div className="space-y-2 text-sm">

                      <div className="flex justify-between gap-4">
                        <span className="shrink-0 text-slate-500">
                          Hospital
                        </span>

                        <span className="max-w-[70%] text-right font-semibold text-slate-800">
                          {getHospitalName()}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="shrink-0 text-slate-500">
                          Department
                        </span>

                        <span className="max-w-[70%] text-right font-semibold text-slate-800">
                          {getDepartmentName()}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="shrink-0 text-slate-500">
                          Doctor
                        </span>

                        <span className="max-w-[70%] text-right font-semibold text-slate-800">
                          {getDoctorName()}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-slate-500">
                          Room
                        </span>

                        <span className="font-semibold text-slate-800">
                          {getRoomNumber()}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="shrink-0 text-slate-500">
                          Problem
                        </span>

                        <span className="max-w-[70%] text-right font-semibold text-slate-800">
                          {getDisease()}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-slate-500">
                          Date
                        </span>

                        <span className="font-semibold text-slate-800">
                          {getAppointmentDate()}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-slate-500">
                          Time
                        </span>

                        <span className="font-semibold text-slate-800">
                          {getAppointmentTime()}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-slate-500">
                          Status
                        </span>

                        <span className="font-bold text-green-600">
                          Waiting
                        </span>
                      </div>

                    </div>

                  </div>

                  <div className="mt-6 border-t border-slate-200 pt-4 text-center">

                    <p className="text-xs text-slate-400">
                      Please keep this slip for your appointment and queue tracking.
                    </p>

                    <p className="mt-1 text-[11px] font-semibold text-slate-400">
                      Generated by Swasth QR
                    </p>

                  </div>

                </div>

                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">

                  <button
                    type="button"
                    onClick={printSlip}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0757c9] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#064aa9]"
                  >
                    🖨 Print Slip
                  </button>

                  <button
                    type="button"
                    onClick={downloadSlip}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    ⬇ Download Slip
                  </button>

                  <Link
                    to="/patient"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    Track Queue →
                  </Link>

                </div>

                <div className="mt-4 text-center">

                  <button
                    type="button"
                    onClick={() => {
                      setBooked(null);

                      window.scrollTo({
                        top: 0,
                        behavior: "smooth",
                      });
                    }}
                    className="text-sm font-semibold text-slate-500 hover:text-[#0757c9]"
                  >
                    + Book another appointment
                  </button>

                </div>

              </div>

            </div>

          </div>

        </section>

      )}

      <section className="px-4 pb-14 pt-10 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-7xl">

          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <div className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-[#0757c9]">
                OPD Directory
              </div>

              <h2 className="text-3xl font-black tracking-tight text-slate-900">
                Find your doctor
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Search doctors by name, department or hospital.
              </p>

            </div>

            {!loading && (
              <div className="text-sm font-semibold text-slate-500">
                {filteredDoctors.length} doctor
                {filteredDoctors.length !== 1
                  ? "s"
                  : ""}{" "}
                available
              </div>
            )}

          </div>

          <div className="mb-7 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">

            <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_auto]">

              <div className="relative">

                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  ⌕
                </span>

                <input
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  value={query}
                  onChange={(e) =>
                    setQuery(
                      e.target.value
                    )
                  }
                  placeholder="Search doctor, hospital..."
                />

              </div>

              <select
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
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

              <select
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                value={hospital}
                onChange={(e) =>
                  setHospital(
                    e.target.value
                  )
                }
              >

                <option value="">
                  All Hospitals
                </option>

                {hospitals.map(
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

              {(query ||
                department ||
                hospital) && (

                <button
                  type="button"
                  onClick={
                    clearFilters
                  }
                  className="h-12 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  Clear
                </button>

              )}

            </div>

          </div>

          {error && (

            <div className="mb-6 flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">

              <span>
                {error}
              </span>

              <button
                onClick={
                  fetchDoctors
                }
                className="font-bold underline"
              >
                Retry
              </button>

            </div>

          )}

          {loading ? (

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

              {[
                1,
                2,
                3,
                4,
                5,
                6,
              ].map(
                (item) => (

                  <div
                    key={item}
                    className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white"
                  />

                )
              )}

            </div>

          ) : filteredDoctors.length ===
            0 ? (

            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                🔎
              </div>

              <h3 className="mt-5 text-xl font-black text-slate-900">
                No doctors found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Try another doctor name, department or hospital.
              </p>

              <button
                onClick={
                  clearFilters
                }
                className="mt-5 rounded-xl bg-[#0757c9] px-5 py-2.5 text-sm font-bold text-white"
              >
                Reset Filters
              </button>

            </div>

          ) : (

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

              {filteredDoctors.map(
                (doctor) => {

                  const active =
                    doctor.active !==
                    false;

                  const hospitalId =
                    getHospitalId(
                      doctor
                    );

                  const hospitalName =
                    getHospitalNameFromObject(
                      doctor
                    ) ||
                    "Hospital";

                  const room =
                    doctor.roomNumber ||
                    doctor.room ||
                    doctor.roomNo ||
                    "-";

                  const from =
                    doctor.availableTime
                      ?.from ||
                    "-";

                  const to =
                    doctor.availableTime
                      ?.to ||
                    "-";

                  const doctorName =
                    doctor.name ||
                    "Doctor";

                  return (

                    <article
                      key={
                        doctor._id
                      }
                      className="group relative flex h-full flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-[0_18px_45px_rgba(15,23,42,0.12)]"
                    >

                      <div
                        className={`h-1.5 w-full ${
                          active
                            ? "bg-green-500"
                            : "bg-slate-300"
                        }`}
                      />

                      <div className="flex flex-1 flex-col p-5 sm:p-6">

                        <div className="flex items-start justify-between gap-3">

                          <div className="flex min-w-0 items-center gap-4">

                            <div className="relative shrink-0">

                              <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-gradient-to-br from-blue-50 to-blue-100 text-xl font-black text-[#0757c9] ring-1 ring-blue-100">
                                {getInitials(
                                  doctorName
                                )}
                              </div>

                              {active && (
                                <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-green-500">
                                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                                </span>
                              )}

                            </div>

                            <div className="min-w-0">

                              <h3 className="truncate text-[17px] font-black tracking-tight text-slate-900">
                                {doctorName}
                              </h3>

                              <p className="mt-1 truncate text-sm font-semibold text-[#0757c9]">
                                {doctor.specialization ||
                                  doctor.department ||
                                  "Medical Specialist"}
                              </p>

                              <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                OPD Specialist
                              </p>

                            </div>

                          </div>

                          <span
                            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-extrabold ${
                              active
                                ? "border-green-200 bg-green-50 text-green-700"
                                : "border-slate-200 bg-slate-50 text-slate-500"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                active
                                  ? "bg-green-500"
                                  : "bg-slate-400"
                              }`}
                            />

                            {active
                              ? "Active"
                              : "Offline"}
                          </span>

                        </div>

                        <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">

                          <div className="flex items-start gap-3">

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-base shadow-sm">
                              🏥
                            </div>

                            <div className="min-w-0">

                              <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                                Hospital
                              </p>

                              <p className="mt-1 truncate text-sm font-bold text-slate-800">
                                {hospitalName}
                              </p>

                            </div>

                          </div>

                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-3">

                          <div className="rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm">

                            <div className="flex items-center gap-2">

                              <span className="text-sm">
                                🚪
                              </span>

                              <p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">
                                Room
                              </p>

                            </div>

                            <p className="mt-2 text-sm font-black text-slate-800">
                              {room}
                            </p>

                          </div>

                          <div className="rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm">

                            <div className="flex items-center gap-2">

                              <span className="text-sm">
                                🕘
                              </span>

                              <p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">
                                OPD Time
                              </p>

                            </div>

                            <p className="mt-2 truncate text-sm font-black text-slate-800">
                              {from} – {to}
                            </p>

                          </div>

                        </div>

                        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">

                          <div>

                            <p
                              className={`text-xs font-extrabold ${
                                active
                                  ? "text-green-600"
                                  : "text-slate-400"
                              }`}
                            >
                              {active
                                ? "Available for Appointment"
                                : "Currently Unavailable"}
                            </p>

                            {active && (
                              <p className="mt-1 text-[11px] text-slate-400">
                                Book your OPD visit
                              </p>
                            )}

                          </div>

                          {doctor.queueCount !=
                            null && (

                            <div className="rounded-xl bg-blue-50 px-3 py-2 text-right">

                              <p className="text-base font-black text-[#0757c9]">
                                {
                                  doctor.queueCount
                                }
                              </p>

                              <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                                In Queue
                              </p>

                            </div>

                          )}

                        </div>

                        <button
                          type="button"
                          disabled={
                            !active ||
                            !hospitalId
                          }
                          onClick={() => {
                            setSelected(
                              doctor
                            );

                            setDisease(
                              ""
                            );
                          }}
                          className={`mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-extrabold transition-all duration-200 ${
                            active &&
                            hospitalId
                              ? "bg-[#0757c9] text-white shadow-lg shadow-blue-100 hover:-translate-y-0.5 hover:bg-[#064aa9] hover:shadow-xl"
                              : "cursor-not-allowed bg-slate-100 text-slate-400"
                          }`}
                        >

                          {!hospitalId
                            ? "Hospital unavailable"
                            : active
                            ? "Book Appointment"
                            : "Currently Unavailable"}

                          {active &&
                            hospitalId && (
                              <span className="text-base">
                                →
                              </span>
                            )}

                        </button>

                      </div>

                    </article>

                  );
                }
              )}

            </div>

          )}

        </div>

      </section>

      <section className="border-t border-slate-200 bg-white px-4 py-14 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-7xl">

          <div className="mx-auto mb-10 max-w-2xl text-center">

            <div className="text-xs font-bold uppercase tracking-[0.15em] text-[#0757c9]">
              Simple workflow
            </div>

            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
              Your OPD journey, simplified
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              From finding a doctor to reaching your consultation,
              Swasth QR keeps the process simple.
            </p>

          </div>

          <div className="grid gap-5 md:grid-cols-3">

            <div className="rounded-2xl border border-slate-200 bg-[#f8fbff] p-6">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 font-black text-[#0757c9]">
                01
              </div>

              <h3 className="mt-5 text-lg font-black">
                Find a doctor
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Search by doctor, department or hospital and
                check current availability.
              </p>

            </div>

            <div className="rounded-2xl border border-slate-200 bg-[#f8fbff] p-6">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 font-black text-[#0757c9]">
                02
              </div>

              <h3 className="mt-5 text-lg font-black">
                Get your token
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Enter your problem and confirm your appointment
                to receive your OPD token.
              </p>

            </div>

            <div className="rounded-2xl border border-slate-200 bg-[#f8fbff] p-6">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 font-black text-[#0757c9]">
                03
              </div>

              <h3 className="mt-5 text-lg font-black">
                Track your queue
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                See your current token, patients ahead and
                queue progress from your dashboard.
              </p>

            </div>

          </div>

        </div>

      </section>

      {selected && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={() => {
            if (!booking) {
              setSelected(null);
              setDisease("");
            }
          }}
        >

          <div
            className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="border-b border-slate-100 p-5 sm:p-6">

              <div className="flex items-start justify-between gap-4">

                <div className="flex items-center gap-3">

                  <div className="relative">

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 font-black text-[#0757c9]">
                      {getInitials(
                        selected.name
                      )}
                    </div>

                    {selected.active !==
                      false && (
                      <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500" />
                    )}

                  </div>

                  <div>

                    <p className="text-xs font-bold uppercase tracking-wide text-[#0757c9]">
                      Book Appointment
                    </p>

                    <h2 className="mt-1 text-lg font-black text-slate-900">
                      {selected.name}
                    </h2>

                    <p className="text-sm text-slate-500">
                      {selected.specialization ||
                        selected.department}
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  disabled={booking}
                  onClick={() => {
                    setSelected(
                      null
                    );

                    setDisease("");
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 disabled:opacity-50"
                >
                  ×
                </button>

              </div>

            </div>

            <div className="p-5 sm:p-6">

              <div className="rounded-2xl bg-slate-50 p-4">

                <div className="grid grid-cols-2 gap-4">

                  <div>

                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      Hospital
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-700">
                      {getHospitalNameFromObject(
                        selected
                      ) ||
                        "Hospital"}
                    </p>

                  </div>

                  <div>

                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      Room
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-700">
                      {selected.roomNumber ||
                        selected.roomNo ||
                        selected.room ||
                        "-"}
                    </p>

                  </div>

                </div>

              </div>

              <div className="mt-6">

                <label className="mb-2 block text-sm font-bold text-slate-700">
                  What is your problem?
                </label>

                <textarea
                  rows={4}
                  value={disease}
                  onChange={(e) =>
                    setDisease(
                      e.target.value
                    )
                  }
                  placeholder="Describe your problem or disease..."
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                />

                <p className="mt-2 text-xs text-slate-400">
                  Please provide a short description to help
                  identify the purpose of your visit.
                </p>

              </div>

              <button
                type="button"
                onClick={
                  bookAppointment
                }
                disabled={booking}
                className="mt-5 w-full rounded-2xl bg-[#0757c9] py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-100 transition hover:bg-[#064aa9] disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {booking
                  ? "Confirming appointment..."
                  : "Confirm Appointment →"}
              </button>

              <button
                type="button"
                disabled={booking}
                onClick={() => {
                  setSelected(
                    null
                  );

                  setDisease("");
                }}
                className="mt-2 w-full py-2 text-sm font-semibold text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>

            </div>

          </div>

        </div>

      )}

      {/* <Footer /> */}

    </main>
  );
}