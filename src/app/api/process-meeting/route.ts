import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { title, fileName, fileType } = await request.json();

    const apiKey = process.env.NVIDIA_API_KEY;

    if (apiKey) {
      // ----------------------------------------------------
      // NVIDIA NIM API PROCESSOR (OpenAI-compatible)
      // ----------------------------------------------------
      try {
        const prompt = `
          You are an AI meeting assistant. Generate a highly detailed, realistic meeting transcript, summary, action items, and key takeaways for a meeting based on the following metadata:
          - Meeting Title: "${title}"
          - File Name: "${fileName}"
          - File Type: "${fileType}"

          The output must be a single JSON object matching this structure EXACTLY:
          {
            "duration": <number of seconds as integer, e.g. 1500>,
            "transcript": [
              { "speaker": "Name (Role)", "time": "MM:SS", "text": "speech content..." }
            ],
            "summary": "Detailed paragraph summarizing the meeting outcomes...",
            "actionItems": [
              { "text": "Specific, actionable task description...", "completed": false }
            ],
            "keyInsights": [
              "Significant key takeaway or business decision..."
            ]
          }

          Make sure the transcript contains at least 4 entries with dialogue between different team members, and the text corresponds logically to the meeting title: "${title}".
          Return ONLY the JSON object, no markdown fences, no explanation.
        `;

        const response = await fetch(
          "https://integrate.api.nvidia.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning",
              messages: [{ role: "user", content: prompt }],
              temperature: 0.7,
              max_tokens: 4096,
            }),
          }
        );

        if (!response.ok) {
          const errBody = await response.text();
          throw new Error(`NVIDIA NIM API error ${response.status}: ${errBody}`);
        }

        const result = await response.json();
        const rawText = result.choices?.[0]?.message?.content ?? "";

        if (rawText) {
          // Strip possible markdown code fences
          const cleaned = rawText
            .replace(/^```(?:json)?\s*/i, "")
            .replace(/\s*```$/i, "")
            .trim();
          const parsed = JSON.parse(cleaned);
          return NextResponse.json(parsed);
        }
      } catch (nvidiaError) {
        console.error(
          "NVIDIA NIM processing error, falling back to mock:",
          nvidiaError
        );
      }
    }

    // ----------------------------------------------------
    // FALLBACK / MOCK AI GENERATOR (When API key is missing or fails)
    // ----------------------------------------------------
    const cleanTitle = title || "Project sync";
    const duration =
      fileType === "pdf" ? 0 : Math.floor(Math.random() * 1200) + 600;

    const mockTranscript = [
      {
        speaker: "Alex (Project Lead)",
        time: "00:15",
        text: `Thanks for joining the sync on ${cleanTitle}. Today we need to address our immediate action items, review timelines, and resolve any current blockages.`,
      },
      {
        speaker: "Taylor (Product)",
        time: "00:52",
        text: `I've updated the draft docs for ${cleanTitle}. We are waiting on design signs-offs, but the core specification looks solid. We should lock down the scope by Wednesday.`,
      },
      {
        speaker: "Jordan (Engineer)",
        time: "01:30",
        text: `Regarding implementation, we can support the core features. However, we'll need to run performance checks on the backend since the database volume is expanding.`,
      },
      {
        speaker: "Alex (Project Lead)",
        time: "02:15",
        text: `Perfect. Taylor, please sync with Design tomorrow morning. Jordan, set up those performance tests and let's meet on Friday to review the results.`,
      },
    ];

    const mockSummary = `The team synced to discuss key deliverables for "${cleanTitle}". Product has updated the draft documentation and plans to lock down the project scope by mid-week after coordinating with Design. Engineering confirmed support for the core feature set but raised a performance concern regarding database scaling. A review of performance metrics is scheduled for Friday.`;

    const mockActionItems = [
      {
        text: `Finalize design reviews and lock project scope for "${cleanTitle}"`,
        completed: false,
      },
      { text: "Configure database performance test suites", completed: false },
      {
        text: "Schedule review sync for engineering team this Friday",
        completed: false,
      },
    ];

    const mockKeyInsights = [
      "Scope freeze is scheduled for mid-week to prevent creeping timeline delays.",
      "Database scale concerns require proactive testing before staging deployment.",
      "Direct cross-functional sync between Product and Design is critical for UX signoff.",
    ];

    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return NextResponse.json({
      duration,
      transcript: mockTranscript,
      summary: mockSummary,
      actionItems: mockActionItems,
      keyInsights: mockKeyInsights,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error.message || "Failed to process meeting content" },
      { status: 500 }
    );
  }
}
