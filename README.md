# QueueCure AI

## Real-Time Smart Clinic Queue Management System

QueueCure AI is a real-time digital queue management platform designed for neighborhood clinics. It replaces paper token slips and manual patient calling with a synchronized queue system that provides live updates to receptionists, doctors, patients, and waiting room displays.

The platform is built to improve patient visibility, reduce receptionist workload, and provide accurate waiting time predictions using real consultation data.

---

# Problem Statement

A significant number of neighborhood clinics still rely on paper tokens and manual queue management.

This leads to:

- Long waiting times with no visibility for patients
- Manual patient calling by receptionists
- No centralized dashboard for doctors
- Inefficient queue management and poor patient experience

QueueCure AI addresses these challenges through a live, synchronized queue management system.

---

# Solution Overview

QueueCure AI provides a complete digital workflow consisting of:

- Reception Dashboard
- Doctor Dashboard
- Patient Waiting Room Display
- Patient Portal
- Analytics Dashboard
- Runtime Configuration Panel

All modules remain synchronized through real-time Socket.IO communication.

---

# Mapping to Challenge Requirements

## 1. Can a receptionist add a patient and assign a token in under 10 seconds?

Yes.

The Reception Dashboard enables staff to:

- Register a patient
- Generate a queue token
- Assign a doctor
- Add consultation details

through a single streamlined interface designed for fast operation.

---

## 2. Does the patient-facing screen update live without refreshing the page?

Yes.

QueueCure AI uses Socket.IO for real-time synchronization.

When the receptionist clicks **Call Next**, every connected interface updates instantly:

- Doctor Dashboard
- Waiting Room Display
- Patient Portal
- Analytics Dashboard

without requiring a page refresh.

---

## 3. Is the estimated wait time computed from real data instead of a hardcoded value?

Yes.

Estimated waiting time is calculated dynamically using queue position and consultation duration.

```
Estimated Wait Time

=

Patients Ahead

×

Average Consultation Duration
```

As consultations complete, the average consultation duration is continuously updated, allowing future predictions to adapt automatically.

---

# Features

## Reception Dashboard

- Register patients
- Generate queue tokens
- Call next patient
- Configure consultation duration
- Live queue management

## Doctor Dashboard

- View current patient
- View upcoming queue
- Complete consultations
- Receive real-time updates

## Waiting Room Display

- Current token
- Upcoming tokens
- Estimated waiting time
- English and Hindi voice announcements

## Patient Portal

- Live queue position
- Assigned doctor
- Estimated waiting time
- Queue progress tracking

## Analytics Dashboard

- Total patients
- Waiting patients
- Completed consultations
- Average consultation duration
- Queue performance metrics

## Runtime Configuration

- Voice announcement settings
- Consultation duration configuration
- Backend diagnostics
- Socket.IO connection monitoring

---

# System Architecture

```
                    Reception Dashboard
                             │
                             │ REST API
                             ▼
                    Express.js Backend
                             │
                             │ Socket.IO
                             ▼
       ┌─────────────┬─────────────┬─────────────┬─────────────┐
       │             │             │             │             │
       ▼             ▼             ▼             ▼             ▼
Doctor Dashboard  Display Board  Patient Portal Analytics  Settings
```

---

# Technology Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- Axios

## Backend

- Node.js
- Express.js
- Socket.IO

## Communication

- REST API
- WebSocket (Socket.IO)

## Browser APIs

- Speech Synthesis API

---

# Project Structure

```
QueueCure-AI/

├── QueueCure-AI/
│   └── server/
│
├── premium-healthcare-saa-s-design/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── public/
│
└── README.md
```

---

# Installation

## Backend

```bash
cd QueueCure-AI/server
npm install
npm run dev
```

## Frontend

```bash
cd premium-healthcare-saa-s-design
npm install
npm run dev
```

---

# Why the Solution Works

QueueCure AI uses a centralized backend and event-driven architecture to ensure every connected screen reflects the same queue state in real time.

Instead of maintaining independent local queues, all clients receive updates through Socket.IO events, ensuring consistency across the Reception Dashboard, Doctor Dashboard, Waiting Room Display, Patient Portal, and Analytics Dashboard.

Dynamic waiting time prediction is computed from actual consultation data rather than predefined values, allowing estimates to improve continuously during clinic operation.

---

# Concurrency and Edge Cases

The system is designed to handle common operational scenarios:

- Simultaneous client updates through centralized backend state
- Automatic synchronization after "Call Next"
- Empty queue handling
- Client reconnection through fresh API data loading
- Real-time synchronization without manual refresh
- Graceful fallback when no active patients are present

---

# Key Highlights

- Real-time queue synchronization
- Dynamic wait-time prediction
- Multilingual voice announcements
- Live patient visibility
- Responsive multi-dashboard architecture
- Event-driven communication using Socket.IO
- Adaptive consultation time estimation

---

# One-Sentence Value Proposition

The moment the receptionist clicks **"Call Next"**, every doctor screen, waiting room display, patient portal, and analytics dashboard updates instantly with the latest queue status and waiting time—without refreshing a single page.

---

# Future Enhancements

- Multi-clinic support
- Appointment scheduling
- QR-based patient check-in
- SMS and WhatsApp notifications
- Cloud analytics
- AI-assisted queue optimization

---

# License

This project was developed as a prototype for a Smart Clinic Queue Management Hackathon and is intended for educational and demonstration purposes.
