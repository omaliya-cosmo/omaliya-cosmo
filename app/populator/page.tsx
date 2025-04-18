// app/page.tsx
"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function seedDatabase() {
      try {
        setStatus("Seeding database...");
        const response = await fetch("/api/seed", {
          method: "POST",
        });
        const result = await response.json();
        if (response.ok) {
          setStatus(result.message);
        } else {
          setError(result.error + ": " + result.details);
        }
      } catch (err: any) {
        setError("Failed to seed database: " + err.message);
      }
    }
    seedDatabase();
  }, []);

  return (
    <div>
      <h1>Omaliya Cosmetics</h1>
      {status && <p>{status}</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      <p>Check MongoDB Compass to verify data.</p>
    </div>
  );
}
