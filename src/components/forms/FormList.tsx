"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    RiFileAddLine,
    RiShareLine,
    RiDeleteBin7Line,
    RiStarLine,
    RiStarFill,
    RiGlobalLine,
    RiLockLine,
    RiExternalLinkLine,
    RiFileCopyLine
} from 'react-icons/ri';
import api from '@/lib/api/client';
import { useToast } from '@/providers/ToastProvider';
import type { View } from '@/lib/types';
import Button from '@/components/action/Button';
import IconButton from '@/components/action/IconButton';
import Modal from '@/components/common/Modal';
import FormField from '@/components/forms/FormField';

interface FormListProps {
    appId: string;
    objectId: string;
}

export default function FormList({ appId, objectId }: FormListProps) {
    const [views, setViews] = useState<View[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsApplying] = useState(false);
    const { success, error } = useToast();

    // New Form State
    const [newName, setNewName] = useState('');
    const [isPublic, setIsPublic] = useState(false);

    const fetchViews = async () => {
        try {
            const response = await api.get(`/apps/${appId}/objects/${objectId}/views/`);
            // Filter only forms for this page
            const forms = response.data.results.filter((v: View) => v.type === 'form');
            setViews(forms);
        } catch {
            error('Failed to load forms');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchViews();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appId, objectId]);

    const handleCreateForm = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsApplying(true);
        try {
            await api.post(`/apps/${appId}/objects/${objectId}/views/`, {
                name: newName,
                type: 'form',
                is_public: isPublic,
                config: { fields: [] } // Default all fields if empty, handled by backend
            });
            success('Form created successfully');
            setIsModalOpen(false);
            setNewName('');
            setIsPublic(false);
            fetchViews();
        } catch {
            error('Failed to create form');
        } finally {
            setIsApplying(false);
        }
    };

    const handleDelete = async (viewId: number) => {
        if (!confirm('Are you sure you want to delete this form?')) return;
        try {
            await api.delete(`/apps/${appId}/objects/${objectId}/views/${viewId}/`);
            success('Form deleted');
            fetchViews();
        } catch {
            error('Failed to delete form');
        }
    };

    const handleSetDefault = async (viewId: number) => {
        try {
            await api.post(`/apps/${appId}/objects/${objectId}/views/${viewId}/set-default/`);
            success('Default form updated');
            fetchViews();
        } catch {
            error('Failed to update default form');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        success('Link copied to clipboard!');
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Forms</h2>
                    <p className="text-sm text-gray-500">Create and manage data collection forms for this object.</p>
                </div>
                <Button
                    label="+ Add Form"
                    onClick={() => setIsModalOpen(true)}
                />
            </div>

            {views.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 dark:bg-zinc-900/30 rounded-3xl border-2 border-dashed border-gray-200 dark:border-zinc-800">
                    <RiFileAddLine className="mx-auto text-4xl text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No forms yet</h3>
                    <p className="text-gray-500 mb-6">Create a form to start collecting data from users or customers.</p>
                    <Button label="Create your first form" onClick={() => setIsModalOpen(true)} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {views.map((view) => (
                        <div
                            key={view.id}
                            className="group bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center space-x-2">
                                    <div className={view.is_default ? "text-amber-500" : "text-gray-300"}>
                                        {view.is_default ? <RiStarFill size={20} title="Default Form" /> : <RiStarLine size={20} className="cursor-pointer hover:text-amber-500 transition-colors" onClick={() => handleSetDefault(view.id)} title="Set as default" />}
                                    </div>
                                    <h3 className="font-bold text-gray-900 dark:text-gray-100 line-clamp-1">{view.name || 'Untitled Form'}</h3>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <IconButton
                                        title="Delete"
                                        icon={RiDeleteBin7Line}
                                        onClick={() => handleDelete(view.id)}
                                        className="text-gray-400 hover:text-red-500"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 space-y-3">
                                <div className="flex items-center space-x-2 text-xs">
                                    {view.is_public ? (
                                        <span className="flex items-center space-x-1 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                                            <RiGlobalLine size={12} />
                                            <span>Public</span>
                                        </span>
                                    ) : (
                                        <span className="flex items-center space-x-1 text-gray-500 bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                                            <RiLockLine size={12} />
                                            <span>Private</span>
                                        </span>
                                    )}
                                    {view.is_default && (
                                        <span className="text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">Default</span>
                                    )}
                                </div>

                                {view.is_public && view.slug && (
                                    <div className="flex items-center justify-between bg-gray-50 dark:bg-zinc-950 p-2 rounded-lg border border-gray-100 dark:border-zinc-800">
                                        <span className="text-xs text-gray-500 font-mono truncate mr-2">
                                            .../p/{view.slug}
                                        </span>
                                        <div className="flex items-center space-x-1">
                                            <button
                                                onClick={() => copyToClipboard(`${window.location.origin}/p/${view.slug}/`)}
                                                className="p-1 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded transition-colors text-gray-400 hover:text-teal-600"
                                                title="Copy public link"
                                            >
                                                <RiFileCopyLine size={14} />
                                            </button>
                                            <a
                                                href={`/p/${view.slug}/`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-1 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded transition-colors text-gray-400 hover:text-teal-600"
                                                title="Open public form"
                                            >
                                                <RiExternalLinkLine size={14} />
                                            </a>
                                        </div>
                                    </div>
                                )}                            </div>

                            <div className="mt-6 flex items-center justify-between">
                                <Link
                                    href={`/dashboard/apps/${appId}/${objectId}/forms/${view.id}`}
                                    className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center space-x-1"
                                >
                                    <span>Customize Fields</span>
                                    <RiShareLine size={12} />
                                </Link>
                                {!view.is_default && (
                                    <button
                                        onClick={() => handleSetDefault(view.id)}
                                        className="text-[10px] font-medium text-gray-400 hover:text-amber-500 transition-colors"
                                    >
                                        Make Default
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create New Form"
            >
                <form onSubmit={handleCreateForm} className="space-y-4">
                    <FormField
                        field={{
                            id: 'form-name',
                            name: 'form-name',
                            label: 'Form Name',
                            type: 'text',
                            required: true,
                            placeholder: 'e.g. Lead Intake, Customer Feedback'
                        }}
                        value={newName}
                        onChange={(val) => setNewName(val as string)}
                    />

                    <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800">
                        <input
                            type="checkbox"
                            id="is-public"
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                            className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                        />
                        <label htmlFor="is-public" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Make this form public
                        </label>
                    </div>
                    <p className="text-[10px] text-gray-500 italic px-1">
                        Public forms can be shared via a link and don&apos;t require login to submit.
                    </p>

                    <div className="flex justify-end space-x-2 pt-4 border-t dark:border-zinc-800">
                        <Button label="Cancel" variant="invert" onClick={() => setIsModalOpen(false)} />
                        <Button label={isSaving ? "Creating..." : "Create Form"} type="submit" disabled={isSaving || !newName} />
                    </div>
                </form>
            </Modal>
        </div>
    );
}
