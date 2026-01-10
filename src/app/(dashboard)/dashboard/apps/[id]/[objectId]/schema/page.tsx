"use client";

import { use, useEffect, useState } from 'react';
import SchemaEditor from '@/components/builder/SchemaEditor';
import api from '@/lib/api/client';
import type { Table, App } from '@/lib/types';

export default function SchemaPage({ params }: { params: Promise<{ id: string, objectId: string }> }) {
    const { id, objectId } = use(params);
    const [tool, setTool] = useState<App | null>(null);
    const [object, setObject] = useState<Table | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTool = async () => {
            try {
                const response = await api.get(`/tools/${id}/`);
                setTool(response.data);
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

    if (loading) return <div className="p-10 text-center">Loading schema...</div>;
    if (!object) return <div className="p-10 text-center">Object not found</div>;

    return (
        <div className="h-full bg-gray-50">
            <SchemaEditor object={{ appId: id, id: object.id, fields: object.fields }} />
        </div>
    );
}