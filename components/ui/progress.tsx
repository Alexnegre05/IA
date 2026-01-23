"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

// Modificamos la interfaz para aceptar 'indicatorClassName'
interface CustomProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  indicatorClassName?: string;
}

// Cambiamos React.ElementRef<typeof ProgressPrimitive.Root> por React.ElementRef<typeof ProgressPrimitive.Root>
const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  CustomProgressProps
>(({ className, value, indicatorClassName, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      // Usamos 'indicatorClassName' aquí para aplicar tus estilos dinámicos
      className={cn(
        "h-full w-full flex-1 transition-transform duration-500 ease-in-out",
        // Estilo por defecto si no se pasa 'indicatorClassName'
        "bg-primary", 
        indicatorClassName 
      )}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }