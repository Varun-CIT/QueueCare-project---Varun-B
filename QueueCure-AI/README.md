# QueueCure AI

## Real-Time Smart Clinic Queue Management System

QueueCure AI is a full-stack real-time clinic queue management platform designed to replace traditional paper token systems with a synchronized digital workflow. The system enables receptionists, doctors, patients, and waiting room displays to stay connected through live updates, adaptive waiting time prediction, and multilingual voice announcements.

The platform improves operational efficiency, reduces patient uncertainty, and provides complete visibility into the consultation process without requiring manual coordination.

---

## Problem Statement

A large percentage of neighborhood clinics continue to rely on paper token slips and manual patient calling, resulting in:

- Long and unpredictable waiting times
- No real-time visibility for patients
- Increased workload for receptionists
- Lack of queue information for doctors
- Poor overall patient experience

QueueCure AI addresses these challenges by providing a centralized, event-driven queue management system that synchronizes every stakeholder in real time.

---

## Solution Overview

QueueCure AI consists of multiple interconnected modules that operate on a single backend and communicate through Socket.IO.

### Reception Dashboard

- Register patients and generate queue tokens
- Assign doctors
- Call the next patient
- Configure average consultation duration
- Manage the live queue

### Doctor Dashboard

- View current consultation
- Access upcoming patients
- Complete consultations
- Receive instant queue updates

### Waiting Room Display

- Display current token
- Show upcoming queue
- Present estimated waiting time
- Generate English and Hindi voice announcements

### Patient Portal

- View live queue position
- Track estimated waiting time
- Monitor consultation progress
- Access assigned doctor information

### Analytics Dashboard

- Total patients served
- Waiting and completed patients
- Average consultation duration
- Queue performance insights

### System Configuration

- Runtime clinic configuration
- Voice announcement settings
- Backend diagnostics
- Socket.IO connection monitoring

---

# Challenge Requirements

## 1. Receptionist can add a patient and assign a token in under 10 seconds

The Reception Dashboard is designed for rapid patient registration with a streamlined workflow requiring minimal input.

**Status:** Implemented

---

## 2. Patient-facing screen updates live without page refresh

QueueCure AI uses Socket.IO to synchronize all connected clients instantly.

When the receptionist clicks **Call Next**, updates are propagated automatically to:

- Doctor Dashboard
- Waiting Room Display
- Patient Portal
- Analytics Dashboard

without requiring any manual refresh.

**Status:** Implemented

---

## 3. Estimated wait time is computed from real data

Waiting time is dynamically calculated using queue position and average consultation duration instead of fixed values.

```
Estimated Wait Time

=

Patients Ahead

×

Average Consultation Duration
```

As consultations complete, the average consultation duration is continuously updated, allowing future predictions to adapt automatically.

**Status:** Implemented

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
      ┌──────────────┬──────────────┬──────────────┬──────────────┐
      │              │              │              │              │
      ▼              ▼              ▼              ▼              ▼
Doctor Dashboard  Display Board  Patient Portal  Analytics  Settings
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

## Real-Time Communication

- Socket.IO

## Browser APIs

- Speech Synthesis API

---

# Key Features

- Real-time queue synchronization
- Adaptive waiting time prediction
- Multilingual voice announcements
- Live doctor and patient dashboards
- Responsive waiting room display
- Event-driven architecture
- Runtime system diagnostics
- Multi-dashboard ecosystem

---

# Project Structure

```
QueueCare-project---Varun-B/

├── QueueCure-AI/
│   ├── server/
│   └── client/
│
├── premium-healthcare-saa-s-design/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── public/
│   └── styles/
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

The application will be available locally after both services are started.

---

# Concurrency and Edge Cases

The system is designed to handle common operational scenarios through centralized state management and event-driven communication.

Supported scenarios include:

- Simultaneous client connections
- Instant queue synchronization
- Empty queue handling
- Client reconnection and state recovery
- Dynamic wait-time recalculation
- Live multi-dashboard updates without refresh

---

# Why QueueCure AI

Unlike traditional clinic queue systems that rely on manual coordination, QueueCure AI maintains a single source of truth on the backend and distributes updates to every connected client in real time.

This architecture ensures:

- Consistent queue state across all dashboards
- Reduced receptionist workload
- Transparent patient experience
- Improved operational efficiency
- Accurate and adaptive waiting time prediction

---

# Future Enhancements

- Multi-clinic deployment
- Appointment scheduling
- QR-based patient check-in
- SMS and WhatsApp notifications
- Cloud analytics
- AI-assisted consultation forecasting

---

# One-Line Value Proposition

**The moment the receptionist clicks "Call Next", every doctor screen, waiting room display, patient portal, and analytics dashboard updates instantly with live queue information and adaptive waiting time prediction—without refreshing a single page.**

---

# License

This project was developed as part of a Smart Clinic Queue Management Hackathon and is intended for educational and demonstration purposes.
