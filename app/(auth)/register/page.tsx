"use client";

import React from "react";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signup } from "../actions";

const RegisterForm = () => {
  const [state, signupAction] = useActionState(signup, undefined);

  return (
    <form action={signupAction} className="flex max-w-[300px] flex-col gap-2">
      <div className="flex flex-col gap-2">
        <input id="firstName" name="firstName" placeholder="First Name" />
      </div>
      {state?.errors?.firstName && (
        <p className="text-red-500">{state.errors.firstName}</p>
      )}
      <div className="flex flex-col gap-2">
        <input id="lastName" name="lastName" placeholder="Last Name" />
      </div>
      {state?.errors?.lastName && (
        <p className="text-red-500">{state.errors.lastName}</p>
      )}
      <div className="flex flex-col gap-2">
        <input id="email" name="email" placeholder="Email" />
      </div>
      {state?.errors?.email && (
        <p className="text-red-500">{state.errors.email}</p>
      )}
      <div className="flex flex-col gap-2">
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Password"
        />
      </div>
      {state?.errors?.password && (
        <p className="text-red-500">{state.errors.password}</p>
      )}
      <div className="flex flex-col gap-2">
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="Confirm Password"
        />
      </div>
      {state?.errors?.confirmPassword && (
        <p className="text-red-500">{state.errors.confirmPassword}</p>
      )}
      <SubmitButton />
    </form>
  );
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button disabled={pending} type="submit">
      Sign Up
    </button>
  );
}

export default RegisterForm;
