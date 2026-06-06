import React from "react";
import Link from "next/link";
import { MeetingData } from "../lib/firebase-mock";
import { FileAudio, FileText, Calendar, Clock, ArrowRight, Loader2 } from "lucide-react";

interface MeetingCardProps {
  meeting: MeetingData;
  onDelete?: (id: string, e: React.MouseEvent) => void;
}

export default function MeetingCard({ meeting, onDelete }: MeetingCardProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const getStatusBadge = (status: MeetingData["status"]) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/30">
            Completed
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-medium text-rose-400 ring-1 ring-inset ring-rose-500/30">
            Failed
          </span>
        );
      case "processing":
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400 ring-1 ring-inset ring-amber-500/30 animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" />
            Processing
          </span>
        );
    }
  };

  return (
    <Link
      href={meeting.status === "processing" ? "#" : `/meeting/${meeting.id}`}
      className={`group block premium-card p-6 rounded-2xl ${
        meeting.status === "processing" ? "cursor-not-allowed opacity-90" : "cursor-pointer"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* File Type Icon */}
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 group-hover:border-violet-500/30 group-hover:text-violet-400 transition-colors duration-300">
          {meeting.fileType === "pdf" ? (
            <FileText className="w-6 h-6" />
          ) : (
            <FileAudio className="w-6 h-6" />
          )}
        </div>

        {/* Status Badge */}
        {getStatusBadge(meeting.status)}
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-semibold text-zinc-100 group-hover:text-white truncate">
          {meeting.title}
        </h3>
        <p className="mt-2 text-sm text-zinc-400 line-clamp-2 min-h-[40px]">
          {meeting.description || "No description provided."}
        </p>
      </div>

      {/* Meeting Details Footer */}
      <div className="mt-6 pt-4 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{meeting.date}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatDuration(meeting.duration)}</span>
          </div>
        </div>

        {meeting.status !== "processing" ? (
          <div className="flex items-center gap-1 text-violet-400 font-semibold group-hover:translate-x-1 transition-transform duration-200">
            <span>View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        ) : (
          <span className="text-zinc-600 font-medium">Please wait...</span>
        )}
      </div>
    </Link>
  );
}
