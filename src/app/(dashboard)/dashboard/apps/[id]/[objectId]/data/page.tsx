"use client";

import { use } from 'react';
import DataGrid from '@/components/data/DataGrid';

export default function DataPage({ params }: { params: Promise<{ id: string, objectId: string }> }) {
    const { id, objectId } = use(params);
    return (
        <DataGrid toolId={id} objectId={objectId} />
    );
}