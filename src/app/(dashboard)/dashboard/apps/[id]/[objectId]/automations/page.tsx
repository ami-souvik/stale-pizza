"use client";

import { use } from 'react';
import AutomationList from '@/components/automations/AutomationList';

export default function AutomationsPage({ params }: { params: Promise<{ id: string, objectId: string }> }) {
    const { id, objectId } = use(params);
    return (
        <div className="h-full">
            <AutomationList toolId={id} objectId={objectId} />
        </div>
    );
}
