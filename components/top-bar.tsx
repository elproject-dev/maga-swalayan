"use client";
import React, { useState, useEffect } from "react";
import { BiHomeSmile, BiBox, BiBarcodeReader, BiMap, BiSun, BiMoon } from "react-icons/bi";
import { MdOutlineEvent } from "react-icons/md";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { LogOutIcon, CircleUser } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

export function TopBar() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; avatar: string } | null>(null);
  const [isCheckingUser, setIsCheckingUser] = useState(true);

  useEffect(() => {
    setMounted(true);
    
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || "Pengguna",
          email: session.user.email || "",
          avatar: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || "",
        });
      } else {
        setUser({ name: "Belum Login", email: "Mode Tamu", avatar: "" });
      }
      setIsCheckingUser(false);
    };
    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (session?.user) {
        setUser({
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || "Pengguna",
          email: session.user.email || "",
          avatar: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || "",
        });
      } else {
        setUser({ name: "Belum Login", email: "Mode Tamu", avatar: "" });
      }
      setIsCheckingUser(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (user?.name === "Belum Login") {
      router.push("/login");
    } else {
      await supabase.auth.signOut();
      router.push("/");
    }
  };

  return (
    <div className="w-full h-[60px] bg-[#FFFFFF] dark:bg-zinc-950 flex items-center justify-between px-4 md:px-8 xl:px-[20px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] relative z-50 transition-colors">
      
      {/* Left side: Logo & Navigation */}
      <div className="flex items-center">
        {/* Logo */}
        <div 
          className="absolute hidden md:block w-[102.93px] h-[35px] left-[20px] top-[12px] bg-no-repeat bg-center bg-contain dark:brightness-0 dark:invert transition-all"
          style={{ backgroundImage: "url('/logo-maga2.png')" }}
        />
        {/* Mobile Logo Fallback */}
        <div 
          className="md:hidden w-[80px] h-[27px] relative shrink-0 mr-4 bg-no-repeat bg-center bg-contain dark:brightness-0 dark:invert transition-all"
          style={{ backgroundImage: "url('/logo-maga2.png')" }}
        />
        
        {/* Icon Navigation Group */}
        <div className="hidden lg:flex items-center gap-3 md:gap-5 xl:gap-[36px] lg:ml-[141px]">
          <Link href="/home" className="flex items-center justify-center hover:opacity-70 transition-opacity text-[#090814] dark:text-[#FBFBFB]">
            <BiHomeSmile className="w-6 h-6 md:w-[32.29px] md:h-[32.28px]" />
          </Link>
          <Link href="/promo" className="flex items-center justify-center hover:opacity-70 transition-opacity text-[#090814] dark:text-[#FBFBFB]">
            <BiBox className="w-6 h-6 md:w-[32.29px] md:h-[32.28px]" />
          </Link>
          <Link href="/member" className="flex items-center justify-center hover:opacity-70 transition-opacity text-[#090814] dark:text-[#FBFBFB]">
            <BiBarcodeReader className="w-6 h-6 md:w-[32.29px] md:h-[32.28px]" />
          </Link>
          <Link href="/event" className="flex items-center justify-center hover:opacity-70 transition-opacity text-[#090814] dark:text-[#FBFBFB]">
            <MdOutlineEvent className="w-6 h-6 md:w-[32.29px] md:h-[32.28px]" />
          </Link>
          <Link href="/lokasi" className="flex items-center justify-center hover:opacity-70 transition-opacity text-[#090814] dark:text-[#FBFBFB]">
            <BiMap className="w-6 h-6 md:w-[32.29px] md:h-[32.28px]" />
          </Link>
        </div>
      </div>

      {/* Right side: Theme Toggle & Avatar */}
      <div className="flex items-center gap-4 md:gap-[20px]">
        {mounted && (
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center justify-center hover:opacity-70 transition-opacity text-[#090814] dark:text-[#FBFBFB]"
          >
            {theme === 'dark' ? (
              <BiMoon className="w-5 h-5 md:w-[25px] md:h-[25px]" />
            ) : (
              <BiSun className="w-5 h-5 md:w-[25px] md:h-[25px]" />
            )}
          </button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center justify-center outline-none">
            {isCheckingUser ? (
              <div className="w-10 h-10 md:w-[50px] md:h-[50px] rounded-full bg-muted animate-pulse border-2 md:border-[3px] border-[#E0E0E0]" />
            ) : user?.name === "Belum Login" ? (
              <div className="w-10 h-10 md:w-[50px] md:h-[50px] rounded-full border-2 md:border-[3px] border-[#E0E0E0] cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-center bg-[#FDFDFD] dark:bg-zinc-800 text-[#090814] dark:text-[#FBFBFB]">
                <CircleUser className="w-6 h-6 md:w-8 md:h-8 stroke-[1.5]" />
              </div>
            ) : (
              <Avatar className="w-10 h-10 md:w-[50px] md:h-[50px] rounded-full border-2 md:border-[3px] border-[#E0E0E0] cursor-pointer hover:opacity-90 transition-opacity">
                <AvatarImage src={user?.avatar || undefined} alt={user?.name || "User"} referrerPolicy="no-referrer" />
                <AvatarFallback className="rounded-full bg-[#D9D9D9] text-[#090814]">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56 rounded-sm"
            side="bottom"
            align="end"
            sideOffset={8}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  {user?.name === "Belum Login" ? (
                    <div className="size-8 rounded-full flex items-center justify-center bg-[#FDFDFD] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[#090814] dark:text-[#FBFBFB]">
                      <CircleUser className="size-5 stroke-[1.5]" />
                    </div>
                  ) : (
                    <Avatar className="size-8">
                      <AvatarImage src={user?.avatar || undefined} alt={user?.name || "User"} referrerPolicy="no-referrer" />
                      <AvatarFallback className="rounded-full text-xs bg-[#D9D9D9] text-[#090814]">
                        {user?.name?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user?.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:bg-red-500 focus:!text-white focus:**:!text-white dark:text-red-500 dark:focus:bg-red-900">
              <LogOutIcon className="mr-2 h-4 w-4" />
              {user?.name === "Belum Login" ? "Masuk / Login" : "Keluar"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
