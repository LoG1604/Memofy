import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { meeting, question, chatHistory } = await request.json();

    const apiKey = process.env.NVIDIA_API_KEY;

    if (apiKey) {
      // ----------------------------------------------------
      // NVIDIA NIM API CHAT (OpenAI-compatible)
      // ----------------------------------------------------
      try {
        // Format meeting context
        let meetingContext = `Meeting Title: ${meeting.title}\n`;
        meetingContext += `Date: ${meeting.date}\n`;
        meetingContext += `Summary: ${meeting.summary}\n\n`;

        if (meeting.keyInsights && meeting.keyInsights.length > 0) {
          meetingContext += `Key Takeaways:\n${meeting.keyInsights.map((i: string) => `- ${i}`).join("\n")}\n\n`;
        }

        const actionItems = Array.isArray(meeting.actionItems) ? meeting.actionItems : [];
        if (actionItems.length > 0) {
          meetingContext += `Action Items:\n${actionItems
            .map((item: any) => `- [${item.completed ? "x" : " "}] ${item.text}`)
            .join("\n")}\n\n`;
        }
        if (meeting.transcript && meeting.transcript.length > 0) {
          meetingContext += `Transcript:\n${meeting.transcript
            .map((t: any) => `[${t.time}] ${t.speaker}: ${t.text}`)
            .join("\n")}\n\n`;
        }

        const systemInstruction = `You are Memofy Co-pilot, an AI assistant analyzing a meeting.
Here is the meeting data you must reference to answer questions:
---
${meetingContext}
---
Answer the user's questions truthfully and concisely using ONLY the provided meeting data. If the answer is not mentioned or cannot be inferred, politely explain that it wasn't discussed in the meeting. Do not make up facts.`;

        // Build messages array in OpenAI format
        const messages: { role: string; content: string }[] = [
          { role: "system", content: systemInstruction },
        ];

        // Add conversation history
        if (chatHistory && chatHistory.length > 0) {
          const filtered = chatHistory.filter((h: any) => h.id !== "welcome");
          for (const entry of filtered) {
            const role = entry.role === "model" ? "assistant" : "user";
            const content =
              entry.parts?.map((p: any) => p.text).join("") ?? entry.content ?? "";
            if (content) {
              messages.push({ role, content });
            }
          }
        }

        // Add current question
        messages.push({ role: "user", content: question });

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
              messages,
              temperature: 0.6,
              max_tokens: 2048,
            }),
          }
        );
        console.log("NVIDIA NIM status:", response.status, response.ok);


        if (!response.ok) {
          const errBody = await response.text();
          throw new Error(`NVIDIA NIM API error ${response.status}: ${errBody}`);
        }

        const result = await response.json();
        const responseText = result.choices?.[0]?.message?.content ?? "";

        if (responseText) {
          return NextResponse.json({ response: responseText.trim() });
        }
      } catch (nvidiaChatError: any) {
        console.error(
          "NVIDIA NIM chat error, falling back to smart mockup:",
          nvidiaChatError?.message || nvidiaChatError,
          nvidiaChatError?.response?.status
        );
      }
    }

    // ----------------------------------------------------
    // FALLBACK / SMART MOCK CHAT GENERATOR
    // ----------------------------------------------------
    const query = question.toLowerCase();
    let response = "";

    if (
      query.includes("action") ||
      query.includes("todo") ||
      query.includes("task")
    ) {
      const items = meeting.actionItems || [];
      if (items.length > 0) {
        response =
          `Here are the action items for "${meeting.title}":\n\n` +
          items
            .map(
              (item: any, idx: number) =>
                `${idx + 1}. [${item.completed ? "Completed" : "Pending"}] ${item.text}`
            )
            .join("\n");
      } else {
        response = "There are no action items registered for this meeting.";
      }
    } else if (
      query.includes("summary") ||
      query.includes("outcome") ||
      query.includes("conclusion")
    ) {
      response = `Here is the executive summary for this meeting:\n\n${meeting.summary || "No summary available."}`;
    } else if (
      query.includes("takeaway") ||
      query.includes("insight") ||
      query.includes("key point")
    ) {
      const insights = meeting.keyInsights || [];
      if (insights.length > 0) {
        response =
          `Here are the key takeaways from "${meeting.title}":\n\n` +
          insights.map((ins: string) => `• ${ins}`).join("\n");
      } else {
        response = "No key insights were extracted for this meeting.";
      }
    } else if (
      query.includes("who") ||
      query.includes("speaker") ||
      query.includes("alex") ||
      query.includes("taylor") ||
      query.includes("jordan") ||
      query.includes("sarah") ||
      query.includes("dave") ||
      query.includes("elena")
    ) {
      const transcript = meeting.transcript || [];
      if (transcript.length > 0) {
        response = `Looking at the transcript, here are the details about the participants:\n\n`;
        const speakers = Array.from(
          new Set(transcript.map((t: any) => t.speaker))
        );
        response += `Participants identified: ${(speakers as string[]).join(", ")}.\n\n`;

        let specificSpeaker = "";
        if (query.includes("alex")) specificSpeaker = "Alex";
        else if (query.includes("taylor")) specificSpeaker = "Taylor";
        else if (query.includes("jordan")) specificSpeaker = "Jordan";
        else if (query.includes("sarah")) specificSpeaker = "Sarah";
        else if (query.includes("dave")) specificSpeaker = "Dave";
        else if (query.includes("elena")) specificSpeaker = "Elena";

        if (specificSpeaker) {
          const lines = transcript.filter((t: any) =>
            t.speaker.toLowerCase().includes(specificSpeaker.toLowerCase())
          );
          if (lines.length > 0) {
            response +=
              `Here is what ${specificSpeaker} said during the meeting:\n` +
              lines
                .map((l: any) => `• [${l.time}] ${l.text}`)
                .join("\n");
          } else {
            response += `I couldn't find any direct statements from ${specificSpeaker} in this session transcript.`;
          }
        } else {
          response +=
            "Who in particular would you like to know about? (e.g., Alex, Jordan, Taylor)";
        }
      } else {
        response =
          "No speaker transcription list is available for this document.";
      }
    } else {
      response = `Regarding your question about "${meeting.title}", my analysis shows that the meeting focused on locking down the deliverables, timeline coordination, and resolving resourcing concerns. \n\nIs there a specific detail, such as action items or the transcript dialogue, you would like me to pull up?`;
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error.message || "Failed to process chat query" },
      { status: 500 }
    );
  }
}
