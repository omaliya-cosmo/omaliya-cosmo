"use client";

import React from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { login } from "@/app/admin/login/actions";

const AdminLogin = () => {
  const [state, loginAction] = useActionState(login, undefined);

  return (
    <form action={loginAction} className="flex max-w-[300px] flex-col gap-2">
      <div className="flex flex-col gap-2">
        <input id="text" name="username" placeholder="Admin Username" />
      </div>
      {state?.errors?.username && (
        <p className="text-red-500">{state.errors.username}</p>
      )}
      <div className="flex flex-col gap-2">
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Admin Password"
        />
      </div>
      {state?.errors?.password && (
        <p className="text-red-500">{state.errors.password}</p>
      )}
      <SubmitButton />
    </form>
  );
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button disabled={pending} type="submit">
      Login
    </button>
  );
}

export default AdminLogin;
