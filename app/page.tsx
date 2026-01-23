"use client";

// Importaciones de Shadcn UI necesarias
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
// Asegúrate de que el path a ChatBubble sea correcto
import { ChatBubble } from "@/components/ui/chart-bubble"; 

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, MessageSquare, RefreshCw, Zap } from "lucide-react";

// Tipo de mensaje usado en el frontend
type ChatMsg = { speaker: "openai" | "llama"; content: string };

export default function Home() {
  const [topic, setTopic] = useState("explicame algo sobre star wars");
  const [history, setHistory] = useState<ChatMsg[]>([]);
  const [turn, setTurn] = useState<"openai" | "llama">("openai");
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Asegúrate de que esto es HTMLDivElement, no HTMLDivSement como en el ejemplo anterior
  const chatRef = useRef<HTMLDivElement>(null); 
  const MAX_TURNS = 10;

  const progressValue = useMemo(() => (history.length / MAX_TURNS) * 100, [history.length, MAX_TURNS]);

  /**
   * Inicia la conversación (UN SOLO CLICK)
   */
  function startConversation() {
    if (running || history.length > 0) return;
    setRunning(true);
  }

  /**
   * Lógica automática de turnos
   */
  useEffect(() => {
    if (!running) return;
    if (history.length >= MAX_TURNS) {
      setRunning(false);
      return;
    }

    async function generateTurn() {
      setLoading(true);
      setError(null);

      try {
        const endpoint =
          turn === "openai" ? "/api/openai-turn" : "/api/llama-turn";

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

        setHistory((h) => [...h, msg]);
        setTurn((t) => (t === "openai" ? "llama" : "openai"));
      } catch (e: any) {
        setError(e?.message ?? "Error desconocido");
        setRunning(false);
      } finally {
        setLoading(false);
      }
    }

    const timeout = setTimeout(generateTurn, 800);
    return () => clearTimeout(timeout);
  }, [running, history.length, turn, topic]);

  /**
   * Scroll automático al último mensaje
   */
  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [history]);

  /**
   * Reset
   */
  function reset() {
    setHistory([]);
    setTurn("openai");
    setRunning(false);
    setError(null);
  }

  return (
    // Contenedor principal con estética moderna
    <main className="max-w-4xl mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
      
      {/* Header y Progreso */}
      <Card className="p-6 mb-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold flex items-center text-gray-800">
            <MessageSquare className="mr-3 h-6 w-6 text-blue-600" />
            Conversación LLM vs LLM
          </h1>
          <Badge variant="secondary" className="text-sm">
            {history.length} / {MAX_TURNS} turnos
          </Badge>
        </div>
        {/* Barra de progreso personalizada */}
        <Progress 
          value={progressValue} 
          className="w-full h-2" 
          indicatorClassName={running ? "bg-blue-500 animate-pulse" : (history.length === MAX_TURNS ? "bg-green-500" : "bg-gray-200")} 
        />
      </Card>


      {/* Controles */}
      <div className="flex gap-3 mb-6">
        <Input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Tema inicial de la conversación"
          disabled={running || history.length > 0}
          className="flex-1 shadow-sm"
        />

        <Button
          onClick={startConversation}
          disabled={running || history.length > 0}
          variant={running || history.length > 0 ? "outline" : "default"}
          className="shadow-sm"
        >
          <Zap className={`mr-2 h-4 w-4 ${running ? 'animate-spin' : ''}`} />
          {running ? "En curso..." : "Iniciar"}
        </Button>

        <Button
          onClick={reset}
          disabled={loading}
          variant="secondary"
          className="shadow-sm"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error de conexión</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Área del Chat - Eliminando las 2 columnas y centralizando */}
      <Card
        ref={chatRef}
        // Estilo moderno de contenedor de chat
        className="h-[500px] p-6 bg-white shadow-xl overflow-y-auto flex flex-col gap-4 border-b-0 rounded-b-none"
      >
        {history.map((msg, i) => (
          // Usando el ChatBubble moderno que creaste antes
          <ChatBubble key={i} speaker={msg.speaker} content={msg.content} />
        ))}
      </Card>

      {/* Footer / Indicadores */}
      <div className="mt-0 p-4 bg-white border-t rounded-b-lg shadow-xl text-sm text-center text-muted-foreground">
        {running && (
          <p className="opacity-70 animate-pulse">
            {turn === 'openai' ? '🤖 OpenAI' : '🦙 LLaMA'} está escribiendo…
          </p>
        )}

        {!running && history.length === MAX_TURNS && (
          <p className="opacity-60">Conversación finalizada.</p>
        )}
        {!running && history.length === 0 && (
           <p className="opacity-80">Pulsa "Iniciar" para comenzar la conversación automática.</p>
        )}
      </div>
    </main>
  );
}