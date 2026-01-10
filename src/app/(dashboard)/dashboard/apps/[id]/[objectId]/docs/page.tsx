"use client";

import { use } from 'react';
import { HiOutlineDocumentText } from "react-icons/hi";
import Button from '@/components/action/Button';

export default function DocsPage({ params }: { params: Promise<{ id: string, objectId: string }> }) {
    const { id, objectId } = use(params);

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Document Templates</h2>
                <Button label="New Template" />
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-dashed border-gray-300 p-12 text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <HiOutlineDocumentText className="text-3xl text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No templates yet</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                    Create templates to automatically generate documents (PDFs, invoices, contracts) from your data records.
                </p>
                <button className="text-blue-600 font-medium hover:text-blue-700">
                    Learn how to create templates &rarr;
                </button>
            </div>
        </div>
    );
}
