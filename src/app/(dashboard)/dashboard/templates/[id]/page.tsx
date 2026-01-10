"use client";

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { MdOutlineDataObject } from "react-icons/md";
import Header from '@/components/common/Header';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import api from '@/lib/api/client';
import type { Field, Table, ToolTemplate } from '@/lib/types';
import ThemeToggle from '@/components/common/ThemeToggle';

function FieldView({ field }: { field: Field }) {
    return (
        <div className='flex'>
            <div className='flex items-center space-x-2 p-1 mb-1 bg-gray-800 rounded'>
                <h3 className='px-2 text-gray-300 rounded'>{field.label}</h3>
                <h3 className='px-2 bg-green-200 rounded'>{field.type}</h3>
            </div>
        </div>
    )
}

function ObjectView({ object: { label, fields } }: { object: Table }) {
    return (
        <div className='bg-gray-600 rounded-xl overflow-hidden'>
            <div className='py-2 px-3 bg-zinc-900 flex justify-between items-end space-x-2 pb-2'>
                <h3 className='text-white text-2xl rounded'>{label}</h3>
                <MdOutlineDataObject className='text-white text-xl' />
            </div>
            <div className='py-2 px-3'>
                {fields.map(f => <FieldView key={f.name} field={f} />)}
            </div>
        </div>
    )
}

export default function ToolTemplateView({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user, logout } = useAuth();
    const { error } = useToast();
    const [template, setTemplate] = useState<ToolTemplate>();

    const applyToolTemplate = async () => {
        await api.post('/tools/', {
            "template_id": id
        });
        const response = await api.get('/tool-templates/' + id);
        setTemplate(response.data.results || response.data);
    }

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const response = await api.get('/tool-templates/' + id);
                setTemplate(response.data.results || response.data);
            } catch {
                error('Failed to load templates');
            }
        };
        fetchTemplates();
    }, [id, error]);

    return (
        <div className="min-h-screen bg-gray-50">
            <Header>
                <Link href="/dashboard" className="text-xs text-blue-600 hover:text-blue-700">
                    ← Back to Dashboard
                </Link>
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
                </div>
            </Header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{template?.name}</h2>
                        <p className="text-gray-600 mt-1">{template?.description}</p>
                    </div>
                    <button
                        disabled={template?.is_applied}
                        onClick={applyToolTemplate}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {template?.is_applied ? 'Applied' : 'Apply'}
                    </button>
                </div>
                <div className='grid grid-cols-3 space-x-4'>
                    {template?.schema.objects.map(o => <ObjectView key={o.name} object={o} />)}
                </div>
            </main>
        </div>
    )
}