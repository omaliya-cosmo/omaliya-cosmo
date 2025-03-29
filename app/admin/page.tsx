"use client";

import React, { useEffect } from "react";
import { logout } from "./login/actions";
import { getAdminFromToken } from "../actions";

const page = () => {
  useEffect(() => {
    const fetchAdmin = async () => {
      const user = await getAdminFromToken();
      console.log("Admin user:", user);
    };
    fetchAdmin();
  }, []);

  return (
    <div>
      <button onClick={logout}>log out</button>
    </div>
  );
};

export default page;
