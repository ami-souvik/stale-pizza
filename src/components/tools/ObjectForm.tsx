"use client";

import React, { useState } from 'react';
import api from '@/lib/api/client';
import { useToast } from '@/providers/ToastProvider';
import Button from '@/components/action/Button';
import FormField from '@/components/forms/FormField';

import type { Table } from '@/lib/types';

interface ObjectFormProps {
    appId: string;
    onSuccess: (newObject: Table) => void;
    onCancel: () => void;
}

export default function ObjectForm({ appId, onSuccess, onCancel }: ObjectFormProps) {
    const { success, error } = useToast();
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [label, setLabel] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Slugify name automatically if not provided or just use label
            const objectName = name.toLowerCase().replace(/\s+/g, '_') || label.toLowerCase().replace(/\s+/g, '_');
            
            const response = await api.post(`/apps/${appId}/objects/`, {
                name: objectName,
                label: label,
                description: ""
            });
            
            success(`Object "${label}" created!`);
            onSuccess(response.data);
        } catch (err: unknown) {
            const errorData = err as { response?: { data?: { detail?: string } } };
            error(errorData.response?.data?.detail || 'Failed to create object');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
                field={{ id: 'label', name: 'label', label: 'Object Label', type: 'text', required: true, placeholder: 'e.g. Project, Customer, Task' }}
                value={label}
                onChange={(val) => {
                    setLabel(val as string);
                    // Auto-fill name (slug) if empty
                    if (!name) {
                        setName((val as string).toLowerCase().replace(/\s+/g, '_'));
                    }
                }}
            />
            <FormField
                field={{ id: 'name', name: 'name', label: 'Object Identifier (Slug)', type: 'text', required: true, placeholder: 'e.g. project_item' }}
                value={name}
                onChange={(val) => setName((val as string).toLowerCase().replace(/\s+/g, '_'))}
            />
            <p className="text-[10px] text-gray-500 italic">
                The identifier is used internally and in the URL.
            </p>

            <div className="flex justify-end space-x-2 pt-4">
                <Button label="Cancel" variant="invert" onClick={onCancel} />
                <Button label={loading ? "Creating..." : "Create Object"} type="submit" />
            </div>
        </form>
    );
}
