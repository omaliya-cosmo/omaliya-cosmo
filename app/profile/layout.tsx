import React from 'react';
import { getCustomerFromToken } from '../actions';

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const userData = await getCustomerFromToken();

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}