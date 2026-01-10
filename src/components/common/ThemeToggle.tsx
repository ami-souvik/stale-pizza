"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/helper";

export default function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const currentTheme = theme === "system" ? systemTheme : theme;

  return (
    <label aria-label="Toggle theme" className={cn("group inline-flex items-center space-x-2 cursor-pointer", className)}>
      <input type="checkbox" value="" className="sr-only" checked={currentTheme === "light"} onChange={() => setTheme(currentTheme === "dark" ? "light" : "dark")} />
      <div className="relative w-6 h-6 peer rounded-full overflow-hidden">
        <div
          className="
            absolute w-6 h-12 bg-sky-900
            transition-transform duration-500 ease-in-out
            -translate-y-[24px]
            group-has-[:checked]:translate-y-0
          "
        >
          <div className="
              w-6 h-6 bg-yellow-600 rounded-full
              flex items-center justify-center
              transition-transform duration-500 ease-in-out
              scale-0
              group-has-[:checked]:scale-100
            ">
            <Sun
              className="
                w-4 h-4 text-white
                transition-transform duration-700 ease-in-out
                -translate-y-[24px]
                group-has-[:checked]:translate-y-0
              "
            />
          </div>
          <div className="
              w-6 h-6 flex items-center justify-center
              transition-transform duration-500 ease-in-out
              scale-100
              group-has-[:checked]:scale-0
            ">
            <Moon
              className="
                w-4 h-4 text-white
                transition-transform duration-1000 ease-in-out
                group-has-[:checked]:translate-y-[12px]
              "
            />
          </div>
        </div>
      </div>
    </label>
  );
}
