"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { TopBar } from "@/components/top-bar";
import { Banner } from "@/components/banner";
import { ActionButtons } from "@/components/action-buttons";
import { PromoSection } from "@/components/promo-section";
import { LoadingSpinner } from "@/components/loading-spinner";
import { ChevronDown } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        router.replace("/home");
      } else {
        setIsCheckingSession(false);
      }
    };
    checkUser();
  }, [router]);

  if (isCheckingSession) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50">
        <LoadingSpinner text="Memuat..." />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#FDFDFD] flex flex-col items-center overflow-x-hidden relative transition-colors">
      
      {/* TopBar (Sembunyikan untuk sementara) */}
      <div className="hidden w-full shrink-0 z-50">
        <TopBar />
      </div>

      {/* Main Content Area */}
      <main className="relative w-full max-w-[1440px] flex flex-col items-center pt-16 md:pt-24 lg:pt-[177px] pb-20 px-4 md:px-8">
        
        {/* Banner Section */}
        <Banner />

        {/* Action Buttons */}
        <div className="mt-8 lg:mt-[37px] z-20">
          <ActionButtons />
        </div>

        {/* Illustrations Container */}
        <div className="w-full flex flex-col xl:block items-center mt-16 xl:mt-0 gap-12 pointer-events-none">
          
          {/* undraw_deep-work_muov 1 */}
          <div className="hidden xl:block relative xl:absolute xl:top-[383px] xl:left-[64px] w-[200px] h-[171px] md:w-[244px] md:h-[209px] z-10">
            <div 
              className="w-full h-full bg-no-repeat bg-center bg-contain"
              style={{ backgroundImage: "url('/undraw_deep-work_muov.svg')" }}
            />
          </div>

          {/* undraw_mobile-office_w861 1 */}
          <div className="relative xl:absolute xl:top-[181px] xl:right-0 w-[280px] h-[330px] md:w-[375px] md:h-[440px] z-10">
            <div 
              className="w-full h-full bg-no-repeat bg-center bg-contain"
              style={{ backgroundImage: "url('/undraw_mobile-office_w861.svg')" }}
            />
          </div>
          
        </div>

        {/* Scroll Indicator */}
        <div className="w-full flex justify-center mt-4 md:mt-8 mb-4 z-20">
          <div className="flex flex-col items-center animate-bounce text-[#FC0A08]/70">
            <ChevronDown className="w-10 h-10 stroke-[2.5]" />
          </div>
        </div>
      </main>

      {/* Second Section: Promo / Points */}
      <PromoSection />
      
    </div>
  );
}
