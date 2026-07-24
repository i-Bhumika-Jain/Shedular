"use client";

import { useRouter } from "next/navigation";
import AuthForm from "../components/AuthForm";

export default function AuthPage() {
  const router = useRouter();

  return (
    <main className="authPage">
      <section className="introPanel">
        <p className="eyebrow">Schedular</p>
        <h1>Next.js frontend with Python backend</h1>
        <p>Sign in with username, email, or phone and keep planner data in PostgreSQL.</p>
      </section>
      <section className="formPanel">
        <AuthForm onAuthenticated={() => router.push("/dashboard")} />
      </section>
    </main>
  );
}
