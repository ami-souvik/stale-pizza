"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/providers/ToastProvider';
import api from '@/lib/api/client';
import Button from '../action/Button';
import FormField from '../forms/FormField';
import { RiMagicLine } from 'react-icons/ri';

type WizardData = {
    summary: string;
    track: string;
    stages: string[];
    attributes: { name: string; type: string }[];
    automations: { trigger: string; to?: string; action: string }[];
};

const STEPS = ['Basics', 'Stages', 'Data', 'Automations', 'Review'];

export default function IntentWizard() {
    const router = useRouter();
    const { success, error } = useToast();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    
    const [data, setData] = useState<WizardData>({
        summary: '',
        track: '',
        stages: ['New', 'In Progress', 'Done'],
        attributes: [
            { name: 'Name', type: 'text' },
            { name: 'Email', type: 'email' }
        ],
        automations: []
    });

    const updateData = (patch: Partial<WizardData>) => {
        setData(prev => ({ ...prev, ...patch }));
    };

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const response = await api.post('/intents/', data);
            success('System generated successfully!');
            // Redirect to the new app
            if (response.data.app_id) {
                router.push(`/dashboard/apps/${response.data.app_id}`);
            } else {
                router.push('/dashboard');
            }
        } catch (err) {
            error('Failed to generate system');
        } finally {
            setLoading(false);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 0:
                return (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">What do you want to build?</h2>
                        <p className="text-gray-500 text-sm">Describe your system in a few words.</p>
                        <FormField
                            field={{ label: 'System Name', type: 'text', placeholder: 'e.g. Hiring Pipeline, Deal Tracker' }}
                            value={data.summary}
                            onChange={(val) => updateData({ summary: val as string })}
                        />
                        <FormField
                            field={{ label: 'What is the main thing you track?', type: 'text', placeholder: 'e.g. Candidate, Deal, Project' }}
                            value={data.track}
                            onChange={(val) => updateData({ track: val as string })}
                        />
                    </div>
                );
            case 1:
                return (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">How does a {data.track || 'item'} move?</h2>
                        <p className="text-gray-500 text-sm">Define the stages of your process.</p>
                        {data.stages.map((stage, idx) => (
                            <div key={idx} className="flex gap-2">
                                <input
                                    className="flex-1 px-4 py-2 border rounded-lg text-sm"
                                    value={stage}
                                    onChange={(e) => {
                                        const newStages = [...data.stages];
                                        newStages[idx] = e.target.value;
                                        updateData({ stages: newStages });
                                    }}
                                />
                                <button
                                    onClick={() => updateData({ stages: data.stages.filter((_, i) => i !== idx) })}
                                    className="text-red-500 hover:text-red-700 px-2"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={() => updateData({ stages: [...data.stages, ''] })}
                            className="text-blue-600 text-sm hover:underline"
                        >
                            + Add Stage
                        </button>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">What info do you need for a {data.track || 'item'}?</h2>
                        <p className="text-gray-500 text-sm">Add fields to capture data.</p>
                        {data.attributes.map((attr, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                                <input
                                    className="flex-1 px-4 py-2 border rounded-lg text-sm"
                                    placeholder="Field Name"
                                    value={attr.name}
                                    onChange={(e) => {
                                        const newAttrs = [...data.attributes];
                                        newAttrs[idx].name = e.target.value;
                                        updateData({ attributes: newAttrs });
                                    }}
                                />
                                <select
                                    className="w-32 px-4 py-2 border rounded-lg text-sm"
                                    value={attr.type}
                                    onChange={(e) => {
                                        const newAttrs = [...data.attributes];
                                        newAttrs[idx].type = e.target.value;
                                        updateData({ attributes: newAttrs });
                                    }}
                                >
                                    <option value="text">Text</option>
                                    <option value="number">Number</option>
                                    <option value="date">Date</option>
                                    <option value="email">Email</option>
                                    <option value="long_text">Long Text</option>
                                </select>
                                <button
                                    onClick={() => updateData({ attributes: data.attributes.filter((_, i) => i !== idx) })}
                                    className="text-red-500 hover:text-red-700 px-2"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={() => updateData({ attributes: [...data.attributes, { name: '', type: 'text' }] })}
                            className="text-blue-600 text-sm hover:underline"
                        >
                            + Add Field
                        </button>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Automations</h2>
                        <p className="text-gray-500 text-sm">What happens automatically?</p>
                        
                        {data.automations.map((auto, idx) => (
                            <div key={idx} className="p-3 border rounded-lg bg-gray-50 text-sm">
                                When <b>Stage</b> changes to <b>{auto.to}</b>, then <b>{auto.action}</b>.
                                <button 
                                    onClick={() => updateData({ automations: data.automations.filter((_, i) => i !== idx) })}
                                    className="ml-2 text-red-500"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}

                        <div className="p-4 border border-dashed rounded-lg">
                            <p className="text-sm font-medium mb-2">New Automation:</p>
                            <div className="flex gap-2 items-center text-sm">
                                <span>When stage becomes</span>
                                <select 
                                    id="auto-stage"
                                    className="border rounded p-1"
                                >
                                    {data.stages.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <span>then</span>
                                <select 
                                    id="auto-action"
                                    className="border rounded p-1"
                                >
                                    <option value="send_email">Send Email</option>
                                    <option value="create_task">Create Task</option>
                                </select>
                                <Button 
                                    label="Add" 
                                    onClick={() => {
                                        const stage = (document.getElementById('auto-stage') as HTMLSelectElement).value;
                                        const action = (document.getElementById('auto-action') as HTMLSelectElement).value;
                                        updateData({ 
                                            automations: [...data.automations, { trigger: 'stage_change', to: stage, action }] 
                                        });
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Review & Build</h2>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                            <p><strong>System:</strong> {data.summary}</p>
                            <p><strong>Tracking:</strong> {data.track}</p>
                            <p><strong>Stages:</strong> {data.stages.join(' → ')}</p>
                            <p><strong>Fields:</strong> {data.attributes.map(a => a.name).join(', ')}</p>
                            <p><strong>Automations:</strong> {data.automations.length} rules</p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg border overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <RiMagicLine className="text-purple-600" />
                    <h1 className="font-bold text-gray-900">System Builder</h1>
                </div>
                <div className="text-xs text-gray-500">
                    Step {currentStep + 1} of {STEPS.length}
                </div>
            </div>
            
            <div className="p-8 min-h-[400px]">
                {renderStep()}
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t flex justify-between">
                <Button 
                    label="Back" 
                    variant="invert" 
                    onClick={handleBack} 
                    disabled={currentStep === 0}
                />
                <Button 
                    label={currentStep === STEPS.length - 1 ? (loading ? 'Building...' : 'Build System') : 'Next'} 
                    onClick={handleNext}
                    disabled={loading}
                />
            </div>
        </div>
    );
}
