"use client";

import { useEffect, useState, use, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { RiDeleteBin7Line, RiAddLine } from 'react-icons/ri';
import { BiSolidDashboard } from "react-icons/bi";
import Header from '@/components/common/Header';
import Logo from '@/components/common/Logo';
import IconButton from '@/components/action/IconButton';
import api from '@/lib/api/client';
import { useToast } from '@/providers/ToastProvider';
import type { App, Table } from '@/lib/types';
import { cn } from '@/lib/helper';
import ThemeToggle from '@/components/common/ThemeToggle';
import Modal from '@/components/common/Modal';
import ObjectForm from '@/components/tools/ObjectForm';

export default function ToolLayout({
    children,
    params
}: {
    children: React.ReactNode,
    params: Promise<{ id: string }>
}) {
    const { id } = use(params);
    const router = useRouter();
    const pathname = usePathname();
    const [tool, setTool] = useState<App | null>(null);
    const [loading, setLoading] = useState(true);
    const [isObjectModalOpen, setIsObjectModalOpen] = useState(false);
    const { success, error } = useToast();

    const fetchTool = useCallback(async () => {
        try {
            const response = await api.get(`/tools/${id}/`);
            setTool(response.data);
        } catch {
            error('Failed to load tool');
        } finally {
            setLoading(false);
        }
    }, [id, error]);

    useEffect(() => {
        fetchTool();
    }, [fetchTool]);

    const handleAppDelete = async () => {
        if (!confirm('Delete this app?')) return;
        try {
            await api.delete(`/tools/${id}/`);
            success('App deleted');
            router.push('/dashboard');
        } catch {
            error('Failed to delete app');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!tool) return <div>Tool not found</div>;

    // Determine current object ID from URL if present
    // URL structure: /dashboard/apps/[id]/[objectId]/...
    const pathParts = pathname.split('/');
    const currentObjectId = pathParts.length > 4 ? pathParts[4] : (tool.app_objects[0]?.id.toString() || null);

    const mainTabs = currentObjectId ? [
        { name: 'Data', href: `/dashboard/apps/${id}/${currentObjectId}/data` },
        { name: 'Form', href: `/dashboard/apps/${id}/${currentObjectId}/forms` },
        { name: 'Automations', href: `/dashboard/apps/${id}/${currentObjectId}/automations` },
        { name: 'Object', href: `/dashboard/apps/${id}/${currentObjectId}/schema` },
        { name: 'Docs', href: `/dashboard/apps/${id}/${currentObjectId}/docs` },
    ] : [];

    return (
        <div className="min-h-screen flex flex-col">
            <Header>
                <div className="flex items-center space-x-2">
                    <Link href="/dashboard">
                        <Logo className="h-4 text-teal-700" />
                    </Link>
                    <h1 className="font-bold">{tool.name}</h1>
                </div>

                <div className="flex space-x-6">
                    {mainTabs.map((tab) => {
                        const isActive = pathname.includes(tab.href);
                        return (
                            <Link
                                key={tab.name}
                                href={tab.href}
                                className={cn(
                                    "text-sm font-medium transition-colors border-b-2",
                                    isActive ? "border-teal-800 dark:border-teal-500 text-teal-800 dark:text-teal-500" :
                                        "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300"
                                )}
                            >
                                {tab.name}
                            </Link>
                        );
                    })}
                </div>

                <div className="flex items-center space-x-2">
                    <ThemeToggle />
                    <IconButton title="Delete App" icon={RiDeleteBin7Line} onClick={handleAppDelete} />
                    <IconButton title="Go to Dashboard" variant='invert' icon={BiSolidDashboard} onClick={() => router.push(`/dashboard`)} />
                </div>
            </Header>

            <div className="bg-highlight border-b px-4 sm:px-6 lg:px-8">
                <div className="flex items-center space-x-4">
                    <div className="flex space-x-4 overflow-x-auto pt-2">
                        {tool.app_objects.map((table: Table) => {
                            // Maintain the current view (data/forms/schema/docs) when switching tables
                            const currentView = pathParts[5] || 'data';
                            const href = `/dashboard/apps/${id}/${table.id}/${currentView}`;
                            const isActive = currentObjectId === table.id.toString();

                            return (
                                <Link
                                    key={table.id}
                                    href={href}
                                    className={cn(
                                        'px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                                        isActive
                                            ? 'border-teal-800 dark:border-teal-500 text-teal-800 dark:text-teal-500'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    )}
                                >
                                    {table.label}
                                </Link>
                            );
                        })}
                    </div>
                    <button
                        onClick={() => setIsObjectModalOpen(true)}
                        className="px-4 py-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all"
                        title="Add Object"
                    >
                        <RiAddLine size={20} />
                    </button>
                </div>
            </div>

            <main className="flex-1 overflow-hidden">
                {children}
            </main>

            <Modal
                isOpen={isObjectModalOpen}
                onClose={() => setIsObjectModalOpen(false)}
                title="Add New Object"
            >
                <ObjectForm
                    appId={id}
                    onSuccess={(newObject) => {
                        setIsObjectModalOpen(false);
                        fetchTool();
                        router.push(`/dashboard/apps/${id}/${newObject.id}/data`);
                    }}
                    onCancel={() => setIsObjectModalOpen(false)}
                />
            </Modal>
        </div>
    );
}