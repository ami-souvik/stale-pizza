"use client";

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MdOutlineDataObject, MdArrowBack } from "react-icons/md";
import { RiLayoutLine, RiFlashlightLine, RiTableLine } from "react-icons/ri";
import Header from '@/components/common/Header';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import api from '@/lib/api/client';
import type { Field, Table, ToolTemplate } from '@/lib/types';
import ThemeToggle from '@/components/common/ThemeToggle';
import Button from '@/components/action/Button';
import IconButton from '@/components/action/IconButton';

function FieldItem({ field }: { field: Field }) {
    return (
        <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 shadow-sm mb-2">
            <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{field.label}</span>
                    {field.is_primary && (
                        <span className="px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-tighter bg-amber-100 text-amber-700 rounded-full border border-amber-200">
                            Primary
                        </span>
                    )}
                    {field.is_stage && (
                        <span className="px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-tighter bg-blue-100 text-blue-700 rounded-full border border-blue-200">
                            Stage
                        </span>
                    )}
                </div>
                <span className="text-xs text-gray-500">{field.name}</span>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-400 rounded">
                {field.type}
            </span>
        </div>
    );
}

function ObjectCard({ object }: { object: Table }) {
    return (
        <div className="flex flex-col rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900/50 overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-700">
                <div className="flex items-center space-x-2">
                    <MdOutlineDataObject className="text-teal-600 text-xl" />
                    <h3 className="font-bold text-gray-900 dark:text-gray-100">{object.label}</h3>
                </div>
                <span className="text-xs text-gray-400 font-mono">{object.name}</span>
            </div>
            <div className="p-4 flex-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Schema Fields</p>
                <div className="space-y-1">
                    {object.fields.map(f => <FieldItem key={f.name} field={f} />)}
                </div>
                
                <div className="mt-6">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Default Views</p>
                    <div className="flex flex-wrap gap-2">
                        {object.views?.map(v => (
                            <span key={v} className="flex items-center space-x-1 px-2 py-1 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 text-[10px] rounded-md border border-teal-100 dark:border-teal-900/30">
                                <RiLayoutLine className="text-xs" />
                                <span className="capitalize">{v}</span>
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ToolTemplateView({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { user, logout } = useAuth();
    const { success, error } = useToast();
    const [template, setTemplate] = useState<ToolTemplate>();
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);

    useEffect(() => {
        const fetchTemplate = async () => {
            try {
                const response = await api.get('/tool-templates/' + id);
                setTemplate(response.data);
            } catch {
                error('Failed to load template');
            } finally {
                setLoading(false);
            }
        };
        fetchTemplate();
    }, [id, error]);

    const applyToolTemplate = async () => {
        setApplying(true);
        try {
            const response = await api.post('/tools/', {
                "template_id": id
            });
            success(`Created "${template?.name}" successfully!`);
            router.push(`/dashboard/apps/${response.data.id}`);
        } catch (err: unknown) {
            const errorData = err as { response?: { data?: { errors?: { App?: string[] } } } };
            const errorMessage = errorData.response?.data?.errors?.App?.[0] || 'Failed to apply template';
            error(errorMessage);
        } finally {
            setApplying(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    if (!template) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-zinc-950 p-4">
                <p className="text-gray-500 mb-4">Template not found</p>
                <Link href="/dashboard">
                    <Button label="Back to Dashboard" variant="invert" />
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950">
            <Header>
                <div className="flex items-center space-x-4">
                    <IconButton 
                        title="Back" 
                        icon={MdArrowBack} 
                        variant="invert" 
                        onClick={() => router.push('/dashboard')} 
                    />
                    <div className="h-6 w-[1px] bg-gray-200 dark:bg-zinc-800" />
                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                        <span className="text-2xl">{template.icon}</span>
                        <span>{template.name}</span>
                    </span>
                </div>
                <div className="flex items-center space-x-4">
                    <ThemeToggle />
                    <div className="h-6 w-[1px] bg-gray-200 dark:bg-zinc-800" />
                    <span className="text-xs text-gray-500 hidden sm:block">
                        {user?.email}
                    </span>
                    <button
                        onClick={logout}
                        className="text-xs font-medium text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </Header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="bg-gradient-to-br from-teal-50 to-white dark:from-zinc-900 dark:to-zinc-950 rounded-2xl p-8 border border-teal-100 dark:border-zinc-800 mb-10 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-5 dark:opacity-10 pointer-events-none">
                        <RiFlashlightLine className="text-[120px] text-teal-600" />
                    </div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="max-w-2xl">
                            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">
                                {template.name}
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-400">
                                {template.description}
                            </p>
                            <div className="flex items-center space-x-4 mt-6">
                                <div className="flex items-center space-x-1 text-xs font-medium text-gray-500">
                                    <RiTableLine className="text-teal-500" />
                                    <span>{template.schema.objects.length} Objects</span>
                                </div>
                                <div className="h-1 w-1 rounded-full bg-gray-300 dark:bg-zinc-700" />
                                <div className="flex items-center space-x-1 text-xs font-medium text-gray-500">
                                    <RiFlashlightLine className="text-teal-500" />
                                    <span>Instant Deployment</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex-shrink-0">
                            <Button 
                                label={applying ? "Deploying..." : (template.is_applied ? "System Already Created" : "Build this System")} 
                                onClick={applyToolTemplate}
                                disabled={template.is_applied || applying}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {template.schema.objects.map(o => <ObjectView key={o.name} object={o} />)}
                </div>
            </main>
        </div>
    )
}

function ObjectView({ object }: { object: Table }) {
    return <ObjectCard object={object} />
}
