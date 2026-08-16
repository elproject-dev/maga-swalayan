"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export function PWAInstallPrompt() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Manual Service Worker registration
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => console.log("Service Worker registered successfully", reg))
          .catch((err) => console.log("Service Worker registration failed: ", err));
      }

      // Cek jika event sudah ditangkap sebelumnya oleh global script (opsional)
      if ((window as any).deferredPrompt) {
        setDeferredPrompt((window as any).deferredPrompt);
        setIsInstallable(true);
      }

      if (localStorage.getItem("pwa-prompt-dismissed") === "true") {
        setIsDismissed(true);
      }

      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        (window as any).deferredPrompt = e;
        setDeferredPrompt(e);
        setIsInstallable(true);
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
      (window as any).deferredPrompt = null;
    }
  };

  const handleDismiss = () => {
    setIsInstallable(false);
    setIsDismissed(true);
    localStorage.setItem("pwa-prompt-dismissed", "true");
  };

  // Jangan tampilkan di halaman login (/)
  const showPrompt = isInstallable && !isDismissed && pathname !== "/";

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{
            type: "spring",
            stiffness: 120,
            damping: 20,
            delay: 1.5
          }}
          className="fixed top-12 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] sm:left-auto sm:right-6 sm:translate-x-0 sm:w-80 z-[9999] p-5 rounded-2xl bg-zinc-900/95 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col gap-4"
        >
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex flex-col items-center text-center gap-3 mt-2">
            <div className="w-16 h-16 flex items-center justify-center">
              <img src="/logo.png" alt="Logo Maga Swalayan" className="w-full h-full object-contain drop-shadow-md" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white mb-1">
                Install Maga Swalayan
              </h4>
              <p className="text-xs text-zinc-400">Install Maga Swalayan ke perangkat</p>
              <p className="text-xs text-zinc-400">Dapatkan promo belanja menarik lainnya.</p>
            </div>
          </div>

          <button
            onClick={handleInstallClick}
            className="w-full py-2.5 mt-1 text-sm font-bold bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-colors shadow-lg shadow-yellow-500/20"
          >
            Install Sekarang
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
