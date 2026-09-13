import React, { useRef } from "react";

const PatientSlip = ({
  patient,
  appointment,
  qrCodeUrl,
  hospitalName,
}) => {
  const slipRef = useRef(null);

  const issueDate = new Date();

  // Valid till = 7 days after issue date
  const validDate = new Date(issueDate);
  validDate.setDate(validDate.getDate() + 7);

  // Appointment snapshot
  const snap = appointment?.patientSnapshot || {};

  const printSlip = () => {
    window.print();
  };

  const downloadSlip = () => {
    const slip = slipRef.current;

    if (!slip) {
      alert("Slip is not ready.");
      return;
    }

    const printWindow = window.open(
      "",
      "_blank",
      "width=800,height=900"
    );

    if (!printWindow) {
      alert(
        "Popup blocked. Please allow popups for this website."
      );
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Hospital Slip</title>

          <style>
            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              padding: 30px;
              background: #f3f4f6;
              font-family: Arial, Helvetica, sans-serif;
            }

            .slip {
              width: 380px;
              margin: 0 auto;
              background: white;
              border: 1px solid #9ca3af;
              border-radius: 12px;
              padding: 16px;
              color: #1f2937;
            }

            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 1px solid #d1d5db;
              padding-bottom: 10px;
              margin-bottom: 12px;
            }

            .hospital-name {
              font-size: 20px;
              font-weight: bold;
              max-width: 230px;
            }

            .qr {
              width: 75px;
              height: 75px;
              object-fit: contain;
            }

            .info {
              font-size: 14px;
              line-height: 1.7;
            }

            .row {
              margin-bottom: 3px;
            }

            .label {
              font-weight: bold;
            }

            .appointment {
              margin-top: 12px;
              padding-top: 10px;
              border-top: 1px solid #e5e7eb;
            }

            .footer {
              margin-top: 15px;
              padding-top: 10px;
              border-top: 1px dashed #9ca3af;
              text-align: center;
              font-size: 11px;
              color: #6b7280;
            }

            @media print {
              body {
                padding: 0;
                background: white;
              }

              .slip {
                width: 380px;
                margin: 0;
                box-shadow: none;
              }
            }
          </style>
        </head>

        <body>
          ${slip.outerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();

    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();

        // Browser print dialog:
        // User can select "Save as PDF"
        printWindow.print();

        setTimeout(() => {
          printWindow.close();
        }, 500);
      }, 300);
    };
  };

  return (
    <div className="flex flex-col items-center gap-4 mt-6">

      {/* =========================
          SLIP
      ========================= */}
      <div
        ref={slipRef}
        className="w-[380px] border border-gray-400 rounded-xl bg-white shadow-md p-4 text-sm text-gray-800"
      >

        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-3">

          <div className="max-w-[230px]">
            <h1 className="text-xl font-bold text-gray-800">
              {hospitalName || "Hospital"}
            </h1>

            <p className="text-xs text-gray-500 mt-1">
              Swasth QR Appointment Slip
            </p>
          </div>

          {qrCodeUrl && (
            <img
              src={qrCodeUrl}
              alt="Patient QR"
              className="w-[75px] h-[75px] object-contain"
            />
          )}

        </div>

        {/* Patient Information */}
        <div className="space-y-1 text-gray-700">

          <p>
            <span className="font-semibold">
              Name:
            </span>{" "}
            {patient?.name || "-"}
          </p>

          <p>
            <span className="font-semibold">
              Father Name:
            </span>{" "}
            {patient?.fatherName || "-"}
          </p>

          <p>
            <span className="font-semibold">
              Aadhaar No:
            </span>{" "}
            {patient?.adhar_no || "-"}
          </p>

          <p>
            <span className="font-semibold">
              Age:
            </span>{" "}
            {patient?.age || "-"}
          </p>

          <p>
            <span className="font-semibold">
              Gender:
            </span>{" "}
            {patient?.gender || "-"}
          </p>

          <p>
            <span className="font-semibold">
              Phone:
            </span>{" "}
            {patient?.phone || "-"}
          </p>

          <p>
            <span className="font-semibold">
              Address:
            </span>{" "}
            {typeof patient?.address === "object"
              ? [
                  patient.address?.city,
                  patient.address?.district,
                  patient.address?.state,
                  patient.address?.pincode,
                ]
                  .filter(Boolean)
                  .join(", ")
              : patient?.address || "-"}
          </p>

        </div>

        {/* Appointment Information */}
        {appointment && (
          <div className="mt-4 pt-3 border-t border-gray-200 space-y-1">

            <h2 className="font-bold text-gray-800 mb-2">
              Appointment Details
            </h2>

            <p>
              <span className="font-semibold">
                Department:
              </span>{" "}
              {snap.department ||
                patient?.department ||
                "-"}
            </p>

            <p>
              <span className="font-semibold">
                Doctor:
              </span>{" "}
              {snap.doctor ||
                patient?.doctor ||
                "-"}
            </p>

            <p>
              <span className="font-semibold">
                Room:
              </span>{" "}
              {snap.roomNo ||
                patient?.room ||
                "-"}
            </p>

            <p>
              <span className="font-semibold">
                Diagnosis:
              </span>{" "}
              {snap.disease ||
                patient?.diagnosis ||
                "-"}
            </p>

            <p>
              <span className="font-semibold">
                Token No:
              </span>{" "}
              {snap.tokenNumber || "-"}
            </p>

            <p>
              <span className="font-semibold">
                Status:
              </span>{" "}
              {snap.status || "Waiting"}
            </p>

            <p>
              <span className="font-semibold">
                Valid Till:
              </span>{" "}
              {validDate.toLocaleDateString("en-IN")}
            </p>

          </div>
        )}

        {/* Date */}
        <div className="mt-3 pt-3 border-t border-dashed border-gray-400">

          <p>
            <span className="font-semibold">
              Issue Date:
            </span>{" "}
            {issueDate.toLocaleDateString("en-IN")}
          </p>

        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t text-center text-xs text-gray-500">

          <p>
            Generated by Swasth QR
          </p>

          <p className="mt-1">
            Please keep this slip for your appointment.
          </p>

        </div>

      </div>

      {/* =========================
          ACTION BUTTONS
      ========================= */}
      <div className="flex flex-wrap justify-center gap-3 print:hidden">

        {/* PRINT */}
        <button
          type="button"
          onClick={printSlip}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-semibold transition"
        >
          🖨 Print Slip
        </button>

        {/* DOWNLOAD / SAVE AS PDF */}
        <button
          type="button"
          onClick={downloadSlip}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold transition"
        >
          ⬇ Download PDF
        </button>

      </div>

      <p className="text-xs text-gray-500 text-center max-w-sm print:hidden">
        Download PDF पर क्लिक करने के बाद browser में print
        window खुलेगी। वहाँ <b>Save as PDF</b> चुनकर slip
        download कर सकते हैं।
      </p>

    </div>
  );
};

export default PatientSlip;