"use client";

import IntentWizard from "@/components/intent/IntentWizard";

export default function IntentPage() {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="w-full">
                <IntentWizard />
            </div>
        </div>
    );
}
