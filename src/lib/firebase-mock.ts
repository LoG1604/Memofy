// Mock Firebase Client Services for Demo Mode (LocalStorage-backed)

export interface MockUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface MeetingData {
  id: string;
  userId: string;
  title: string;
  description: string;
  date: string;
  duration: number; // in seconds
  fileType: "audio" | "pdf";
  fileName: string;
  fileSize: string;
  status: "processing" | "completed" | "failed";
  progress?: number;
  transcript?: { speaker: string; time: string; text: string }[];
  summary?: string;
  actionItems?: { text: string; completed: boolean }[];
  keyInsights?: string[];
  createdAt: string;
  fileUrl?: string;
}

// ----------------------------------------------------
// Mock Auth
// ----------------------------------------------------
class MockAuthService {
  private listeners: ((user: MockUser | null) => void)[] = [];
  private currentUser: MockUser | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("memofy_mock_user");
      if (stored) {
        try {
          this.currentUser = JSON.parse(stored);
        } catch {
          this.currentUser = null;
        }
      }
    }
  }

  onAuthStateChanged(callback: (user: MockUser | null) => void) {
    this.listeners.push(callback);
    // Trigger immediately with current state
    setTimeout(() => callback(this.currentUser), 0);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  async signInWithGoogle(): Promise<MockUser> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user: MockUser = {
          uid: "mock_user_12345",
          email: "john.doe@memofy.ai",
          displayName: "John Doe",
          photoURL: "https://api.dicebear.com/7.x/adventurer/svg?seed=John",
        };
        this.currentUser = user;
        localStorage.setItem("memofy_mock_user", JSON.stringify(user));
        this.notifyListeners();
        resolve(user);
      }, 800); // simulate popup delay
    });
  }

  async signOut(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.currentUser = null;
        localStorage.removeItem("memofy_mock_user");
        this.notifyListeners();
        resolve();
      }, 300);
    });
  }

  getUser() {
    return this.currentUser;
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.currentUser));
  }
}

export const mockAuth = new MockAuthService();

// ----------------------------------------------------
// Mock Firestore
// ----------------------------------------------------
class MockFirestoreService {
  private meetingsKey = "memofy_mock_meetings";

  private getMeetings(): MeetingData[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(this.meetingsKey);
    if (!stored) {
      // Seed initial data if empty
      const initial: MeetingData[] = [
        {
          id: "meeting_1",
          userId: "mock_user_12345",
          title: "Q3 Product Strategy Alignment",
          description: "Discussion on roadmaps, timelines, and resourcing for Q3 deliverables.",
          date: new Date(Date.now() - 24 * 60 * 60 * 1000 * 2).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          duration: 1840,
          fileType: "audio",
          fileName: "q3_strategy_sync.mp3",
          fileSize: "42.1 MB",
          status: "completed",
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000 * 2).toISOString(),
          transcript: [
            { speaker: "Sarah (Product)", time: "00:05", text: "Welcome everyone. Let's align on Q3 strategy. Our primary goal is launching the mobile beta by August." },
            { speaker: "Dave (Engineering)", time: "00:32", text: "August is feasible, but we need API contracts finalized by mid-June. That's our critical path." },
            { speaker: "Elena (Design)", time: "01:05", text: "I've already updated the Figma prototypes. I will share them by the end of today." },
            { speaker: "Sarah (Product)", time: "01:25", text: "Great. Dave, let's lock down resources for the API work. Elena, please tag the engineers in Figma." },
          ],
          summary: "The meeting focused on alignment for the Q3 Product Strategy. The primary objective is to launch the mobile application beta by August. Engineering emphasized that API contracts must be finalized by mid-June to prevent delays. Design prototypes are nearly complete and will be shared immediately.",
          actionItems: [
            { text: "Share updated Figma design prototypes", completed: true },
            { text: "Finalize mobile API schema contracts", completed: false },
            { text: "Schedule resource allocation review for engineering", completed: false },
          ],
          keyInsights: [
            "August beta launch requires API schemas to be locked down by mid-June.",
            "Cross-functional handoff between Design and Engineering is currently the primary bottleneck.",
            "Design feedback loops have been shortened due to direct Figma collaboration.",
          ],
        },
        {
          id: "meeting_2",
          userId: "mock_user_12345",
          title: "Weekly Engineering Sync",
          description: "Sync on sprint tickets, bugs list, and blocker resolution.",
          date: new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          duration: 900,
          fileType: "audio",
          fileName: "eng_sync_04_06.mp3",
          fileSize: "18.3 MB",
          status: "completed",
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          transcript: [
            { speaker: "Dave (Engineering)", time: "00:10", text: "Hey team. Quick standup. Any blockers on current sprint?" },
            { speaker: "James (Dev)", time: "00:35", text: "No blocker, just finishing the auth refactor. It will be ready for review tomorrow." },
            { speaker: "Dave (Engineering)", time: "01:15", text: "Perfect. We need to deploy this safely behind a feature flag first." },
          ],
          summary: "Regular standup meeting to coordinate developer tickets. The auth refactoring task is on track for review. Deployment is planned under a feature flag to minimize risk.",
          actionItems: [
            { text: "Submit Auth Refactor PR for review", completed: true },
            { text: "Set up feature flag config in LaunchDarkly", completed: true },
          ],
          keyInsights: [
            "Auth refactor is code-complete and awaiting code review.",
            "Feature flags will be used to run progressive rollout.",
          ],
        },
      ];
      localStorage.setItem(this.meetingsKey, JSON.stringify(initial));
      return initial;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  private saveMeetings(meetings: MeetingData[]) {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.meetingsKey, JSON.stringify(meetings));
    }
  }

  async getMeetingsForUser(userId: string): Promise<MeetingData[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const all = this.getMeetings();
        resolve(all.filter((m) => m.userId === userId));
      }, 400);
    });
  }

  async getMeetingById(id: string): Promise<MeetingData | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const all = this.getMeetings();
        const found = all.find((m) => m.id === id);
        resolve(found || null);
      }, 300);
    });
  }

  async addMeeting(meeting: Omit<MeetingData, "id" | "createdAt" | "date">): Promise<MeetingData> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const all = this.getMeetings();
        const newMeeting: MeetingData = {
          ...meeting,
          id: "meeting_" + Math.random().toString(36).substr(2, 9),
          date: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          createdAt: new Date().toISOString(),
        };
        all.push(newMeeting);
        this.saveMeetings(all);
        resolve(newMeeting);
      }, 500);
    });
  }

  async updateMeeting(id: string, updates: Partial<MeetingData>): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const all = this.getMeetings();
        const index = all.findIndex((m) => m.id === id);
        if (index !== -1) {
          all[index] = { ...all[index], ...updates };
          this.saveMeetings(all);
        }
        resolve();
      }, 200);
    });
  }

  async deleteMeeting(id: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const all = this.getMeetings();
        const filtered = all.filter((m) => m.id !== id);
        this.saveMeetings(filtered);
        resolve();
      }, 300);
    });
  }
}

export const mockDb = new MockFirestoreService();

// ----------------------------------------------------
// Mock Storage
// ----------------------------------------------------
class MockStorageService {
  async uploadFile(
    file: File,
    onProgress: (progress: number) => void
  ): Promise<string> {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        onProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          // Return simulated file link (represented by standard URL or mock placeholder)
          resolve(
            file.type.includes("pdf")
              ? "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
              : "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
          );
        }
      }, 200);
    });
  }
}

export const mockStorage = new MockStorageService();
