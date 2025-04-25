"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";

export function useCountry() {
  const [country, setCountry] = useState<string>("LK");

  useEffect(() => {
    let storedCountry = Cookies.get("user_country");

    if (!storedCountry) {
      storedCountry = "US"; // Default fallback
      Cookies.set("user_country", storedCountry, { expires: 30, path: "/" });
    }

    setCountry(storedCountry);
  }, []);

  const updateCountry = (newCountry: string) => {
    setCountry(newCountry);
    Cookies.set("user_country", newCountry, { expires: 30, path: "/" });
  };

  return { country, updateCountry };
}
