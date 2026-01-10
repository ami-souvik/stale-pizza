"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../../../lib/api/client';
import type { App } from '../../../../../lib/types';

export default function ToolPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    useEffect(() => {
        const fetchTool = async () => {
            try {
                const response = await api.get(`/tools/${id}/`);
                const tool = response.data as App;
                if (tool.app_objects.length > 0) {
                    router.replace(`/dashboard/apps/${id}/${tool.app_objects[0].id}/data`);
                }
            } catch (err) {
                console.error('Failed to load tool for redirect');
            }
        };
        fetchTool();
    }, [id, router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );
}