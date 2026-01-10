"use client";

import { use, useEffect, useState } from 'react';
import FormBuilder from '@/components/builder/FormBuilder';
import api from '@/lib/api/client';
import type { Table, App } from '@/lib/types';

export default function FormBuilderPage({ params }: { params: Promise<{ id: string, objectId: string, formId: string }> }) {
    const { id, objectId, formId } = use(params);
    const [object, setObject] = useState<Table | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTool = async () => {
            try {
                const response = await api.get(`/tools/${id}/`);
                const found = response.data.app_objects.find((o: Table) => o.id.toString() === objectId);
                setObject(found || null);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTool();
    }, [id, objectId]);

    if (loading) return <div className="p-10 text-center">Loading builder...</div>;
    if (!object) return <div className="p-10 text-center">Object not found</div>;

    return (
        <div className="h-full bg-gray-50 flex flex-col">
            <div className="bg-white border-b px-6 py-3 flex justify-between items-center">
                <h2 className="font-semibold">Form Editor: {formId}</h2>
            </div>
            <div className="flex-1 overflow-hidden">
                <FormBuilder object={{ appId: id, id: object.id, fields: object.fields }} />
            </div>
        </div>
    );
}