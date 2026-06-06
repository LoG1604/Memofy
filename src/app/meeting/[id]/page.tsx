"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFirebase } from "../../../lib/firebase-context";
import { useToast } from "../../../components/Toast";
import AskMemofyChat from "../../../components/AskMemofyChat";
import { MeetingData } from "../../../lib/firebase-mock";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Download,
  FileText,
  FileAudio,
  CheckSquare,
  Square,
  Sparkles,
  Loader2,
  Trash2,
} from "lucide-react";

export default function MeetingDetail() {
  const { id } = useParams() as { id: string };
  const { user, loading: authLoading, getMeeting, updateMeeting, deleteMeeting } = useFirebase();
  const router = useRouter();
  const { showToast } = useToast();

  const [meeting, setMeeting] = useState<MeetingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"summary" | "transcript" | "actions" | "insights">("summary");
  const [deleting, setDeleting] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const loadMeeting = async () => {
    setLoading(true);
    try {
      const data = await getMeeting(id);
      if (data) {
        setMeeting(data);
      } else {
        showToast("Meeting not found", "error");
      }
    } catch (error: any) {
      showToast(error.message || "Failed to load meeting details", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && id) {
      loadMeeting();
    }
  }, [user, id]);

  const handleActionToggle = async (index: number) => {
    if (!meeting || !meeting.actionItems) return;

    const updatedActions = [...meeting.actionItems];
    updatedActions[index] = {
      ...updatedActions[index],
      completed: !updatedActions[index].completed,
    };

    // Optimistic Update
    setMeeting({ ...meeting, actionItems: updatedActions });

    try {
      await updateMeeting(id, { actionItems: updatedActions });
      showToast(
        updatedActions[index].completed ? "Task marked completed!" : "Task marked incomplete",
        "success"
      );
    } catch (error: any) {
      // Revert on error
      setMeeting(meeting);
      showToast("Failed to update action item", "error");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this meeting? This action cannot be undone.")) return;

    setDeleting(true);
    try {
      await deleteMeeting(id);
      showToast("Meeting deleted successfully", "success");
      router.push("/dashboard");
    } catch (error: any) {
      showToast("Failed to delete meeting", "error");
      setDeleting(false);
    }
  };

  const handleExportText = () => {
    if (!meeting) return;

    let content = `MEMOFY MEETING REPORT\n`;
    content += `=========================\n`;
    content += `Title: ${meeting.title}\n`;
    content += `Date: ${meeting.date}\n`;
    content += `File: ${meeting.fileName} (${meeting.fileSize})\n`;
    content += `Description: ${meeting.description || "N/A"}\n\n`;

    content += `EXECUTIVE SUMMARY\n`;
    content += `-------------------------\n`;
    content += `${meeting.summary || "No summary available."}\n\n`;

    content += `ACTION ITEMS\n`;
    content += `-------------------------\n`;
    const exportItems = Array.isArray(meeting.actionItems) ? meeting.actionItems : [];
    if (exportItems.length > 0) {
      exportItems.forEach((item, index) => {
        content += `${index + 1}. [${item.completed ? "X" : " "}] ${item.text}\n`;
      });
    } else {
      content += `No action items listed.\n`;
    }
    content += `\n`;

    content += `KEY TAKEAWAYS\n`;
    content += `-------------------------\n`;
    if (meeting.keyInsights && meeting.keyInsights.length > 0) {
      meeting.keyInsights.forEach((insight, index) => {
        content += `- ${insight}\n`;
      });
    } else {
      content += `No takeaways listed.\n`;
    }
    content += `\n`;

    content += `TRANSCRIPT\n`;
    content += `-------------------------\n`;
    if (meeting.transcript && meeting.transcript.length > 0) {
      meeting.transcript.forEach((line) => {
        content += `[${line.time}] ${line.speaker}: ${line.text}\n`;
      });
    } else {
      content += `No transcript available.\n`;
    }

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${meeting.title.toLowerCase().replace(/\s+/g, "_")}_report.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Report exported successfully!", "success");
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  if (authLoading || (user && loading)) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
        <p className="mt-4 text-sm text-zinc-400">Retrieving meeting data...</p>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        <h2 className="text-2xl font-bold text-white">Oops! Meeting not found</h2>
        <p className="text-zinc-400 text-sm mt-2 max-w-sm">
          The meeting you are looking for does not exist or you may not have permission to view it.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 px-5 text-sm font-semibold text-zinc-200 hover:bg-zinc-850 hover:text-white transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 relative">
      <div className="absolute top-0 left-1/4 w-80 h-80 bg-glow-purple opacity-10 pointer-events-none" />

      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-900 pb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-2 rounded-xl border border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white truncate max-w-md sm:max-w-xl">
                {meeting.title}
              </h1>
              {meeting.fileType === "pdf" ? (
                <FileText className="w-5 h-5 text-zinc-400 flex-shrink-0" />
              ) : (
                <FileAudio className="w-5 h-5 text-zinc-400 flex-shrink-0" />
              )}
            </div>
            {/* Meta tags */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500 mt-1.5 font-medium">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {meeting.date}
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-800" />
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatDuration(meeting.duration)}
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-800" />
              <span className="truncate max-w-[150px]">{meeting.fileName}</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleExportText}
            className="flex-1 sm:flex-initial inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/30 px-4 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2.5 rounded-xl border border-rose-950 bg-rose-950/10 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-all disabled:opacity-50"
            title="Delete Meeting"
          >
            {deleting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Trash2 className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column - Details with Tabs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tab bar */}
          <div className="flex border-b border-zinc-900 overflow-x-auto scrollbar-none">
            {(["summary", "transcript", "actions", "insights"] as const).map((tab) => {
              const label =
                tab === "summary"
                  ? "Executive Summary"
                  : tab === "transcript"
                    ? "Transcript"
                    : tab === "actions"
                      ? "Action Items"
                      : "Key Insights";
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${activeTab === tab
                    ? "border-violet-500 text-violet-400 bg-violet-500/5"
                    : "border-transparent text-zinc-400 hover:text-zinc-200"
                    }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Tab Panel Contents */}
          <div className="premium-card p-6 sm:p-8 rounded-2xl bg-zinc-950/40 border border-zinc-800/80 shadow-md">
            {activeTab === "summary" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-zinc-900">
                  <Sparkles className="w-5 h-5 text-violet-400" />
                  <h2 className="text-lg font-bold text-white">AI Executive Summary</h2>
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap pt-2">
                  {meeting.summary || "No executive summary generated for this meeting."}
                </p>
              </div>
            )}

            {activeTab === "transcript" && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-3 border-b border-zinc-900">
                  <FileAudio className="w-5 h-5 text-violet-400" />
                  <h2 className="text-lg font-bold text-white">Dialog Transcript</h2>
                </div>
                {meeting.transcript && meeting.transcript.length > 0 ? (
                  <div className="space-y-4 pt-2">
                    {meeting.transcript.map((line, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 p-3 rounded-xl hover:bg-zinc-900/30 transition-colors"
                      >
                        <div className="flex items-center justify-between sm:flex-col sm:items-start sm:w-36 flex-shrink-0">
                          <span className="text-xs font-bold text-violet-400">
                            {line.speaker}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-semibold mt-0.5">
                            {line.time}
                          </span>
                        </div>
                        <p className="text-zinc-300 text-sm leading-relaxed flex-1 mt-1 sm:mt-0">
                          {line.text}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-zinc-550">
                    <p className="text-sm">No dialog transcript generated for this document.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "actions" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-zinc-900">
                  <CheckSquare className="w-5 h-5 text-violet-400" />
                  <h2 className="text-lg font-bold text-white">Action Items</h2>
                </div>
                {Array.isArray(meeting.actionItems) && meeting.actionItems.length > 0 ? (
                  <div className="space-y-3 pt-2">
                    {meeting.actionItems.map((item, idx) => (<button
                      key={idx}
                      onClick={() => handleActionToggle(idx)}
                      className="w-full flex items-start gap-3 p-3.5 rounded-xl border border-zinc-900 hover:border-zinc-800 bg-zinc-900/20 hover:bg-zinc-900/50 transition-all text-left group"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {item.completed ? (
                          <CheckSquare className="w-5 h-5 text-emerald-450 fill-emerald-500/10 group-hover:scale-105 transition-transform" />
                        ) : (
                          <Square className="w-5 h-5 text-zinc-650 group-hover:text-zinc-500 group-hover:scale-105 transition-transform" />
                        )}
                      </div>
                      <span
                        className={`text-sm leading-relaxed transition-all ${item.completed
                          ? "text-zinc-500 line-through decoration-zinc-600 font-medium"
                          : "text-zinc-250 font-medium group-hover:text-zinc-100"
                          }`}
                      >
                        {item.text}
                      </span>
                    </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-zinc-550">
                    <p className="text-sm">No action items detected in this meeting.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "insights" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-zinc-900">
                  <Sparkles className="w-5 h-5 text-violet-400" />
                  <h2 className="text-lg font-bold text-white">Key takeaways & Insights</h2>
                </div>
                {meeting.keyInsights && meeting.keyInsights.length > 0 ? (
                  <ul className="space-y-4 pt-2">
                    {meeting.keyInsights.map((insight, idx) => (
                      <li
                        key={idx}
                        className="flex gap-3 text-sm text-zinc-300 leading-relaxed p-3.5 rounded-xl border border-zinc-900/50 bg-zinc-900/10"
                      >
                        <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-xs font-bold flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-12 text-zinc-550">
                    <p className="text-sm">No takeaways parsed from this meeting.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Ask Memofy Chatbot */}
        <div className="lg:col-span-1 lg:sticky lg:top-24">
          <AskMemofyChat meeting={meeting} />
        </div>
      </div>
    </div>
  );
}
