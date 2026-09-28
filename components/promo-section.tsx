import React from "react";
import { Outfit } from "next/font/google";
import Link from "next/link";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "700", "800"] });

export function PromoSection() {
  return (
    <section className="relative w-full max-w-[1440px] lg:h-[774px] flex flex-col items-center pt-16 lg:pt-[177px] pb-20 lg:pb-0 px-4 md:px-8 mx-auto overflow-hidden bg-[#FFFFFF] transition-colors">

      {/* Background Ornaments (Ellipses) */}
      <div className="absolute top-[-53px] left-[-66px] w-[550px] h-[550px] rounded-full bg-[rgba(253,8,8,0.3)] opacity-5 pointer-events-none" />
      <div className="absolute top-[164px] left-[-164px] w-[456px] h-[456px] rounded-full bg-[rgba(253,8,8,0.3)] opacity-5 pointer-events-none" />
      <div className="absolute top-[82px] left-[485px] w-[109px] h-[109px] rounded-full bg-[rgba(253,8,8,0.3)] opacity-5 pointer-events-none" />
      <div className="absolute top-[122px] right-[-17px] w-[109px] h-[109px] rounded-full bg-[rgba(253,8,8,0.3)] opacity-5 pointer-events-none" />



      {/* Main Text Content (Frame 2) */}
      <div className={`relative flex flex-col lg:block items-center w-full max-w-[882px] lg:w-[816px] lg:h-[363px] mx-auto ${outfit.className} z-10`}>
        
        {/* Tukarkan Poin Anda Sekarang */}
        <h2 className="lg:absolute lg:top-0 lg:left-[-33px] lg:w-[882px] lg:h-[81px] text-3xl sm:text-5xl lg:text-[64px] font-bold lg:leading-[81px] text-[#1E1E1E] text-center mb-6 lg:mb-0 whitespace-normal md:whitespace-nowrap transition-colors">
          Tukarkan Poin Anda Sekarang
        </h2>

        {/* Icon Poin (Vector) */}
        <div
          className="lg:absolute lg:top-[25.34%] lg:left-[41.18%] lg:w-[14.33%] lg:h-[32.24%] w-24 h-24 rotate-[-15deg] bg-no-repeat bg-center bg-contain pointer-events-none mb-6 lg:mb-0"
          style={{ backgroundImage: "url('/icon-poin.png')" }}
        />

        {/* Dapatkan Potongan Harga hanya di MAGA SWALAYAN */}
        <p className="lg:absolute lg:top-[243px] lg:left-[13px] lg:w-[791px] lg:h-[120px] text-xl sm:text-3xl lg:text-[48px] font-bold leading-snug lg:leading-[60px] text-center text-[#232323] transition-colors">
          Dapatkan Potongan Harga hanya di{" "}
          <span className="block md:inline font-[800] text-[#FC0A08] mt-1 md:mt-0">MAGA SWALAYAN</span>
        </p>
      </div>

      {/* Action Buttons (Group 2) */}
      <div className={`flex flex-row flex-wrap justify-center gap-4 lg:gap-[29px] mt-12 lg:mt-0 lg:absolute lg:top-[577px] lg:left-[568px] lg:w-[297px] lg:h-[39px] z-20 drop-shadow-[0px_4px_4px_rgba(0,0,0,0.25)] ${outfit.className}`}>
        {/* Button 1 (Red) */}
        <Link href="/member">
          <button className="flex justify-center items-center px-5 py-3 w-[130px] h-[39px] bg-[#FC0A08] shadow-[0px_2px_4px_rgba(0,0,0,0.25)] rounded-full hover:opacity-90 transition-opacity">
            <span className="font-normal text-[12px] leading-[15px] text-[#F5F5F5] whitespace-nowrap">Tukarkan Poin</span>
          </button>
        </Link>

        {/* Button 2 (White) */}
        <button className="flex justify-center items-center px-5 py-3 w-[138px] h-[39px] bg-[#FFFFFF] shadow-[0px_2px_4px_rgba(0,0,0,0.25)] rounded-full hover:bg-zinc-50 transition-colors">
          <span className="font-normal text-[12px] leading-[15px] text-[#434343] whitespace-nowrap">Lihat Reward</span>
        </button>
      </div>

      {/* Illustrations */}
      <div className="w-full flex flex-col xl:block items-center mt-16 xl:mt-0 gap-12 pointer-events-none">

        {/* undraw_shopping-app_b80f 1 */}
        <div className="relative xl:absolute xl:top-[347px] xl:left-[120px] w-[200px] h-[166px] md:w-[276px] md:h-[230px] z-10">
          <div
            className="w-full h-full bg-no-repeat bg-center bg-contain"
            style={{ backgroundImage: "url('/undraw_shopping-app_b80f.svg')" }}
          />
        </div>

        {/* undraw_shopping-bags_nfsf 1 */}
        <div className="hidden xl:block relative xl:absolute xl:top-[366px] xl:right-[62px] w-[240px] h-[167px] md:w-[327px] md:h-[228px] z-10">
          <div
            className="w-full h-full bg-no-repeat bg-center bg-contain"
            style={{ backgroundImage: "url('/undraw_shopping-bags_nfsf.svg')" }}
          />
        </div>

      </div>
    </section>
  );
}
