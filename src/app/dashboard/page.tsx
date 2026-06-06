"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFirebase } from "../../lib/firebase-context";
import { useToast } from "../../components/Toast";
import MeetingCard from "../../components/MeetingCard";
import { MeetingData } from "../../lib/firebase-mock";
import {
  Search,
  Plus,
  Loader2,
  SlidersHorizontal,
  RefreshCw,
  FolderOpen,
  Clock,
  CheckSquare,
  Sparkles,
} from "lucide-react";

export default function Dashboard() {
  const { user, loading, getMeetings } = useFirebase();
  const router = useRouter();
  const { showToast } = useToast();

  const [meetings, setMeetings] = useState<MeetingData[]>([]);
  const [fetching, setFetching] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "audio" | "pdf">("all");

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const loadMeetings = async (silent = false) => {
    if (!silent) setFetching(true);
    try {
      const data = await getMeetings();
      setMeetings(data);
    } catch (error: any) {
      showToast(error.message || "Failed to load meetings", "error");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadMeetings();
    }
  }, [user]);

  // Handle Search and Filter logic
  const filteredMeetings = useMemo(() => {
    return meetings.filter((meeting) => {
      const matchesSearch =
        meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (meeting.description &&
          meeting.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesFilter =
        filterType === "all" || meeting.fileType === filterType;

      return matchesSearch && matchesFilter;
    });
  }, [meetings, searchQuery, filterType]);

  // Compute stats
  const stats = useMemo(() => {
    let totalSeconds = 0;
    let pendingActionItems = 0;

    meetings.forEach((m) => {
      if (m.status === "completed") {
        totalSeconds += m.duration || 0;
        if (m.actionItems) {
          const items = Array.isArray(m.actionItems) ? m.actionItems : [];
          pendingActionItems += items.filter((item: any) => !item.completed).length;
        }
      }
    });

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const formattedDuration =
      hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    return {
      count: meetings.length,
      duration: formattedDuration,
      pendingActions: pendingActionItems,
    };
  }, [meetings]);

  if (loading || (!user && fetching)) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
        <p className="mt-4 text-sm text-zinc-400">Loading your workspace...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
      {/* Glow Blur */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-glow-purple opacity-20 pointer-events-none" />

      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.displayName?.split(" ")[0] || "User"}
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Access and manage your meeting notes, transcripts, and action lists.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => loadMeetings()}
            disabled={fetching}
            className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-50"
            title="Refresh Meetings"
          >
            <RefreshCw className={`w-5 h-5 ${fetching ? "animate-spin" : ""}`} />
          </button>
          <Link
            href="/upload"
            className="flex-1 sm:flex-initial inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 text-sm font-semibold text-white hover:from-violet-500 hover:to-indigo-500 shadow-md shadow-indigo-500/20 hover:scale-[1.01] transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Meeting</span>
          </Link>
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="premium-card p-6 rounded-2xl flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <FolderOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-400">Total Meetings</p>
            <p className="text-2xl font-bold text-white mt-0.5">{stats.count}</p>
          </div>
        </div>
        <div className="premium-card p-6 rounded-2xl flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-400">Hours Transcribed</p>
            <p className="text-2xl font-bold text-white mt-0.5">{stats.duration}</p>
          </div>
        </div>
        <div className="premium-card p-6 rounded-2xl flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-400">Pending Action Items</p>
            <p className="text-2xl font-bold text-white mt-0.5">{stats.pendingActions}</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-zinc-800/80 bg-zinc-950/40 backdrop-blur-md mb-8">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search meetings by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-zinc-800 bg-zinc-900/30 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:bg-zinc-900/50 text-sm transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-zinc-400 text-sm mr-1">
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filter:</span>
          </div>
          <div className="flex p-1 rounded-xl bg-zinc-900 border border-zinc-800 w-full sm:w-auto">
            <button
              onClick={() => setFilterType("all")}
              className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${filterType === "all"
                  ? "bg-violet-600 text-white shadow-md shadow-violet-500/10"
                  : "text-zinc-400 hover:text-zinc-200"
                }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType("audio")}
              className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${filterType === "audio"
                  ? "bg-violet-600 text-white shadow-md shadow-violet-500/10"
                  : "text-zinc-400 hover:text-zinc-200"
                }`}
            >
              Audio
            </button>
            <button
              onClick={() => setFilterType("pdf")}
              className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${filterType === "pdf"
                  ? "bg-violet-600 text-white shadow-md shadow-violet-500/10"
                  : "text-zinc-400 hover:text-zinc-200"
                }`}
            >
              PDFs
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      {fetching ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
          <p className="mt-4 text-sm text-zinc-500">Updating meetings list...</p>
        </div>
      ) : filteredMeetings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMeetings.map((meeting) => (
            <MeetingCard key={meeting.id} meeting={meeting} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="premium-card p-12 rounded-2xl text-center flex flex-col items-center max-w-2xl mx-auto border-dashed border-zinc-800">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 mb-6">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-white">No meetings found</h3>
          <p className="mt-2 text-sm text-zinc-400 max-w-md mx-auto leading-normal">
            {searchQuery || filterType !== "all"
              ? "No meetings match your search query or filter. Try clearing the filters or modifying your query."
              : "Upload your first meeting audio file or PDF document to let Memofy transcribe and analyze it."}
          </p>
          <div className="mt-8 flex gap-4">
            {searchQuery || filterType !== "all" ? (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilterType("all");
                }}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/30 px-5 text-sm font-semibold text-zinc-300 hover:bg-zinc-850 transition-colors"
              >
                Clear Search
              </button>
            ) : (
              <Link
                href="/upload"
                className="inline-flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 text-sm font-semibold text-white hover:from-violet-500 hover:to-indigo-500 shadow-md transition-all gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Upload First Meeting</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
