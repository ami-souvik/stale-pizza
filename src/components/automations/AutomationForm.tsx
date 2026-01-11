import React, { useState, useEffect } from 'react';
import Button from '@/components/action/Button';
import FormField from '@/components/forms/FormField';
import api from '@/lib/api/client';
import type { Field } from '@/lib/types';
import { useToast } from '@/providers/ToastProvider';

interface AutomationFormProps {
    toolId: string;
    objectId: string;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function AutomationForm({ toolId, objectId, onSuccess, onCancel }: AutomationFormProps) {
    const { success, error } = useToast();
    const [loading, setLoading] = useState(false);
    const [fields, setFields] = useState<Field[]>([]);
    
    // Form State
    const [name, setName] = useState('');
    const [triggerType, setTriggerType] = useState('stage_change');
    
    // For Stage Change
    const [stageField, setStageField] = useState<string>('');
    const [toStage, setToStage] = useState('');
    
    // For Actions
    const [actionType, setActionType] = useState('send_email');
    const [actionConfig, setActionConfig] = useState<Record<string, any>>({});

    useEffect(() => {
        const fetchSchema = async () => {
            try {
                const response = await api.get(`/apps/${toolId}/objects/${objectId}/`);
                const objectFields = response.data.fields;
                setFields(objectFields);
                
                // Try to find a stage field (dropdown)
                const stageF = objectFields.find((f: Field) => f.type === 'dropdown' || f.name === 'status' || f.name === 'stage');
                if (stageF) setStageField(stageF.name);
            } catch (err) {
                console.error(err);
            }
        };
        fetchSchema();
    }, [toolId, objectId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const triggerConfig: Record<string, any> = {};
        if (triggerType === 'stage_change') {
            triggerConfig['field'] = stageField;
            triggerConfig['to'] = toStage;
        }

        const actions = [{
            type: actionType,
            ...actionConfig
        }];

        try {
            await api.post(`/apps/${toolId}/objects/${objectId}/rules/`, {
                name,
                trigger_type: triggerType,
                trigger_config: triggerConfig,
                actions,
                is_active: true
            });
            success('Automation created');
            onSuccess();
        } catch {
            error('Failed to create automation');
        } finally {
            setLoading(false);
        }
    };

    const getStageOptions = () => {
        const field = fields.find(f => f.name === stageField);
        return field?.options || [];
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
                field={{ id: 'name', name: 'name', label: 'Rule Name', type: 'text', required: true }}
                value={name}
                onChange={(val) => setName(val as string)}
            />

            <div>
                <FormField
                    field={{
                        id: 'trigger-type',
                        name: 'trigger-type',
                        label: 'When...',
                        type: 'dropdown',
                        options: ['Stage Changes', 'New Record Created'],
                        default: 'Stage Changes'
                    }}
                    value={triggerType === 'stage_change' ? 'Stage Changes' : 'New Record Created'}
                    onChange={(val) => setTriggerType(val === 'Stage Changes' ? 'stage_change' : 'record_created')}
                />
            </div>

            {triggerType === 'stage_change' && (
                <div className="pl-4 border-l-2 border-teal-500 space-y-3">
                     <FormField
                        field={{
                            id: 'stage-field',
                            name: 'stage-field',
                            label: 'Field',
                            type: 'dropdown',
                            options: fields.filter(f => f.type === 'dropdown').map(f => f.label)
                        }}
                        value={fields.find(f => f.name === stageField)?.label || ''}
                        onChange={(val) => {
                            const found = fields.find(f => f.label === val);
                            if (found) setStageField(found.name);
                        }}
                    />
                    
                    <FormField
                        field={{
                            id: 'to-stage',
                            name: 'to-stage',
                            label: 'Becomes',
                            type: 'dropdown',
                            options: getStageOptions(),
                            required: true
                        }}
                        value={toStage}
                        onChange={(val) => setToStage(val as string)}
                    />
                </div>
            )}

            <div>
                <FormField
                    field={{
                        id: 'action-type',
                        name: 'action-type',
                        label: 'Then...',
                        type: 'dropdown',
                        options: ['Send Email', 'Create Task'],
                        default: 'Send Email'
                    }}
                    value={actionType === 'send_email' ? 'Send Email' : 'Create Task'}
                    onChange={(val) => setActionType(val === 'Send Email' ? 'send_email' : 'create_task')}
                />
            </div>
            
            {actionType === 'send_email' && (
                 <div className="pl-4 border-l-2 border-purple-500 space-y-3">
                    <FormField 
                        field={{ id: 'subject', name: 'subject', label: 'Subject', type: 'text', required: true }}
                        value={actionConfig.subject || ''}
                        onChange={(val) => setActionConfig({...actionConfig, subject: val})}
                    />
                 </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
                <Button label="Cancel" variant="invert" onClick={onCancel} />
                <Button label={loading ? "Saving..." : "Create Automation"} type="submit" />
            </div>
        </form>
    );
}
