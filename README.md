# Visitor Management System (VMS)

## Overview

This project is a mobile-first Visitor Management System for university gates. It allows security staff to register visitors, generate a visitor pass with QR code, retrieve an existing visitor using ID, and complete exit with automatic duration tracking.

The UI follows a centered card-based design and mirrors the provided screen flow:

1. Entry screen (scanner mock + visitor ID search)
2. Visitor registration form
3. Active visitor pass
4. Exit form
5. Exit success / expired pass

## Features

- Mobile-first responsive design using Flexbox and Grid
- Strict form validation with inline errors and disabled submit until valid
- Reusable form component for registration and exit flow
- Visitor ID based pass lookup
- QR code generation for visitor pass
- Exit confirmation flow with status update to EXPIRED
- Duration calculation from entry time to exit time
- Loading, error, and empty states for major screens
- Centralized API service layer with ArcGIS-ready config and mock persistence

## Tech Stack

- React 19 + Vite
- React Router DOM
- React Hook Form
- Zod + @hookform/resolvers
- qrcode.react
- Axios
- Local storage (mock data persistence)
- Context API for app-level state

## Setup Steps

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

4. Preview production build:

```bash
npm run preview
```

## ArcGIS API Config Guide

Update [src/config/api.js](src/config/api.js):

- Replace `BASE_URL` with your ArcGIS Feature Service URL
- Set the correct endpoint paths if they differ
- Replace `API_KEY` with your ArcGIS key/token flow

Current API methods are implemented in [src/services/apiService.js](src/services/apiService.js) and use mocked persistence for now.

When ArcGIS details are available, replace the mock sections with real `apiClient` requests and map response fields accordingly.

## Folder Structure

```text
src/
 ├── components/
 │   ├── CardHeader.jsx
 │   └── VmsLayout.jsx
 ├── pages/
 │   ├── EntryPage.jsx
 │   ├── RegistrationPage.jsx
 │   ├── VisitorPassPage.jsx
 │   ├── ExitFormPage.jsx
 │   ├── ExitExpiredPage.jsx
 │   └── NotFoundPage.jsx
 ├── forms/
 │   ├── VisitorForm.jsx
 │   └── visitorSchema.js
 ├── services/
 │   └── apiService.js
 ├── config/
 │   └── api.js
 ├── constants/
 │   └── formOptions.js
 ├── hooks/
 │   └── VisitorContext.jsx
 ├── utils/
 │   ├── dateTime.js
 │   └── visitorId.js
 ├── App.jsx
 ├── index.css
 └── main.jsx
```

## Future Improvements

- Integrate real ArcGIS Online endpoints with authentication and token refresh
- Replace local storage with secure backend persistence
- Add camera-based QR scanning integration
- Add role-based login for gate operators
- Add dashboard with daily visitor analytics and export
- Add automated test coverage (unit + integration)
