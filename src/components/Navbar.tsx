"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useFirebase } from "../lib/firebase-context";
import { useToast } from "./Toast";
import { LogOut, LayoutDashboard, Upload, Sparkles, Menu, X, HelpCircle } from "lucide-react";

export default function Navbar() {
  const { user, signOutUser, isDemoMode } = useFirebase();
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOutUser();
      showToast("Signed out successfully", "success");
      router.push("/");
    } catch (error: any) {
      showToast(error.message || "Failed to sign out", "error");
    }
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/40 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden group-hover:scale-105 transition-transform duration-200">
              <img src="/logo.png" alt="Memofy" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent group-hover:text-white transition-colors duration-200">
              Memofy
            </span>
          </Link>

          {/* Demo Mode Badge */}
          {isDemoMode && (
            <span className="hidden sm:inline-flex items-center rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-400 ring-1 ring-inset ring-indigo-500/30">
              Demo Mode
            </span>
          )}
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors hover:text-white ${isActive("/") ? "text-white" : "text-zinc-400"
              }`}
          >
            Home
          </Link>
          {user && (
            <>
              <Link
                href="/dashboard"
                className={`text-sm font-medium transition-colors hover:text-white ${isActive("/dashboard") ? "text-white" : "text-zinc-400"
                  }`}
              >
                Dashboard
              </Link>
              <Link
                href="/upload"
                className={`text-sm font-medium transition-colors hover:text-white ${isActive("/upload") ? "text-white" : "text-zinc-400"
                  }`}
              >
                Upload
              </Link>
            </>
          )}
        </nav>

        {/* User Auth Buttons (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-full hover:bg-zinc-800/60 border border-transparent hover:border-zinc-800 transition-all duration-200 focus:outline-none"
              >
                <img
                  src={user.photoURL ? user.photoURL.replace("=s96-c", "=s200-c") : `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName}`}
                  className="w-10 h-10 rounded-full border-2 border-indigo-500 bg-zinc-800 object-cover"
                />
                <span className="text-sm font-medium text-zinc-300 pr-1 max-w-[120px] truncate">
                  {user.displayName?.split(" ")[0]}
                </span>
              </button>

              {userDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-zinc-800 bg-zinc-950 p-2 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
                    <div className="px-3 py-2 border-b border-zinc-800/80 mb-1">
                      <p className="text-sm font-semibold text-zinc-100">{user.displayName}</p>
                      <p className="text-xs text-zinc-400 truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-zinc-400" />
                      My Dashboard
                    </Link>
                    <Link
                      href="/upload"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors"
                    >
                      <Upload className="w-4 h-4 text-zinc-400" />
                      Upload Meeting
                    </Link>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        handleSignOut();
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-950/20 transition-colors mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex h-9 items-center justify-center rounded-xl bg-white px-4 text-sm font-semibold text-zinc-950 hover:bg-zinc-200 transition-colors shadow-md"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          {isDemoMode && (
            <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-400 ring-1 ring-inset ring-indigo-500/30">
              Demo
            </span>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-lg px-4 py-4 space-y-4">
          <nav className="flex flex-col gap-3">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`text-sm font-medium py-2 border-b border-zinc-900 ${isActive("/") ? "text-white" : "text-zinc-400"
                }`}
            >
              Home
            </Link>
            {user && (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm font-medium py-2 border-b border-zinc-900 ${isActive("/dashboard") ? "text-white" : "text-zinc-400"
                    }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/upload"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm font-medium py-2 border-b border-zinc-900 ${isActive("/upload") ? "text-white" : "text-zinc-400"
                    }`}
                >
                  Upload Meeting
                </Link>
              </>
            )}
          </nav>

          <div className="pt-2">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-1">
                  <img
                    src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName}`}
                    alt={user.displayName || "Avatar"}
                    className="w-10 h-10 rounded-full border border-zinc-700 bg-zinc-800 object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-zinc-200">{user.displayName}</p>
                    <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 py-2.5 text-sm font-semibold text-rose-400 hover:bg-rose-950/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center rounded-xl bg-white py-2.5 text-sm font-semibold text-zinc-950 hover:bg-zinc-200 transition-colors shadow-md"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
