export function LoadingSpinner({ text = "Memuat data..." }: { text?: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center min-h-[60vh] h-full w-full animate-in fade-in duration-500">
      <div className="relative flex items-center justify-center mb-6">
        <div className="absolute w-16 h-16 border-4 border-orange-500/30 dark:border-white/20 border-t-orange-500 dark:border-t-white border-b-orange-500 dark:border-b-white rounded-full animate-spin"></div>
        <div className="absolute w-12 h-12 border-4 border-orange-400/30 dark:border-white/20 border-l-orange-400 dark:border-l-white border-r-orange-400 dark:border-r-white rounded-full animate-[spin_1.5s_linear_infinite_reverse]"></div>
        <div className="w-6 h-6 bg-orange-500 dark:bg-white rounded-full animate-pulse shadow-[0_0_20px_rgba(249,115,22,0.8)] dark:shadow-[0_0_20px_rgba(255,255,255,0.6)]"></div>
      </div>
      <p className="text-orange-600/80 dark:text-white/80 font-medium tracking-wide animate-pulse">{text}</p>
    </div>
  )
}
