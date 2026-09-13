import { useLocation } from "react-router-dom";

const Slip = () => {
  const { state } = useLocation();
  const patient = state.patient;
  const qr = state.qr;

  const printSlip = () => window.print();

  return (
    <div className="p-10 text-center">
      <h2 className="text-2xl font-bold">Hospital Slip</h2>

      <div className="border p-4 w-96 mx-auto mt-3 print-area">
        <p><b>Name:</b> {patient.name}</p>
        <p><b>Doctor:</b> {patient.doctor}</p>
        <p><b>Room:</b> {patient.room}</p>
        <p><b>Diagnosis:</b> {patient.diagnosis}</p>

        <img src={qr} className="w-24 mx-auto mt-3" />
      </div>

      <button onClick={printSlip} className="bg-green-600 text-white px-4 py-2 mt-5 rounded">
        🖨 Print Slip
      </button>
    </div>
  )
};

export default Slip;
