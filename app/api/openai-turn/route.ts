import OpenAI from "openai";
import { NextResponse } from "next/server";

type ChatMsg = { speaker: "openai" | "llama"; content: string };

export async function POST(req: Request) {
  try {
    const { history, topic } = (await req.json()) as {
      history: ChatMsg[];
      topic?: string;
    };

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Convertimos el historial a un bloque de texto simple (minimalista para FP)
    const transcript =
      history?.length
        ? history
            .map((m) => `${m.speaker.toUpperCase()}: ${m.content}`)
            .join("\n")
        : "";

    // Responses API (recomendado)
    const resp = await client.responses.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:

            "Responde en 1 frase, habla como un sith que esta hablando con un jedi.",
        },
        {
          role: "user",
          content:
            transcript.length > 0
              ? `Conversación hasta ahora:\n${transcript}\n\nAhora te toca hablar. Continúa.`
              : `Inicia una conversación con otro LLM sobre este tema: "${topic ?? "tecnología"}".`,
        },
      ],
    });

    // Extraemos texto de salida (simple)
    const text = resp.output_text?.trim() || "(sin respuesta)";

    return NextResponse.json({
      speaker: "openai",
      content: text,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "OpenAI error" },
      { status: 500 }
    );
  }
}
