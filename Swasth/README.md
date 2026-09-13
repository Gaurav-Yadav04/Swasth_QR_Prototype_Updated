# Swasth QR — College Prototype

This version keeps the existing backend/frontend work and adds a focused Smart Hospital & OPD prototype.

## Main demo flow

1. Home → search doctor/hospital
2. Check doctor timing + Active/Inactive status
3. Book appointment from home
4. Get token
5. Open **My Queue**
6. Open **Doctor Dashboard** in another tab
7. Doctor calls/completes patients
8. Patient queue updates automatically
9. Hospital Kiosk → simulate QR scan → select department/problem → doctor suggestion → token
10. Admin Dashboard → monitor doctors and queue

## Important prototype note

The new demo screens use browser `localStorage` so the complete flow can be demonstrated even without MongoDB. The existing Express/MongoDB backend is retained for the original registration/QR workflow.

This is a college prototype, not a production healthcare system. Do not use real patient/Aadhaar data.

## Run

### Frontend prototype
```bash
cd Swasth/frontend
npm install
npm run dev
```

Then open the Vite URL.

### Existing backend
```bash
cd Swasth/backend
npm install
npm start
```

Create a local `.env` from `.env.example` and provide your MongoDB connection string and JWT secret.

## Demo routes

- `/` — Patient home + doctor search + appointment
- `/patient` — Live patient queue
- `/kiosk` — Hospital QR kiosk
- `/doctor` — Doctor queue dashboard
- `/admin` — Hospital admin dashboard
- `/register` — Existing patient registration
- `/scan` — Existing QR/Aadhaar staff workflow

## Suggested demo

Use two browser tabs:
- Tab 1: `/patient`
- Tab 2: `/doctor`

Book the demo appointment from Home, then use Doctor Dashboard → Call Next / Consultation Completed. Watch the patient queue update.

For the next development phase, replace the localStorage demo store with Socket.IO + MongoDB APIs and then evaluate official ABDM/ABHA integration.
