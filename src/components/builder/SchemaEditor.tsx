"use client";

import { useState } from "react";
import { type Field, type Table } from "../../lib/types";
import { datatypes, createFieldFromDatatype, type DataType } from "../layout/data";
import Button from "../action/Button";
import IconButton from "../action/IconButton";
import { IoSettingsSharp } from "react-icons/io5";
import { RiDeleteBin7Line } from "react-icons/ri";
import FormField from "../forms/FormField";
import api from "../../lib/api/client";
import { useToast } from "../../providers/ToastProvider";

export default function SchemaEditor({ object: initObject }: { object: { appId: string | number, id: number, fields: Field[] } }) {
    const [object, setObject] = useState(initObject);
    const [fields, setFields] = useState<Field[]>(initObject.fields);
    const [selectedField, setSelectedField] = useState<Field | null>(null);
    const [isAddingField, setIsAddingField] = useState(false);
    const { success, error } = useToast();

    const handleAddField = (type: DataType) => {
        const datatype = datatypes.find(dt => dt.type === type);
        if (!datatype) return;

        const newField = createFieldFromDatatype(datatype);
        setFields([...fields, newField]);
        setSelectedField(newField);
        setIsAddingField(false);
    };

    const handleUpdateField = (field: Field, patch: Partial<Field>) => {
        const updated = fields.map(f => f.id === field.id ? { ...f, ...patch } : f);
        setFields(updated);
        // Also update selected field if it matches
        if (selectedField?.id === field.id) {
            setSelectedField({ ...field, ...patch });
        }
    };

    const handleDeleteField = (id: number | string) => {
        setFields(fields.filter(f => f.id !== id));
        if (selectedField?.id === id) setSelectedField(null);
    };

    const handleSave = async () => {
        try {
            await api.post(`/tools/${object.appId}/sync-fields/`, {
                object_id: object.id,
                fields: fields
            });
            success('Schema saved successfully');
        } catch (err) {
            error('Failed to save schema');
        }
    };

    return (
        <div className="flex h-full bg-white">
            <div className="flex-1 flex flex-col">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <div className="relative">
                        <Button
                            label="+ Add Field"
                            onClick={() => setIsAddingField(!isAddingField)}
                        />
                        {isAddingField && (
                            <div className="absolute top-10 left-0 bg-white shadow-xl rounded-lg p-2 w-48 border z-10 grid grid-cols-1 gap-1">
                                {datatypes.map(dt => (
                                    <button
                                        key={dt.type}
                                        className="text-left px-3 py-2 hover:bg-gray-100 rounded text-sm flex items-center space-x-2"
                                        onClick={() => handleAddField(dt.type)}
                                    >
                                        <dt.icon />
                                        <span>{dt.label}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <Button label="Save Changes" onClick={handleSave} />
                </div>

                <div className="flex-1 overflow-auto p-6">
                    <div className="border rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Field Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Required</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {fields.map((field) => (
                                    <tr
                                        key={field.id}
                                        className={`hover:bg-gray-50 cursor-pointer ${selectedField?.id === field.id ? 'bg-blue-50' : ''}`}
                                        onClick={() => setSelectedField(field)}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {field.label}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center space-x-2">
                                            <span className="bg-gray-100 px-2 py-1 rounded text-xs">{field.type}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {field.required ? 'Yes' : 'No'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteField(field.id); }}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <RiDeleteBin7Line />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {fields.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-10 text-center text-gray-500 text-sm">
                                            No fields yet. Click "Add Field" to start building your schema.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {selectedField && (
                <div className="w-80 border-l bg-gray-50 p-4 overflow-y-auto">
                    <h3 className="font-medium text-lg mb-4 flex items-center space-x-2">
                        <IoSettingsSharp />
                        <span>Field Settings</span>
                    </h3>
                    <div className="space-y-4">
                        <FormField
                            field={{ label: 'Label', type: 'text', required: true }}
                            value={selectedField.label}
                            onChange={label => handleUpdateField(selectedField, { label: label as string })}
                        />
                        <FormField
                            field={{ label: 'Placeholder', type: 'text', required: false }}
                            value={selectedField.placeholder || ''}
                            onChange={placeholder => handleUpdateField(selectedField, { placeholder: placeholder as string })}
                        />
                        <FormField
                            field={{ label: 'Required', type: 'checkbox', required: false }}
                            value={selectedField.required || false}
                            onChange={required => handleUpdateField(selectedField, { required: required as boolean })}
                        />
                        {/* Add more specific settings based on type if needed */}
                        {selectedField.type === 'dropdown' && (
                            <div>
                                <label className="block text-xs font-medium mb-1">Options (comma separated)</label>
                                <textarea
                                    className="w-full border rounded p-2 text-sm"
                                    rows={3}
                                    value={selectedField.options?.join(', ') || ''}
                                    onChange={(e) => handleUpdateField(selectedField, { options: e.target.value.split(',').map(s => s.trim()) })}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
