"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaCheck } from "react-icons/fa";
import {
    RiLayoutGridLine,
    RiPuzzleLine,
    RiSearchLine,
    RiMagicLine,
    RiAddLine,
    RiExternalLinkLine
} from "react-icons/ri";
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import api from '@/lib/api/client';
import type { App, ToolTemplate } from '@/lib/types';
import Header from '@/components/common/Header';
import Logo from '@/components/common/Logo';
import Button from '@/components/action/Button';
import ThemeToggle from '@/components/common/ThemeToggle';

function greetUser(firstName: string) {
    const hour = new Date().getHours();
    const name = firstName || 'there';
    if (hour < 12) return `Good morning, ${name}`;
    if (hour < 17) return `Good afternoon, ${name}`;
    return `Good evening, ${name}`;
}

function AppCard({ app }: { app: App }) {
    const router = useRouter();
    return (
        <button
            onClick={() => router.push('/dashboard/apps/' + app.id)}
            className="cursor-pointer group flex flex-col p-5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-md hover:border-teal-500/50 dark:hover:border-teal-500/50 transition-all text-left relative overflow-hidden"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-teal-50 dark:bg-teal-900/20 rounded-lg text-teal-600 dark:text-teal-400">
                    <RiLayoutGridLine size={24} />
                </div>
                <RiExternalLinkLine className="text-gray-300 dark:text-zinc-700 group-hover:text-teal-500 transition-colors" size={18} />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1 line-clamp-1">{app.name}</h3>
            <p className="text-xs text-gray-500 dark:text-zinc-500 line-clamp-2 h-8">
                {app.description || `Custom business system for managing ${app.name.toLowerCase()}.`}
            </p>
            <div className="mt-4 flex items-center text-[10px] font-medium uppercase tracking-wider text-gray-400">
                <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    Active
                </span>
            </div>
        </button>
    );
}

function TemplateCard({ template }: { template: ToolTemplate }) {
    const router = useRouter();
    return (
        <button
            onClick={() => router.push('/dashboard/templates/' + template.id)}
            className="cursor-pointer group flex flex-col p-5 bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-2xl hover:bg-white dark:hover:bg-zinc-900 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all text-left relative overflow-hidden"
        >
            {template.is_applied && (
                <div className="absolute top-0 right-0 p-2">
                    <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-1 rounded-bl-xl rounded-tr-xl">
                        <FaCheck size={12} />
                    </div>
                </div>
            )}
            <div className="flex items-center space-x-3 mb-3">
                <span className="text-2xl">{template.icon || '📋'}</span>
                <h3 className="font-bold text-gray-900 dark:text-gray-100 line-clamp-1">{template.name}</h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-zinc-500 line-clamp-2 flex-1">
                {template.description}
            </p>
            <div className="mt-4 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Template</span>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-bold group-hover:underline">Preview →</span>
            </div>
        </button>
    );
}

export default function HomePage() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const { error } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [apps, setApps] = useState<App[]>([]);
    const [templates, setTemplates] = useState<ToolTemplate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tempsRes, appsRes] = await Promise.all([
                    api.get('/tool-templates/'),
                    api.get('/tools/')
                ]);
                setTemplates(tempsRes.data.results || tempsRes.data);
                setApps(appsRes.data.results || appsRes.data);
            } catch {
                error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [error]);

    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredApps = apps.filter(a =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950">
            <Header>
                <div className="flex items-center space-x-2">
                    <Logo className="h-5 text-teal-700" />
                </div>
                <div className="flex items-center space-x-4">
                    <ThemeToggle />
                    <div className="h-6 w-[1px] bg-gray-200 dark:bg-zinc-800 mx-2" />
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-teal-600 dark:text-teal-500 uppercase tracking-tight">{user?.plan} Plan</span>
                        <span className="text-xs text-gray-500">{user?.email}</span>
                    </div>
                    <button
                        onClick={logout}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Logout"
                    >
                        <RiExternalLinkLine size={18} />
                    </button>
                </div>
            </Header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Hero Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
                            {greetUser(user?.first_name || '')}
                        </h2>
                        <p className="text-gray-500 dark:text-zinc-500 mt-2 text-lg">
                            Ready to build something amazing today?
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search everything..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none w-64 transition-all"
                            />
                        </div>
                        <Button
                            label="New System"
                            onClick={() => router.push('/dashboard/intent')}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600 mb-4"></div>
                        <p className="text-gray-500 animate-pulse">Loading your workspace...</p>
                    </div>
                ) : (
                    <div className="space-y-16">
                        {/* My Systems Section */}
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-2">
                                    <RiLayoutGridLine className="text-teal-600" />
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">My Systems</h3>
                                    <span className="bg-gray-100 dark:bg-zinc-800 text-gray-500 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                        {apps.length}
                                    </span>
                                </div>
                            </div>

                            {apps.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-12 bg-gray-50 dark:bg-zinc-900/30 rounded-3xl border-2 border-dashed border-gray-200 dark:border-zinc-800 text-center">
                                    <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm mb-4">
                                        <RiMagicLine size={32} className="text-teal-500" />
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">No systems yet</h4>
                                    <p className="text-gray-500 dark:text-zinc-500 max-w-xs mt-2 mb-6">
                                        Create your first business system using our AI-driven Intent Builder or choose a template.
                                    </p>
                                    <Button label="Build your first system" onClick={() => router.push('/dashboard/intent')} />
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {filteredApps.map((app) => (
                                        <AppCard key={app.id} app={app} />
                                    ))}
                                    <button
                                        onClick={() => router.push('/dashboard/intent')}
                                        className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl hover:border-teal-500/50 hover:bg-teal-50/30 dark:hover:bg-teal-900/10 transition-all text-gray-400 hover:text-teal-600"
                                    >
                                        <RiAddLine size={32} className="mb-2" />
                                        <span className="text-sm font-medium">Create Custom</span>
                                    </button>
                                </div>
                            )}
                        </section>

                        {/* Templates Section */}
                        <section>
                            <div className="flex items-center space-x-2 mb-6 border-t border-gray-100 dark:border-zinc-900 pt-16">
                                <RiPuzzleLine className="text-blue-600" />
                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Explore Templates</h3>
                                <span className="bg-gray-100 dark:bg-zinc-800 text-gray-500 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                    {templates.length}
                                </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {filteredTemplates.map((template) => (
                                    <TemplateCard key={template.id} template={template} />
                                ))}
                            </div>
                        </section>
                    </div>
                )}
            </main>
        </div>
    );
}
