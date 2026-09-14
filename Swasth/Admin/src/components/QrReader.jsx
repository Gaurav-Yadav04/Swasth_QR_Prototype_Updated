import React from "react";
import QrScanner from "react-qr-barcode-scanner";

const QrReader = ({ delay = 0, onError, onScan }) => {
  return (
    <div className="w-full max-w-md bg-white shadow-lg rounded-2xl overflow-hidden">
      <div className="bg-gray-800 text-white text-center py-2 font-semibold">
        📷 QR Scanner
      </div>
      <div className="p-3">
        <QrScanner
          delay={delay}
          onError={onError}
          onUpdate={(err, result) => {
            if (result) {
              onScan(result.text); 
            }
          }}
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );
};

export default QrReader;
