"use client";

import Link from "next/link";
import { useFirebase } from "../lib/firebase-context";
import { Sparkles, FileAudio, FileText, Bot, ArrowRight, CheckCircle2, Shield, Zap, RefreshCw } from "lucide-react";

export default function Home() {
  const { user } = useFirebase();

  return (
    <div className="relative isolate overflow-hidden min-h-screen flex flex-col justify-center">
      {/* Background Gradient Blobs */}
      <div
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-10 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>

      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-24 sm:pt-24 sm:pb-32 lg:px-8 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        <div className="flex-1 text-center lg:text-left max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-semibold mb-6 animate-pulse">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span>Powering Next-Gen Meeting Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Never Forget a Detail. Let{" "}
            <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-purple-500 bg-clip-text text-transparent text-glow">
              Memofy
            </span>{" "}
            Handle Your Meetings.
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-zinc-400 leading-relaxed">
            Upload meeting audio or PDFs. Instantly receive comprehensive transcripts, structured AI summaries, Action Items checklists, and chat directly with your meeting contents.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Link
              href={user ? "/dashboard" : "/login"}
              className="w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 font-semibold text-white hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-indigo-500/20 hover:scale-[1.02] transition-all duration-200 gap-2"
            >
              <span>{user ? "Go to Dashboard" : "Get Started for Free"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/30 px-6 font-medium text-zinc-300 hover:bg-zinc-850 hover:text-white transition-colors"
            >
              Explore Features
            </a>
          </div>

          {/* Quick Metrics */}
          <div className="mt-12 grid grid-cols-3 gap-6 border-t border-zinc-900 pt-8 max-w-md mx-auto lg:mx-0">
            <div>
              <p className="text-2xl font-bold text-white">99%</p>
              <p className="text-xs text-zinc-500 mt-1">Accuracy Rate</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">10x</p>
              <p className="text-xs text-zinc-500 mt-1">Speed Boost</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">100%</p>
              <p className="text-xs text-zinc-500 mt-1">Secure & Encrypted</p>
            </div>
          </div>
        </div>

        {/* Visual Element: Floating Mock UI */}
        <div className="flex-1 w-full max-w-xl lg:max-w-none relative animate-float">
          <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/20 to-indigo-500/20 blur-3xl opacity-30 rounded-full" />
          <div className="relative border border-zinc-800/80 rounded-2xl bg-zinc-950/60 shadow-2xl overflow-hidden backdrop-blur-xl">
            {/* Header window control */}
            <div className="flex items-center gap-1.5 px-4 py-3 bg-zinc-950/90 border-b border-zinc-900">
              <div className="w-3 h-3 rounded-full bg-rose-500/70" />
              <div className="w-3 h-3 rounded-full bg-amber-500/70" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
              <div className="mx-auto text-xs text-zinc-500 select-none">meeting_analysis_report.pdf</div>
            </div>

            {/* Simulated UI Content */}
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-40 bg-zinc-800 rounded animate-pulse" />
                  <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/30">
                    Completed
                  </span>
                </div>
                <div className="h-7 w-64 bg-gradient-to-r from-zinc-700 to-zinc-900 rounded" />
              </div>

              {/* Action items widget */}
              <div className="space-y-3 p-4 rounded-xl border border-zinc-900 bg-zinc-900/30">
                <p className="text-xs font-semibold text-violet-400 tracking-wider uppercase">AI Summary</p>
                <div className="h-3 w-full bg-zinc-800 rounded" />
                <div className="h-3 w-[92%] bg-zinc-855 rounded" />
                <div className="h-3 w-[85%] bg-zinc-800 rounded" />
              </div>

              {/* Chat simulator */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-zinc-500 tracking-wider uppercase">Ask Memofy Chat</p>
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400">AI</div>
                  <div className="flex-1 p-2.5 rounded-r-xl rounded-bl-xl bg-zinc-900 border border-zinc-850 text-xs text-zinc-300">
                    What were the direct action items for the engineering team?
                  </div>
                </div>
                <div className="flex gap-2 flex-row-reverse">
                  <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center text-[10px] font-bold text-white">JD</div>
                  <div className="flex-1 p-2.5 rounded-l-xl rounded-br-xl bg-violet-600/10 border border-violet-500/20 text-xs text-violet-300">
                    1. Lock down API contracts by Mid-June. <br />
                    2. Allocate 2 developers for Auth Refactoring next sprint.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="py-24 border-t border-zinc-900 bg-zinc-950/20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-base font-semibold leading-7 text-violet-400 uppercase tracking-widest">Everything You Need</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Turn Raw Audio & Documents Into Gold
            </p>
            <p className="mt-6 text-lg leading-8 text-zinc-400">
              Memofy parses your files using highly trained LLM context analysis to provide hyper-accurate insights.
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="flex flex-col premium-card p-8 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-glow-purple opacity-30 pointer-events-none" />
                <dt className="flex items-center gap-x-3 text-lg font-semibold leading-7 text-white">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-600 text-white">
                    <FileAudio className="w-5 h-5" />
                  </div>
                  Audio Transcription
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-400">
                  <p className="flex-auto">
                    Upload lectures, sync calls, or standups. Our transcription model breaks down dialogue speaker by speaker with timestamps.
                  </p>
                </dd>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col premium-card p-8 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-glow-blue opacity-20 pointer-events-none" />
                <dt className="flex items-center gap-x-3 text-lg font-semibold leading-7 text-white">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                    <FileText className="w-5 h-5" />
                  </div>
                  PDF Document Scanning
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-400">
                  <p className="flex-auto">
                    Upload meeting minutes PDFs, presentation slides, or agendas. Memofy extracts text content, tabular figures, and references.
                  </p>
                </dd>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col premium-card p-8 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-glow-purple opacity-30 pointer-events-none" />
                <dt className="flex items-center gap-x-3 text-lg font-semibold leading-7 text-white">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white">
                    <Bot className="w-5 h-5" />
                  </div>
                  Interactive AI Assistant
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-400">
                  <p className="flex-auto">
                    Ask questions, construct follow-up emails, draft action updates, or query details in real-time about your meeting documents.
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Trust & Features Section */}
      <section className="py-24 border-t border-zinc-900 bg-zinc-950/40">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-white">
                Focus on the Conversation, We'll Note the Rest.
              </h2>
              <p className="mt-6 text-lg text-zinc-400 leading-relaxed">
                Manually taking meeting notes is tedious and distracts you from the core collaborative discussions. Memofy takes care of all notes, summaries, and action steps in real time.
              </p>
              <ul className="mt-8 space-y-4">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-violet-400" />
                  <span className="text-zinc-300 text-sm font-medium">Automatic speaker identification</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-violet-400" />
                  <span className="text-zinc-300 text-sm font-medium">Auto-generated Action Items synced to checkboxes</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-violet-400" />
                  <span className="text-zinc-300 text-sm font-medium">Fully secure sandbox database encryption</span>
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex flex-col gap-3">
                <Shield className="w-8 h-8 text-violet-500" />
                <h3 className="text-md font-semibold text-white">Privacy First</h3>
                <p className="text-xs text-zinc-500 leading-normal">Your meetings are encrypted end-to-end and deleted at your request.</p>
              </div>
              <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex flex-col gap-3">
                <Zap className="w-8 h-8 text-blue-500" />
                <h3 className="text-md font-semibold text-white">Lightning Fast</h3>
                <p className="text-xs text-zinc-500 leading-normal">Get summaries in under 30 seconds, no matter how long the discussion.</p>
              </div>
              <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex flex-col gap-3 col-span-2">
                <RefreshCw className="w-8 h-8 text-indigo-500" />
                <h3 className="text-md font-semibold text-white">Omnichannel Integration</h3>
                <p className="text-xs text-zinc-500 leading-normal">Upload audio files (.mp3, .wav, .m4a) directly or import meeting documents (.pdf) effortlessly.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 border-t border-zinc-900 bg-[#030014] relative">
        <div className="absolute inset-0 bg-glow-purple opacity-20 pointer-events-none" />
        <div className="mx-auto max-w-5xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Ready to Transform Your Workflow?
          </h2>
          <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
            Get started today. Transcribe and summarize your first 3 meetings absolutely free. No credit card required.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href={user ? "/dashboard" : "/login"}
              className="inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 font-semibold text-white hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-indigo-500/20 hover:scale-[1.02] transition-all gap-2"
            >
              <span>{user ? "Go to Dashboard" : "Sign Up / Log In"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Background Gradient Blob Bottom */}
      <div
        className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-10 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>
    </div>
  );
}
