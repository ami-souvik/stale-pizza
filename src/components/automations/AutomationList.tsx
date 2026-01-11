import React, { useEffect, useState } from 'react';
import api from '@/lib/api/client';
import type { Rule } from '@/lib/types';
import { useToast } from '@/providers/ToastProvider';
import Modal from '@/components/common/Modal';
import AutomationForm from './AutomationForm';
import { RiDeleteBin7Line } from 'react-icons/ri';
import { LuWorkflow } from "react-icons/lu";
import Button from '@/components/action/Button';
import IconButton from '@/components/action/IconButton';

export default function AutomationList({ toolId, objectId }: { toolId: string, objectId: string }) {
    const [rules, setRules] = useState<Rule[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { success, error } = useToast();

    const fetchRules = async () => {
        try {
            const response = await api.get(`/apps/${toolId}/objects/${objectId}/rules/`);
            setRules(response.data.results || response.data);
        } catch {
            error('Failed to load automations');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRules();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toolId, objectId, error]);

    const handleDelete = async (ruleId: number) => {
        if (!confirm('Are you sure you want to delete this automation?')) return;
        try {
            await api.delete(`/apps/${toolId}/objects/${objectId}/rules/${ruleId}/`);
            success('Automation deleted');
            fetchRules();
        } catch (err) {
            error('Failed to delete automation');
        }
    };
    const formatTrigger = (type: string, config: any) => {
        switch (type) {
            case 'stage_change':
                return `Stage changes to "${config?.to}"`;
            case 'record_created': return 'Item Created';
            case 'field_update': return 'Field Updated';
            default: return type;
        }
    };

    if (loading) {
        return (
            <div className="p-6 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium">Automations</h2>
                <Button label="+ New Rule" onClick={() => setIsModalOpen(true)} />
            </div>

            {rules.length === 0 ? (
                <div className="bg-highlight rounded-lg shadow-sm border border-dashed p-12 text-center">
                    <div className="mx-auto w-16 h-16 bg-gray-500 rounded-full flex items-center justify-center mb-4">
                        <LuWorkflow className="text-3xl text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No automations configured yet.</h3>
                    <p className="text-fg-secondary max-w-md mx-auto mb-6">
                        Create automations to do somethings...
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {rules.map(rule => (
                        <div key={rule.id} className="bg-highlight shadow rounded-lg p-4 border flex justify-between items-center">
                            <div>
                                <h3 className="font-medium">{rule.name}</h3>
                                <div className="text-sm text-fg-secondary mt-1 flex gap-4">
                                    <span className="flex items-center gap-1">
                                        <span className="font-semibold text-xs uppercase tracking-wider">When</span>
                                        {formatTrigger(rule.trigger_type, rule.trigger_config)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="font-semibold text-xs uppercase tracking-wider">Then</span>
                                        {rule.actions.map(a => a.type).join(', ')}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <IconButton
                                    title="Delete Rule"
                                    icon={RiDeleteBin7Line}
                                    onClick={() => handleDelete(rule.id)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create Automation"
            >
                <AutomationForm
                    toolId={toolId}
                    objectId={objectId}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        fetchRules();
                    }}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
}