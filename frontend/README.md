# 🩺 MediBook — Doctor Appointment Booking System

A full-featured React app with **Patient** and **Doctor** portals.

## Features

### Patient Portal
- Register / Login
- **Book Appointment** — 5-step wizard: pick doctor → date → time slot → details → confirm
- View, reschedule, cancel appointments
- **Rate & review** doctor after appointment is completed
- Profile management (personal + medical info)

### Doctor Portal
- Login with pre-seeded doctor accounts
- **Requests dashboard** — Accept ✓ / Reject ✕ each pending booking, add notes
- **Mark Complete** — click when consultation is done, patients can then rate
- **Schedule view** — calendar strip showing daily appointments
- **Profile** — view ratings and patient reviews

## Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm start
# Opens at http://localhost:3000
```

## Doctor Login Credentials (pre-seeded)

| Doctor | Email | Password |
|--------|-------|----------|
| Dr. Priya Sharma (Cardiologist) | sharma@medibook.com | doctor123 |
| Dr. Arjun Mehta (Neurologist) | mehta@medibook.com | doctor123 |
| Dr. Sneha Kulkarni (Dermatologist) | kulkarni@medibook.com | doctor123 |
| Dr. Rohit Patil (Orthopedic) | patil@medibook.com | doctor123 |
| Dr. Anita Desai (Pediatrician) | desai@medibook.com | doctor123 |
| Dr. Vikram Joshi (General Physician) | joshi@medibook.com | doctor123 |

## Patient Flow
1. Register → Login
2. Click **Book Appointment** → select doctor → pick date → pick time → describe reason → confirm
3. Appointment shows as **Pending** until doctor accepts
4. Once doctor marks **Completed**, patient can ⭐ Rate the doctor

## Deploy to Netlify
```bash
npm run build
# Drag the /build folder to netlify.com/drop
```

## Tech Stack
- React 18 (CRA)
- React Router DOM
- Lucide React (icons)
- Google Fonts (DM Serif Display + DM Sans)
- No backend — state managed in React Context (localStorage can be added)
