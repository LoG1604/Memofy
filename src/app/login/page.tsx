"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFirebase } from "../../lib/firebase-context";
import { useToast } from "../../components/Toast";
import { Sparkles, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function Login() {
  const { user, loading, signInWithGoogle } = useFirebase();
  const router = useRouter();
  const { showToast } = useToast();
  const [signingIn, setSigningIn] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleSignIn = async () => {
    setSigningIn(true);
    try {
      await signInWithGoogle();
      showToast("Signed in successfully!", "success");
      router.push("/dashboard");
    } catch (error: any) {
      console.error(error);
      showToast(error.message || "Failed to sign in with Google", "error");
    } finally {
      setSigningIn(false);
    }
  };

  if (loading || (user && !signingIn)) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
        <p className="mt-4 text-sm text-zinc-400">Verifying session...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-16 relative">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-glow-purple opacity-30 pointer-events-none" />

      {/* Back to Home link */}
      <Link
        href="/"
        className="absolute top-8 left-8 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          {/* Glowing Brand Icon */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-xl shadow-indigo-500/20">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white">
            Welcome to Memofy
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Sign in to start transcribing and summarizing your meetings
          </p>
        </div>

        {/* Login Card */}
        <div className="premium-card p-8 rounded-2xl border border-zinc-800/80 bg-zinc-950/60 shadow-xl space-y-6">
          <div className="space-y-4">
            <button
              onClick={handleSignIn}
              disabled={signingIn}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-100 hover:bg-zinc-900 hover:text-white hover:border-zinc-700 font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg"
            >
              {signingIn ? (
                <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
              ) : (
                <svg className="w-5 h-5 group-hover:scale-105 transition-transform" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>{signingIn ? "Connecting..." : "Continue with Google"}</span>
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-zinc-950 px-2 text-zinc-500">Security Assured</span>
            </div>
          </div>

          <p className="text-xs text-zinc-500 text-center leading-normal">
            By logging in, you agree to our Terms of Service and Privacy Policy. Memofy does not share your meeting recordings or files with third parties.
          </p>
        </div>
      </div>
    </div>
  );
}
