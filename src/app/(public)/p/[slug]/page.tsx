"use client";

import { useEffect, useState, use } from "react";
import FormView from "@/components/forms/FormView";
import type { FormResponse } from "@/types/form";
import api from "@/lib/api/client";
import { useToast } from "@/providers/ToastProvider";

export default function SlugFormPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<FormResponse | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const { success, error } = useToast();

    useEffect(() => {
        const fetchForm = async () => {
            try {
                const resp = await api.get(`/public/forms/${slug}/`);
                setData(resp.data);
            } catch {
                // Not found or error
            } finally {
                setLoading(false);
            }
        };
        fetchForm();
    }, [slug]);

    const handleSubmit = async (values: Record<string, any>) => {
        try {
            await api.post(`/public/forms/${slug}/`, { values });
            setSubmitted(true);
            success("Form submitted successfully!");
        } catch {
            error("Failed to submit form");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Form Not Found</h1>
                <p className="text-gray-500">This form might be private or no longer exists.</p>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-3xl shadow-xl border text-center max-w-md">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank you!</h1>
                    <p className="text-gray-500">Your response has been recorded successfully.</p>
                    <button 
                        onClick={() => setSubmitted(false)}
                        className="mt-6 text-teal-600 font-semibold hover:underline"
                    >
                        Submit another response
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border overflow-hidden">
                <div className="h-2 bg-teal-600 w-full" />
                <div className="p-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{data.view.name || data.object.label}</h1>
                    <p className="text-gray-500 mb-8">Please fill out the form below.</p>
                    <FormView data={data} onSubmit={handleSubmit} />
                </div>
            </div>
        </div>
    );
}
