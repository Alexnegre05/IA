"use client";

import { useMemo, useState } from "react";

// Tipo de mensaje usado en el frontend
type ChatMsg = { speaker: "openai" | "llama"; content: string };

/**
 * Componente principal de la página
 */
export default function Home() {
  /**
   * Estados del componente
   */
  const [topic, setTopic] = useState("CSS flexbox y diseño responsive");
  const [history, setHistory] = useState<ChatMsg[]>([]);
  const [turn, setTurn] = useState<"openai" | "llama">("openai");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Límite máximo de mensajes
  const MAX_TURNS = 10;

  /**
   * Título dinámico
   */
  const title = useMemo(() => {
    return `Conversación LLM vs LLM · Turno: ${history.length} / ${MAX_TURNS}`;
  }, [history.length]);

  /**
   * FUNCIÓN PRINCIPAL
   * Controla la lógica de turnos y el límite de 10 mensajes
   */
  async function nextTurn() {
    // 1. Validar si ya se llegó al límite
    if (history.length >= MAX_TURNS) {
      alert("Se ha alcanzado el límite de 10 mensajes.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 2. Elegir endpoint
      const endpoint = turn === "openai" ? "/api/openai-turn" : "/api/llama-turn";

      // 3. Llamada al backend
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history, topic }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }

      const msg = (await res.json()) as ChatMsg;

      // 4. Actualizar historial y cambiar turno
      setHistory((h) => [...h, msg]);
      setTurn((t) => (t === "openai" ? "llama" : "openai"));
      
    } catch (e: any) {
      setError(e?.message ?? "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Reinicia la conversación
   */
  function reset() {
    setHistory([]);
    setTurn("openai");
    setError(null);
  }

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 22, marginBottom: 8 }}>{title}</h1>

      <p style={{ marginTop: 0, opacity: 0.8 }}>
        La conversación se detendrá automáticamente al llegar a los 10 mensajes.
      </p>

      {/* Controles */}
      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Tema inicial"
          style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
          disabled={loading || history.length > 0}
        />

        <button
          onClick={() => nextTurn()}
          // El botón se deshabilita si está cargando O si ya llegó a 10
          disabled={loading || history.length >= MAX_TURNS}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #ccc",
            cursor: (loading || history.length >= MAX_TURNS) ? "not-allowed" : "pointer",
            backgroundColor: history.length >= MAX_TURNS ? "#f0f0f0" : "#fff"
          }}
        >
          {loading ? "Generando..." : history.length >= MAX_TURNS ? "Límite alcanzado" : "Siguiente turno"}
        </button>

        <button
          onClick={reset}
          disabled={loading}
          style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #ccc", cursor: "pointer" }}
        >
          Reset
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: 12, borderRadius: 8, border: "1px solid #f99", marginBottom: 12, color: "#d33" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Chat */}
      <div style={{
        minHeight: 360,
        padding: 12,
        borderRadius: 12,
        border: "1px solid #ddd",
        background: "#fafafa",
        overflowY: "auto"
      }}>
        {history.length === 0 ? (
          <div style={{ opacity: 0.6 }}>Pulsa “Siguiente turno” para comenzar.</div>
        ) : (
          history.map((m, i) => (
            <div key={i} style={{
              marginBottom: 10,
              padding: 10,
              borderRadius: 10,
              border: "1px solid #e5e5e5",
              background: m.speaker === "openai" ? "#f0f7ff" : "white",
              marginLeft: m.speaker === "openai" ? "20px" : "0",
              marginRight: m.speaker === "llama" ? "20px" : "0",
            }}>
              <div style={{ fontSize: 11, fontWeight: "bold", opacity: 0.7, marginBottom: 4 }}>
                {m.speaker.toUpperCase()}
              </div>
              <div style={{ whiteSpace: "pre-wrap" }}>{m.content}</div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}