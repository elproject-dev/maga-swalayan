"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      closeButton
      icons={{
        success: (
          <CircleCheckIcon className="size-5 text-primary shrink-0" />
        ),
        info: (
          <InfoIcon className="size-5 text-primary shrink-0" />
        ),
        warning: (
          <TriangleAlertIcon className="size-5 text-amber-500 shrink-0" />
        ),
        error: (
          <OctagonXIcon className="size-5 text-destructive shrink-0" />
        ),
        loading: (
          <Loader2Icon className="size-5 animate-spin text-primary shrink-0" />
        ),
      }}
      style={
        {
          "--normal-bg": "#ffffff",
          "--normal-text": "var(--primary)",
          "--normal-border": "color-mix(in oklch, var(--primary) 20%, transparent)",
          "--border-radius": "12px",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "!bg-white !text-primary !border !border-primary/20 !shadow-xl rounded-xl p-4",
          title: "!text-primary font-bold text-sm",
          description: "!text-primary/80 text-xs mt-0.5",
          icon: "!text-primary",
          closeButton: "!bg-white !text-primary/70 hover:!text-primary !border !border-primary/20",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
