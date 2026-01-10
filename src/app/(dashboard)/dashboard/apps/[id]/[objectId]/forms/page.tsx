"use client";

import Link from 'next/link';
import { use } from 'react';
import { SiFormspree } from "react-icons/si";
import Button from '@/components/action/Button';

export default function FormsPage({ params }: { params: Promise<{ id: string, objectId: string }> }) {
    const { id, objectId } = use(params);

    // Mock forms list for now
    const forms = [
        { id: 'default', name: 'Default Form', description: 'The default intake form for this object.' }
    ];

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Forms</h2>
                <Button label="Create Form" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {forms.map(form => (
                    <Link
                        key={form.id}
                        href={`/dashboard/apps/${id}/${objectId}/forms/${form.id}`}
                        className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
                    >
                        <div className="flex items-center space-x-3 mb-3">
                            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                                <SiFormspree className="text-xl" />
                            </div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">{form.name}</h3>
                        </div>
                        <p className="text-gray-500 text-sm">{form.description}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
