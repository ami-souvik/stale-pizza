"use client";

export default function ObjectLayout({ 
    children 
}: { 
    children: React.ReactNode
}) {
    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 overflow-hidden relative">
                {children}
            </div>
        </div>
    );
}
