# 🏥 QueueCure AI

## Adaptive Clinic Queue Intelligence

QueueCure AI is a real-time digital queue management system designed for neighbourhood clinics. It replaces paper tokens with live queue tracking, adaptive AI-powered wait time prediction, voice announcements, and synchronized dashboards for receptionists, doctors, and patients.

---

## 🚀 Problem Statement

76% of neighbourhood clinics still rely on:

- Paper token slips
- Manual patient calling
- No estimated waiting time
- No doctor visibility into queue status

QueueCure AI provides a simple, intelligent, and real-time solution.

---

## ✨ Features

### 👩‍💼 Reception Dashboard

- Add patient in seconds
- Call next patient
- Live queue management
- AI queue insights

### 👨‍⚕️ Doctor Dashboard

- Current patient information
- Upcoming queue
- Finish consultation
- AI learning update

### 📺 Waiting Room Display

- Now Serving
- Next Token
- Estimated Waiting Time
- Live updates

### 🤖 Adaptive AI Wait Prediction

Instead of a fixed wait time,

QueueCure AI continuously learns from actual consultation durations.

```
Predicted Wait

=

Patients Ahead

×

Adaptive Average Consultation Time
```

Example

```
Consultations

5 mins

8 mins

6 mins

7 mins

Average

6.5 mins

Patients Ahead

2

Predicted Wait

13 mins
```

---

## 🔊 Voice Announcement

Whenever Reception clicks **Call Next**,

the system announces

> "Token QC004, please proceed to Consultation Room."

using browser speech synthesis.

---

## ⚡ Real-Time Architecture

Reception Dashboard

↓

Socket.IO

↓

Doctor Dashboard

↓

Waiting Display

↓

Patient Status

All screens update instantly without refreshing.

---

## 🛠 Tech Stack

Frontend

- React
- React Router
- Axios

Backend

- Node.js
- Express.js

Real-Time

- Socket.IO

AI Logic

- Adaptive Average Consultation Prediction

---

## 📊 Analytics

- Patients Served
- Average Consultation Time
- Doctor Load
- AI Confidence

---

## 🎯 Future Scope

- QR Patient Tracking
- Multi-doctor Clinics
- Appointment Booking
- Cloud Analytics
- SMS Notifications

---

## 👨‍💻 Team

QueueCure AI

Adaptive Clinic Queue Intelligence

Replacing paper tokens with real-time AI-powered patient flow.