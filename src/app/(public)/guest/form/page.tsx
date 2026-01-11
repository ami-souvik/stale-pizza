"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import FormView from "@/components/forms/FormView";
import type { FormResponse } from "@/types/form";
import api from "@/lib/api/client";

function FormPageContent() {
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<FormResponse | null>(null);

    const space = searchParams.get('space');
    const app = searchParams.get('app');
    const table = searchParams.get('table');
    const form = searchParams.get('form');

    useEffect(() => {
        if (space && app && table && form) {
            api.get(`/guest/${space}/apps/${app}/tables/${table}/forms/${form}/`)
                .then(resp => setData(resp.data.results || resp.data))
                .finally(() => setLoading(false))
        } else {
            setLoading(false); // Stop loading if params are missing
        }
    }, [space, app, table, form]);

    const handleSubmit = async (values: Record<string, any>) => {
        if (!space || !app || !table || !form) return;
        
        api.post(`/guest/${space}/apps/${app}/tables/${table}/forms/${form}/`, {
            values,
        })
            .then(() => alert("Form submitted successfully"))
            .finally(() => setLoading(false))
    };

    if (loading) return <div className="text-center p-10">Loading...</div>;

    if (!space || !app || !table || !form) return <div className="text-center p-10 text-red-500">Missing parameters</div>;

    if (!data) return <div className="text-center p-10">You don't have any form</div>

    return (
        <div className="max-w-2xl mx-auto p-4">
             <FormView data={data} onSubmit={handleSubmit} />
        </div>
    );
}

export default function PublicFormPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <FormPageContent />
        </Suspense>
    )
}