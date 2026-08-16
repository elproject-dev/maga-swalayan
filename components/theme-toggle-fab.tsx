"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { Moon, Sun, MapPin, X, Plus } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

export function ThemeToggleFab() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [isOpen, setIsOpen] = React.useState(false)
  const constraintsRef = React.useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || pathname === "/") return null

  return (
    <>
      {/* Container untuk membatasi area drag */}
      <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-50 md:hidden" />
      
      <motion.div
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        dragMomentum={false}
        whileDrag={{ scale: 1.05, cursor: "grabbing" }}
        className="md:hidden fixed z-50 bottom-24 right-4 flex flex-col-reverse items-center gap-3"
      >
        {/* Main Floating Button */}
        <button
          onClick={(e) => {
            // Only trigger if it wasn't a drag event
            setIsOpen(!isOpen)
          }}
          className="h-14 w-14 bg-white/30 dark:bg-zinc-900/30 backdrop-blur-md text-zinc-900 dark:text-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-none cursor-pointer pointer-events-auto"
          aria-label="Menu"
        >
          <motion.div animate={{ rotate: isOpen ? 135 : 0 }} transition={{ duration: 0.2 }}>
            <Plus className="h-6 w-6" />
          </motion.div>
        </button>

        {/* Expanding Menu Items */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center gap-3 pointer-events-auto"
            >
              {/* Button Ganti Tema */}
              <button
                onClick={() => {
                  setTheme(theme === "dark" ? "light" : "dark")
                  setIsOpen(false)
                }}
                className="h-12 w-12 bg-white/30 dark:bg-zinc-900/30 backdrop-blur-md text-zinc-900 dark:text-white rounded-full flex items-center justify-center shadow-lg border-none cursor-pointer"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
              
              {/* Button Lokasi */}
              <button
                onClick={() => {
                  setIsOpen(false)
                  router.push("/lokasi")
                }}
                className="h-12 w-12 bg-white/30 dark:bg-zinc-900/30 backdrop-blur-md text-zinc-900 dark:text-white rounded-full flex items-center justify-center shadow-lg border-none cursor-pointer"
                aria-label="Lokasi"
              >
                <MapPin className="h-5 w-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  )
}
