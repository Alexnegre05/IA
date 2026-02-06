"use client";
import React, { useState, useEffect, useRef } from 'react'; // Línea 1 corregida: import React, useState, useEffect, useRef
import { CardContent } from "@/components/ui/card"; // Línea 2 corregida: import CardContent
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// Importamos iconos de Lucide React para mejor feedback visual
import { AlertCircle, CheckCircle, Video, Loader2, UserCheck, Play, Camera } from "lucide-react"; // También he corregido esta línea, que estaba incompleta en el texto de la imagen
// Definimos los estados de nuestra máquina de estados, añadiendo 'camera_active'
type AppState = 'loading' | 'idle' | 'camera_active' | 'scanning' | 'success' | 'error' | 'denied';

export default function FaceCam() {
  const [appState, setAppState] = useState<AppState>('loading');
  const [progress, setProgress] = useState(0);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isDoorOpen, setIsDoorOpen] = useState(false); // Estado para la animación de la puerta

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simulación de carga de modelos inicial (igual que antes)
  useEffect(() => {
    const loadModels = setTimeout(() => {
      setProgress(100);
      setAppState('idle');
    }, 2000);

    return () => clearTimeout(loadModels);
  }, []);

  // useEffect para manejar el inicio y limpieza del stream de la cámara (igual que antes)
  useEffect(() => {
    const cameraIsActive = appState === 'camera_active' || appState === 'scanning';
    if (!cameraIsActive) return;

    const setupCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
            mediaStreamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

        } catch (err) {
            console.error("Error accessing camera: ", err);
            setAppState('denied');
        }
    };

    setupCamera();

    return () => {
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
    }
  }, [appState]);

  // useEffect de simulación de reconocimiento (igual que antes)
  useEffect(() => {
    if (appState !== 'scanning') return;

    const scanTimer = setTimeout(() => {
        setAppState('success');
    }, 3000);

    return () => {
        clearTimeout(scanTimer);
    };
  }, [appState]);

  // Función para capturar la imagen con la animación de la puerta
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL('image/png');
        
        // Inicia el efecto de puerta: cierra, actualiza imagen y abre
        setIsDoorOpen(false); // Cierra la puerta visualmente
        setTimeout(() => {
            setCapturedImage(imageDataUrl); // Actualiza la imagen mientras está cerrada
            setIsDoorOpen(true); // Abre la puerta
        }, 300); // 300ms es la duración de la transición CSS
      }
    }
  };


  // Función para iniciar la cámara (solo cambia el estado a 'camera_active')
  const startCamera = () => {
    setAppState('camera_active');
    setCapturedImage(null); // Limpiamos la imagen anterior
    setIsDoorOpen(true); // Aseguramos que la puerta esté abierta al entrar en este estado
  };

  // Función para iniciar el reconocimiento (solo cambia el estado a 'scanning')
  const startRecognition = () => {
    setAppState('scanning');
  };

  // Renderizado condicional basado en el estado
  const renderContent = () => {
    switch (appState) {
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center h-full p-6 bg-gray-800 text-gray-100">
            <Loader2 className="h-10 w-10 animate-spin text-yellow-400 mb-4" /> {/* Cambiado a amarillo */}
            <p className="text-gray-400">Cargando modelos de IA...</p>
            <Progress value={progress} className="w-full mt-4 bg-gray-700" indicatorClassName="bg-yellow-500" /> {/* Cambiado a amarillo */}
          </div>
        );
      
      case 'denied':
        return (
          <Alert variant="destructive" className="m-4 bg-red-900 border-red-700 text-red-100">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertTitle>Permiso de cámara denegado</AlertTitle>
            <AlertDescription>
              Necesitamos acceso a tu cámara. Por favor, revisa la configuración de tu navegador.
            </AlertDescription>
            <Button onClick={() => setAppState('idle')} className="mt-4 bg-yellow-600 hover:bg-yellow-700 text-black">Reintentar</Button>
          </Alert>
        );
      
      case 'idle':
        return (
          <div className="flex flex-col items-center justify-center h-full p-6 bg-gray-800 text-gray-100">
            <Video className="h-16 w-16 text-gray-500 mb-4" />
            <p className="text-gray-400 mb-4">Cámara lista. Elige una opción.</p>
            <div className="flex gap-4">
              <Button onClick={startCamera} className="bg-yellow-600 hover:bg-yellow-700 text-black">Iniciar Cámara</Button>
            </div>
          </div>
        );

      case 'camera_active':
        return (
            // Contenedor principal flex para dividir la pantalla 50/50
            <div className="relative h-full w-full flex bg-gray-900">
                {/* Lado Izquierdo: Cámara (50% del ancho) */}
                <div className="w-1/2 relative">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    
                    {/* Controles y botón de Captura */}
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gray-900/70 text-center w-full flex justify-center gap-4">
                        <Button onClick={startRecognition} className="bg-blue-600 hover:bg-blue-700 flex items-center">
                            <Play className="w-4 h-4 mr-2" />
                            Iniciar Reconocimiento
                        </Button>
                        <Button onClick={captureImage} className="bg-yellow-600 hover:bg-yellow-700 text-black flex items-center">
                            <Camera className="w-4 h-4 mr-2" />
                            Capturar Imagen
                        </Button>
                    </div>
                </div>

                {/* Lado Derecho: Recuadro de Imagen Capturada (50% del ancho) */}
                <div className="w-1/2 flex items-center justify-center bg-gray-800 p-4 relative overflow-hidden">
                    {/* Overlay de la puerta corredera */}
                    <div className={`absolute inset-0 bg-yellow-900 transition-transform duration-300 ease-in-out ${isDoorOpen ? 'translate-x-full' : 'translate-x-0'}`}>
                        {/* Pequeña línea de luz amarilla en el borde de la puerta */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-400"></div>
                    </div>

                    {capturedImage ? (
                        // Muestra la imagen si existe
                        <img src={capturedImage} alt="Imagen Capturada" className="max-w-full max-h-full object-contain shadow-lg rounded-lg relative z-10" />
                    ) : (
                        // Mensaje si no hay imagen capturada
                        <p className="text-gray-500 relative z-10">Pulsa 'Capturar Imagen' para guardar un fotograma aquí.</p>
                    )}
                </div>
                
                {/* Canvas oculto para procesar la imagen */}
                <canvas ref={canvasRef} className="hidden" />
            </div>
        );

      case 'scanning':
        return (
          <div className="relative h-full w-full flex items-center justify-center bg-gray-900">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-80 border-4 border-yellow-500 rounded-full animate-pulse opacity-70" />
            </div>
            <Badge className="absolute top-4 right-4 bg-yellow-500 text-gray-900 flex items-center">
                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                Buscando rostro...
            </Badge>
             <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          </div>
        );
        
      case 'success':
        return (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-gray-800 text-gray-100">
            <UserCheck className="h-20 w-20 text-emerald-500 mb-4 animate-bounce" />
            <h2 className="text-xl font-semibold">¡Verificado!</h2>
            <p className="text-gray-400 mb-6">Tu identidad ha sido confirmada exitosamente.</p>
            <Button className="bg-emerald-600 hover:bg-emerald-700">Continuar a Vista B</Button>
          </div>
        );
      
      case 'error':
          return (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-gray-800 text-gray-100">
              <AlertCircle className="h-20 w-20 text-red-500 mb-4" />
              <h2 className="text-xl font-semibold">Error de Verificación</h2>
              <p className="text-gray-400 mb-6">No se pudo verificar el rostro. Inténtalo de nuevo.</p>
              <Button onClick={() => setAppState('idle')} className="bg-red-600 hover:bg-red-700">Reintentar</Button>
            </div>
          );
    }
  };

  return (
    <CardContent className="p-0 aspect-video h-screen w-screen overflow-x-hidden flex items-center justify-center bg-gray-800">
      {renderContent()}
    </CardContent>
  );
}