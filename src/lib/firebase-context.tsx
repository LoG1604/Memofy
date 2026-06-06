"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { isFirebaseConfigured, auth } from "./firebase";
import {
    mockAuth,
    mockDb,
    mockStorage,
    MockUser,
    MeetingData,
} from "./firebase-mock";
import {
    signInWithPopup,
    GoogleAuthProvider,
    signOut as firebaseSignOut,
    onAuthStateChanged,
} from "firebase/auth";
import { supabase } from "./supabase";
import { uploadFile as supabaseUploadFile } from "./supabase-storage";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AuthUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
}

interface FirebaseContextType {
    user: AuthUser | null;
    loading: boolean;
    isDemoMode: boolean;
    signInWithGoogle: () => Promise<void>;
    signOutUser: () => Promise<void>;
    getMeetings: () => Promise<MeetingData[]>;
    getMeeting: (id: string) => Promise<MeetingData | null>;
    createMeeting: (
        meeting: Omit<MeetingData, "id" | "createdAt" | "date" | "status" | "userId">
    ) => Promise<MeetingData>;
    updateMeeting: (id: string, updates: Partial<MeetingData>) => Promise<void>;
    deleteMeeting: (id: string) => Promise<void>;
    uploadFile: (file: File, onProgress: (progress: number) => void) => Promise<string>;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Map a raw Supabase row → MeetingData used throughout the app */
function rowToMeetingData(row: any): MeetingData {
    const meta = row.transcript || {};
    console.log("rowToMeetingData meta.fileType:", meta.fileType, "file_url:", row.file_url);
    const isPdf = row.file_type === "pdf";
    return {
        id: row.id,
        userId: row.user_id,
        title: row.title,
        fileUrl: row.file_url ?? "",
        status: row.status,
        summary: row.summary ?? "",
        actionItems: row.action_items ?? [],
        transcript: meta.transcript ?? [],
        description: meta.description ?? "",
        duration: meta.duration ?? 0,
        fileName: meta.fileName ?? "",
        fileSize: meta.fileSize ?? "",
        keyInsights: meta.keyInsights ?? [],
        fileType: isPdf ? "pdf" : "audio",
        createdAt: row.created_at,
        date: new Date(row.created_at ?? Date.now()).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        }),
    } as MeetingData;
}
// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [isDemoMode, setIsDemoMode] = useState(true);

    // Decide whether we have real Firebase credentials
    useEffect(() => {
        const configured = isFirebaseConfigured();
        setIsDemoMode(!configured);

        if (configured && auth) {
            const { getRedirectResult } = require("firebase/auth");
            getRedirectResult(auth).catch(console.error);

            const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
                if (firebaseUser) {
                    setUser({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName,
                        photoURL: firebaseUser.photoURL,
                    });
                } else {
                    setUser(null);
                }
                setLoading(false);
            });
            return unsubscribe;
        } else {
            const unsubscribe = mockAuth.onAuthStateChanged((mockUser) => {
                setUser(mockUser);
                setLoading(false);
            });
            return unsubscribe;
        }
    }, []);

    // ---------------------------------------------------------------------------
    // Auth
    // ---------------------------------------------------------------------------

    const signInWithGoogle = async () => {
        if (!isDemoMode && auth) {
            const provider = new GoogleAuthProvider();
            const { signInWithRedirect, getRedirectResult } = await import("firebase/auth");
            await signInWithRedirect(auth, provider);

        } else {
            await mockAuth.signInWithGoogle();
        }
    };

    const signOutUser = async () => {
        if (!isDemoMode && auth) {
            await firebaseSignOut(auth);
        } else {
            await mockAuth.signOut();
        }
    };

    // ---------------------------------------------------------------------------
    // Meetings – Supabase CRUD
    // ---------------------------------------------------------------------------

    const getMeetings = async (): Promise<MeetingData[]> => {
        if (!user) return [];

        if (isDemoMode) {
            return mockDb.getMeetingsForUser(user.uid);
        }

        const { data, error } = await supabase
            .from("meetings")
            .select("*")
            .eq("user_id", user.uid)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("getMeetings error:", error);
            throw error;
        }

        return (data ?? []).map(rowToMeetingData);
    };

    const getMeeting = async (id: string): Promise<MeetingData | null> => {
        if (isDemoMode) {
            return mockDb.getMeetingById(id);
        }

        const { data, error } = await supabase
            .from("meetings")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            console.error("getMeeting error:", error);
            return null;
        }

        return data ? rowToMeetingData(data) : null;
    };

    const createMeeting = async (
        meeting: Omit<MeetingData, "id" | "createdAt" | "date" | "status" | "userId">
    ): Promise<MeetingData> => {
        if (!user) throw new Error("User must be authenticated");

        const base = { ...meeting, userId: user.uid, status: "processing" as const };

        if (isDemoMode) {
            return mockDb.addMeeting(base);
        }

        const { data, error } = await supabase
            .from("meetings")
            .insert({
                user_id: user.uid,
                title: base.title,
                file_url: base.fileUrl ?? "",
                file_type: base.fileType ?? "audio",
                status: "processing",
                summary: "",
                action_items: [],
                // Store extra fields that don't have their own column inside transcript (JSON)
                transcript: {
                    transcript: [],
                    description: base.description ?? "",
                    duration: base.duration ?? 0,
                    fileName: base.fileName ?? "",
                    fileSize: base.fileSize ?? "",
                    keyInsights: [],
                    fileType: base.fileType ?? "audio",
                },
            })
            .select()
            .single();

        if (error) {
            console.error("createMeeting FULL error:", JSON.stringify(error));
            throw error;
        }

        return rowToMeetingData(data);
    };

    const updateMeeting = async (
        id: string,
        updates: Partial<MeetingData>
    ): Promise<void> => {
        if (isDemoMode) {
            return mockDb.updateMeeting(id, updates);
        }

        // Fetch the current row so we can merge the transcript JSON blob
        const { data: existing, error: fetchError } = await supabase
            .from("meetings")
            .select("*")
            .eq("id", id)
            .single();

        if (fetchError) {
            console.error("updateMeeting fetch error:", fetchError);
            throw fetchError;
        }

        const existingMeta = existing.transcript ?? {};

        const patch: Record<string, any> = {};
        if (updates.title !== undefined) patch.title = updates.title;
        if (updates.status !== undefined) patch.status = updates.status;
        if (updates.summary !== undefined) patch.summary = updates.summary;
        if (updates.actionItems !== undefined) patch.action_items = updates.actionItems;
        if (updates.fileUrl !== undefined) patch.file_url = updates.fileUrl;
        if (updates.fileType !== undefined) patch.file_type = updates.fileType;


        // Always merge the meta blob
        patch.transcript = {
            transcript: updates.transcript ?? existingMeta.transcript ?? [],
            description: updates.description ?? existingMeta.description ?? "",
            duration: updates.duration ?? existingMeta.duration ?? 0,
            fileName: updates.fileName ?? existingMeta.fileName ?? "",
            fileSize: updates.fileSize ?? existingMeta.fileSize ?? "",
            keyInsights: updates.keyInsights ?? existingMeta.keyInsights ?? [],
            fileType: updates.fileType ?? existingMeta.fileType ?? "audio",
        };
        console.log("Saving patch.transcript.fileType:", patch.transcript.fileType);

        const { error: updateError } = await supabase
            .from("meetings")
            .update(patch)
            .eq("id", id);

        if (updateError) {
            console.error("updateMeeting error:", updateError);
            throw updateError;
        }
    };

    const deleteMeeting = async (id: string): Promise<void> => {
        if (isDemoMode) {
            return mockDb.deleteMeeting(id);
        }

        const { error } = await supabase.from("meetings").delete().eq("id", id);

        if (error) {
            console.error("deleteMeeting error:", error);
            throw error;
        }
    };

    // ---------------------------------------------------------------------------
    // File Upload
    // ---------------------------------------------------------------------------

    const uploadFile = async (
        file: File,
        onProgress: (progress: number) => void
    ): Promise<string> => {
        if (!user) throw new Error("User must be authenticated");

        if (isDemoMode) {
            return mockStorage.uploadFile(file, onProgress);
        }

        return supabaseUploadFile(user.uid, file, onProgress);
    };

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------

    return (
        <FirebaseContext.Provider
            value={{
                user,
                loading,
                isDemoMode,
                signInWithGoogle,
                signOutUser,
                getMeetings,
                getMeeting,
                createMeeting,
                updateMeeting,
                deleteMeeting,
                uploadFile,
            }}
        >
            {children}
        </FirebaseContext.Provider>
    );
};

export const useFirebase = () => {
    const context = useContext(FirebaseContext);
    if (context === undefined) {
        throw new Error("useFirebase must be used within a FirebaseProvider");
    }
    return context;
};
