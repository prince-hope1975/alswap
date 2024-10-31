"use client";
import { Moon, Sun } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Switch } from "~/components/ui/switch";
import WalletMenu from "./wallet-menu";

const Navbar = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    setIsDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  return (
    <nav className="flex items-center justify-between dark:bg-slate-800 dark:text-white">
      <div className="flex items-center">
        <Image width={60} height={60} src="/alswap.png" alt="logo" />
        <span>AlSwap</span>
      </div>
      <div className="px-2 flex">
        <WalletMenu  />
        <ThemeToggle isDark={isDarkMode} onToggle={setIsDarkMode} />
      </div>
    </nav>
  );
};
const ThemeToggle = ({
  isDark,
  onToggle,
}: {
  isDark: boolean;
  onToggle: (...ant: any) => unknown;
}) => (
  <div className="flex items-center space-x-2">
    <Sun className="h-4 w-4" />
    <Switch checked={isDark} onCheckedChange={onToggle} />
    <Moon className="h-4 w-4" />
  </div>
);

export default Navbar;
