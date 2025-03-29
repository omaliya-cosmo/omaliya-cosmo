"use client";

import { logout } from "./(auth)/actions";
import { getCustomerFromToken } from "./actions";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const fetchAdmin = async () => {
      const userData = await getCustomerFromToken();
      console.log("Customer:", userData);
    };
    fetchAdmin();
  }, []);

  return (
    <div>
      <h1>Omaliya Cosmetics</h1>
      <button onClick={logout}>Log Out</button>
    </div>
  );
}
