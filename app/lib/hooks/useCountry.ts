"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";

export function useCountry() {
  const [country, setCountry] = useState<string | null>(null);

  useEffect(() => {
    let storedCountry =
      localStorage.getItem("user_country") || Cookies.get("user_country");

    if (!storedCountry) {
      storedCountry = "US"; // Default fallback
      Cookies.set("user_country", storedCountry, { expires: 30, path: "/" });
      localStorage.setItem("user_country", storedCountry);
    }

    setCountry(storedCountry);
  }, []);

  const updateCountry = (newCountry: string) => {
    setCountry(newCountry);
    localStorage.setItem("user_country", newCountry);
    Cookies.set("user_country", newCountry, { expires: 30, path: "/" });
  };

  return { country, updateCountry };
}
