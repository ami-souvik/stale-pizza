"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/routes";

export function NavLinks({ appId }: { appId: string }) {
    const pathname = usePathname();
    return (
        <>
            {navItems.map((item) => {
                const href = item.getHref(appId);
                const isActive = pathname === href;

                return (
                    <Link
                        key={item.id}
                        href={href}
                        className={`px-4 py-3 text-xs transition-all duration-200 border-b-2 ${isActive
                            ? "border-cyan-500 text-white font-medium"
                            : "border-transparent text-zinc-400 hover:text-zinc-200"
                            }`}
                    >
                        {item.label}
                    </Link>
                );
            })}
        </>
    );
}