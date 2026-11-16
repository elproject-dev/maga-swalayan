import React from "react";
import { Outfit } from "next/font/google";

const outfit = Outfit({ subsets: ["latin"], weight: ["400"] });

import Link from "next/link";

export function ActionButtons() {
  return (
    <div className={`flex flex-row flex-wrap gap-4 lg:gap-[22px] justify-center drop-shadow-[0px_4px_4px_rgba(0,0,0,0.25)] ${outfit.className}`}>
      {/* Button 1 (Red) */}
      <Link href="/login">
        <button className="flex flex-row justify-center items-center px-[20px] py-[12px] w-[137px] h-[39px] bg-[#FC0A08] shadow-[0px_2px_4px_rgba(0,0,0,0.25)] rounded-[100px] hover:opacity-90 transition-opacity">
          <span className="w-[97px] h-[15px] font-normal text-[12px] leading-[15px] text-[#F5F5F5] text-center whitespace-nowrap">
            Gabung Sekarang
          </span>
        </button>
      </Link>

      {/* Button 2 (White) */}
      <Link href="/home">
        <button className="flex flex-row justify-center items-center px-[20px] py-[12px] w-[145px] h-[39px] bg-[#FFFFFF] shadow-[0px_2px_4px_rgba(0,0,0,0.25)] rounded-[100px] hover:bg-zinc-50 transition-colors">
          <span className="w-[105px] h-[15px] font-normal text-[12px] leading-[15px] text-[#434343] text-center whitespace-nowrap">
            Lihat Semua Promo
          </span>
        </button>
      </Link>
    </div>
  );
}
