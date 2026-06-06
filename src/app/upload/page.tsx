"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useFirebase } from "../../lib/firebase-context";
import { useToast } from "../../components/Toast";
import {
  Upload as UploadIcon,
  FileAudio,
  FileText,
  Loader2,
  X,
  File,
  Sparkles,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export default function Upload() {
  const { user, loading, uploadFile, createMeeting, updateMeeting } = useFirebase();
  const router = useRouter();
  const { showToast } = useToast();

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Flow states
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop events
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    const validAudioTypes = ["audio/mp3", "audio/mpeg", "audio/wav", "audio/wave", "audio/x-wav", "audio/m4a", "audio/x-m4a"];
    const validPDFTypes = ["application/pdf"];

    const isAudio = validAudioTypes.includes(selectedFile.type) || selectedFile.name.endsWith(".mp3") || selectedFile.name.endsWith(".wav") || selectedFile.name.endsWith(".m4a");
    const isPDF = validPDFTypes.includes(selectedFile.type) || selectedFile.name.endsWith(".pdf");

    if (!isAudio && !isPDF) {
      showToast("Unsupported file format. Please upload an audio file (.mp3, .wav, .m4a) or PDF document.", "error");
      return;
    }

    // Size limit: 50MB
    if (selectedFile.size > 50 * 1024 * 1024) {
      showToast("File is too large. Maximum upload size is 50MB.", "error");
      return;
    }

    setFile(selectedFile);
    // Autofill title if empty
    if (!title) {
      const nameWithoutExt = selectedFile.name.substring(0, selectedFile.name.lastIndexOf(".")) || selectedFile.name;
      const formattedTitle = nameWithoutExt
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      setTitle(formattedTitle);
    }
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // 1. Upload file to Storage
      const fileUrl = await uploadFile(file, (progress) => {
        setUploadProgress(progress);
      });

      setUploading(false);
      setProcessing(true);
      setProcessingStep(1); // Step 1: File parsed

      const fileType: "audio" | "pdf" = file.name.endsWith(".pdf") || file.type.includes("pdf") ? "pdf" : "audio";

      // 2. Create raw meeting doc in Firestore (shows as processing)
      const newMeeting = await createMeeting({
        title,
        description,
        fileType,
        fileName: file.name,
        fileSize: formatFileSize(file.size),
        duration: fileType === "audio" ? 1800 : 0, // Mock duration for audio files
      });

      // 3. Trigger processing simulation steps while calling the API route
      // Let's call the API in parallel, and increment the visual steps to keep the user engaged
      const triggerAPIProcess = async () => {
        try {
          const response = await fetch("/api/process-meeting", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              meetingId: newMeeting.id,
              fileUrl,
              fileName: file.name,
              fileType,
              title,
            }),
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || "Failed to process meeting content");

          // Save API results to Firestore/Mock Firestore
          console.log("Saving fileType:", fileType);
          await updateMeeting(newMeeting.id, {
            status: "completed",
            transcript: result.transcript,
            summary: result.summary,
            actionItems: result.actionItems,
            keyInsights: result.keyInsights,
            duration: result.duration || newMeeting.duration,
            fileType,
          });

          return newMeeting.id;
        } catch (err: any) {
          await updateMeeting(newMeeting.id, { status: "failed" });
          throw err;
        }
      };

      // Start the API call
      const apiPromise = triggerAPIProcess();

      // Step intervals for visuals
      setProcessingStep(1); // Parsing file...
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setProcessingStep(2); // Transcribing dialogue...
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setProcessingStep(3); // Extracting insights...
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setProcessingStep(4); // Compiling summaries...
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Wait for the actual API result to be fully completed
      const meetingId = await apiPromise;

      showToast("Meeting processed successfully!", "success");
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push(`/meeting/${meetingId}`);
    } catch (error: any) {
      console.error(error);
      showToast(error.message || "Failed to process meeting", "error");
      setUploading(false);
      setProcessing(false);
    }
  };

  const getProcessingStepLabel = (step: number) => {
    switch (step) {
      case 1:
        return "Parsing uploaded file content...";
      case 2:
        return "Transcribing dialogue structure and matching voices...";
      case 3:
        return "Synthesizing themes and core concepts...";
      case 4:
        return "Generating executive summary and action items...";
      default:
        return "Analyzing meeting data...";
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
        <p className="mt-4 text-sm text-zinc-400">Loading upload tool...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
      <div className="absolute inset-0 bg-glow-blue opacity-10 pointer-events-none" />

      {/* Main Form container */}
      {!uploading && !processing ? (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Upload Meeting</h1>
            <p className="text-zinc-400 text-sm mt-1">
              Add a new meeting audio recording or import document slides/minutes to get detailed AI summaries.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="premium-card p-6 sm:p-8 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 shadow-xl space-y-6">
              {/* Drag and Drop Box */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-300">Meeting File</label>
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${dragActive
                    ? "border-violet-500 bg-violet-500/5"
                    : file
                      ? "border-zinc-700 bg-zinc-900/10"
                      : "border-zinc-800 bg-zinc-900/5 hover:border-zinc-700 hover:bg-zinc-900/20"
                    }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".mp3,.wav,.m4a,application/pdf"
                  />

                  {file ? (
                    <div className="flex flex-col items-center gap-3 w-full max-w-md">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600/10 border border-violet-500/20 text-violet-400">
                        {file.name.endsWith(".pdf") ? (
                          <FileText className="w-6 h-6" />
                        ) : (
                          <FileAudio className="w-6 h-6" />
                        )}
                      </div>
                      <div className="text-center w-full">
                        <p className="text-sm font-semibold text-zinc-100 truncate px-4">{file.name}</p>
                        <p className="text-xs text-zinc-500 mt-1">{formatFileSize(file.size)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearFile();
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs font-semibold mt-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Remove File</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 mb-4">
                        <UploadIcon className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-zinc-200">
                        Drag and drop your file here, or <span className="text-violet-400 hover:underline">browse</span>
                      </p>
                      <p className="text-xs text-zinc-500 mt-2 leading-relaxed max-w-sm">
                        Supports audio formats (.mp3, .wav, .m4a) and PDFs up to 50MB.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Title & Description Inputs */}
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-semibold text-zinc-300">
                    Meeting Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    required
                    placeholder="e.g. Q3 Sales Projection Standup"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-zinc-800 bg-zinc-900/30 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500 focus:bg-zinc-900/50 text-sm transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-semibold text-zinc-300">
                    Meeting Description <span className="text-zinc-500 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    placeholder="Provide a brief context or notes regarding this meeting..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500 focus:bg-zinc-900/50 text-sm transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/20 px-6 font-semibold text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!file}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 font-semibold text-white hover:from-violet-500 hover:to-indigo-500 shadow-md shadow-indigo-500/20 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <span>Upload & Process</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Status View (Uploading or Processing) */
        <div className="max-w-xl mx-auto py-16">
          <div className="premium-card p-8 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 shadow-2xl text-center space-y-8">
            {uploading ? (
              // Uploading State
              <div className="space-y-6">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600/10 border border-violet-500/20 text-violet-400 animate-bounce">
                  <UploadIcon className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">Uploading file...</h3>
                  <p className="text-sm text-zinc-400 truncate max-w-sm mx-auto">{file?.name}</p>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-zinc-400 px-1">
                    <span>Progress</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/60">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
                <p className="text-xs text-zinc-500">Do not close this page or navigate away.</p>
              </div>
            ) : (
              // Processing State
              <div className="space-y-6">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400">
                  <Loader2 className="w-7 h-7 animate-spin" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">Analyzing Meeting Content</h3>
                  <p className="text-sm text-zinc-400">Memofy AI is processing the document and generating summaries.</p>
                </div>

                {/* Vertical Stepper tracker */}
                <div className="max-w-xs mx-auto text-left space-y-4 py-4 border-t border-zinc-900">
                  <div className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-white text-[10px] font-bold">
                      {processingStep > 1 ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : "1"}
                    </div>
                    <span className={`text-xs font-semibold ${processingStep >= 1 ? "text-zinc-200" : "text-zinc-650"}`}>
                      Parsing document inputs
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-white text-[10px] font-bold">
                      {processingStep > 2 ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : "2"}
                    </div>
                    <span className={`text-xs font-semibold ${processingStep >= 2 ? "text-zinc-200" : "text-zinc-650"}`}>
                      Transcribing dialogue details
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-white text-[10px] font-bold">
                      {processingStep > 3 ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : "3"}
                    </div>
                    <span className={`text-xs font-semibold ${processingStep >= 3 ? "text-zinc-200" : "text-zinc-650"}`}>
                      Structuring core insights
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-white text-[10px] font-bold">
                      {processingStep > 4 ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : "4"}
                    </div>
                    <span className={`text-xs font-semibold ${processingStep >= 4 ? "text-zinc-200" : "text-zinc-650"}`}>
                      Compiling Action Items & Summary
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                  <p className="text-xs font-medium text-violet-400 animate-pulse">
                    {getProcessingStepLabel(processingStep)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
