"use client";

import { use } from 'react';
import FormList from '@/components/forms/FormList';

export default function FormsPage({ params }: { params: Promise<{ id: string, objectId: string }> }) {
    const { id, objectId } = use(params);

    return (
        <div className="h-full p-6 bg-highlight overflow-auto">
            <FormList appId={id} objectId={objectId} />
        </div>
    );
}
