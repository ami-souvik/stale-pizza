"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaCheck } from "react-icons/fa";
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import api from '@/lib/api/client';
import type { App, ToolTemplate } from '@/lib/types';
import Header from '@/components/common/Header';
import Logo from '@/components/common/Logo';
import Button from '@/components/action/Button';
import ThemeToggle from '@/components/common/ThemeToggle';

function greetUser(userName: string) {
    const now = new Date();
    const hour = now.getHours();

    let greeting;

    if (hour >= 5 && hour < 12) {
        greeting = "Morning";
    } else if (hour >= 12 && hour < 17) {
        greeting = "Afternoon";
    } else if (hour >= 17 && hour < 21) {
        greeting = "Evening";
    } else {
        greeting = "Night";
    }

    return `Hi ${userName}, Good ${greeting}`;
}


function AppCard({ app }: { app: App }) {
    const router = useRouter();
    return (
        <button
            key={app.id}
            onClick={() => router.push('/dashboard/apps/' + app.id)}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left"
        >
            <h3 className="text-lg text-gray-900">{app.name}</h3>
        </button>
    );
}

function TemplateCard({ template }: { template: ToolTemplate }) {
    const router = useRouter();
    return (
        <button
            key={template.id}
            onClick={() => router.push('/dashboard/templates/' + template.id)}
            className="relative bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left"
        >
            {template.is_applied && <FaCheck className='absolute top-1 right-1 w-6 h-6 p-1 bg-red-200 rounded' />}
            <h3 className="text-lg text-gray-900">{template.name}</h3>
            <hr className='border-gray-300 my-2' />
            <p className="text-sm text-gray-600">{template.description}</p>
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

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const response = await api.get('/tool-templates/');
                setTemplates(response.data.results || response.data);
            } catch {
                error('Failed to load templates');
            }
        };
        const fetchApps = async () => {
            try {
                const response = await api.get('/tools/');
                setApps(response.data.results || response.data);
            } catch {
                error('Failed to load apps');
            }
        };

        fetchTemplates();
        fetchApps();
    }, [error]);

    return (
        <div className="min-h-screen">
            <Header>
                <div className="flex items-center space-x-2">
                    <Logo />
                </div>
                <div className="flex items-center space-x-4">
                    <span className="text-xs text-gray-600">
                        {user?.email} ({user?.plan})
                    </span>
                    <button
                        onClick={logout}
                        className="text-xs text-gray-600 hover:text-gray-900"
                    >
                        Logout
                    </button>
                    <ThemeToggle />
                    {/* <IconButton variant='invert' title="Settings" icon={IoSettingsSharp} onClick={() => router.push(`/dashboard/settings`)} /> */}
                </div>
            </Header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-center items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 text-center">{greetUser(user?.first_name || '')}</h2>
                        <p className="text-gray-600 text-center mt-1">Enable or create an App in minutes</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 mb-8">
                    <input
                        type="text"
                        placeholder="Search templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 bg-white rounded-lg"
                    />
                    <Button label='Search' />
                </div>
                <h3 className='mb-2'>My Apps</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                    {apps.map((app) => (
                        <AppCard key={app.id} app={app} />
                    ))}
                </div>
                <h3 className='mb-2'>Templates</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                    {templates.map((template) => (
                        <TemplateCard key={template.id} template={template} />
                    ))}
                </div>
            </main>
        </div>
    );
}