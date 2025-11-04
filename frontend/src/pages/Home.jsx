import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white p-6">
      <div className="max-w-2xl text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome to MediTrack</h1>
        <p className="text-gray-600 mb-6">Manage patients, medicines and appointments — demo frontend connected to your local backend.</p>
        <div className="space-x-4">
          <Link to="/signup" className="px-4 py-2 bg-green-600 text-white rounded">Sign up</Link>
          <Link to="/login" className="px-4 py-2 bg-blue-600 text-white rounded">Login</Link>
        </div>
      </div>
    </div>
  );
}