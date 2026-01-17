# GreatMinds

A Real-time Activity Management System for Social Service Agencies.
This project was developed during **Hack4Good 2026**.

## Problem Statement

How might we reduce friction in activity sign-ups for both individuals and caregivers, while reducing manual effort for staff in managing and consolidating registration data?

## Getting Started

First, clone this repository:

```bash
git clone https://github.com/nmarwah7/greatminds.git
```

### Frontend

Navigate to the `client` directory and install the dependencies:

```bash
cd client
npm install
```

To start the development server, run:

```bash
npm run dev
```

The exact address of hosting will be visible in the terminal once you run the above command.

### Backend

This project uses [Firebase](https://console.firebase.google.com/). Ensure that a Firebase Project has been set up via the console. 

Firebase setup and testing is at directory `client/src/firebase/`.
Update the configurations to your project details.

```
const firebaseConfig = {
    apiKey: your_api_key,
    authDomain: your_project_id.firebaseapp.com,
    projectId: your_project_id,
    storageBucket: your_project_id.firebasestorage.app,
    messagingSenderId: your_id,
    appId: your_app_id,
    measurementId: your_measurement_id
};
```

## Key Features

1. 🔐 **Secure Role-Based Access Control**
    
    The application uses **React Context API** and **Firebase Authentication** to serve three distinct roles:

    * *Staff* : 
        * Full CRUD (Create, Read, Update, Delete) access to the event calendar.
        * Real time attendance monitoring for participants and volunteers

    * *Participants (Caregivers)* : 
        * Participants have a monthly calendar view summarising all events available for that month
        * They can select and book multiple events at once

    * *Volunteers* : 
        * Volunteers have a monthly caneldar view of all events
        * They can register for multiple events if the slot is not yet full

2. 🛡️ **Automatic Double Booking Prevention**
    
    To reduce manual labour for staff, the application implements two validations

    * *Local Basket Check* : Prevents overlapping selections in the current basket.
    * *Global Database Check* : Use Firestore queries to ensure that a user isn't already registered for a conflicting event at that time.

3. 📊 **Automatic Membership Validation for Participants**

    * The application automatically enforces membership constaints based on the participant's plan. For example, for weekly_2 plan, the number of events that can be selected is capped at 2 per week.
    * If there is a program series where the participants are required to attend exactly 2 events, then the application ensures that participants book 2 events.

4. 📄 **Operational Exports**

    Staff can generate professional attendance PDF sheets with just one click. This is an added advantage for staffs along with viewing all information through the application.

### Technical Architecture

* Frontend: React (Vite), FullCalendar.js, CSS3
* Backend: Firebase Firestore (NoSQL)
* Authentication: Firebase Auth (Email/Password)
* State Management: React Context API (Auth & Role Persistence)
* Reporting: jsPDF and jspdf-autotable

