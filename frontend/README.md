# MediTrack Frontend

A modern, responsive React frontend for the MediTrack Personal Health Record System.

## Features

- 🏠 Landing page with hero section and feature cards
- 🔐 Authentication (Login & Signup)
- 📊 Dashboard with user welcome message
- 🎨 Modern UI with TailwindCSS
- 📱 Fully responsive design

## Tech Stack

- React 18
- React Router DOM
- TailwindCSS
- Axios
- Vite

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory (optional):
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Project Structure

```
src/
├── components/
│   ├── Navbar.jsx       # Navigation component
│   └── FeatureCard.jsx  # Reusable feature card
├── pages/
│   ├── Home.jsx         # Landing page
│   ├── Login.jsx        # Login page
│   ├── Signup.jsx       # Signup page
│   └── Dashboard.jsx    # Dashboard page
├── utils/
│   └── api.js           # API utility functions
├── App.jsx              # Main app component with routes
├── index.css            # TailwindCSS imports
└── main.jsx             # Entry point
```

## API Endpoints

The frontend expects the following backend endpoints:

- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration

## Build

```bash
npm run build
```

## Preview Production Build

```bash
npm run preview
```

