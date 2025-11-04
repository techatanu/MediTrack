import React from "react";

export default function Dashboard() {
  const token = localStorage.getItem("token");
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-2xl w-full p-8 bg-white rounded shadow text-center">
        <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>
        <p className="text-gray-600">You are {token ? "authenticated" : "not authenticated"}.</p>
      </div>
    </div>
  );
}