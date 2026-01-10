"use client";

import { useEffect, useState } from 'react';
import { RiShareForwardBoxLine } from "react-icons/ri";
import { IoMdAdd } from "react-icons/io";
import { useToast } from "../../providers/ToastProvider";
import api from "../../lib/api/client";
import type { Table, Field } from "../../lib/types";
import IconButton from "../action/IconButton";
import ToolForm from "../tools/ToolForm";
import Button from '../action/Button';

export default function DataGrid({
    toolId,
    objectId
}: {
    toolId: string | number,
    objectId: string | number
}) {
    const [object, setObject] = useState<Table | null>(null);
    const [records, setRecords] = useState<Record<string, any>[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [editingRecord, setEditingRecord] = useState<Record<string, any> | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const { success, error } = useToast();

    useEffect(() => {
        fetchObjectAndRecords();
    }, [toolId, objectId]);

    const fetchObjectAndRecords = async () => {
        setLoading(true);
        try {
            // Fetch object definition first to get fields
            // We might need an endpoint to fetch just the object, currently fetching tool gets all
            const toolResponse = await api.get(`/tools/${toolId}/`);
            const foundObject = toolResponse.data.app_objects.find((o: Table) => o.id.toString() === objectId.toString());

            if (!foundObject) {
                error('Object not found');
                return;
            }
            setObject(foundObject);

            // Fetch records
            const response = await api.get(`/apps/${toolId}/objects/${objectId}/records/`);
            setRecords(
                response.data.results.map(
                    ({ id, values }: { id: string | number, values: any[] }) => {
                        const entry: Record<string, any> = {}
                        values.forEach(v => {
                            entry[v.field] = v.value
                        })
                        return { id, data: entry }
                    }
                )
            );

            // Initialize form defaults
            const initialData: Record<string, any> = {};
            foundObject.fields.forEach((field: any) => {
                if (field.default) {
                    initialData[field.name] = field.default;
                }
            });
            setFormData(initialData);

        } catch (err) {
            error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingRecord) {
                await api.patch(`/apps/${toolId}/objects/${objectId}/records/${editingRecord.id}/`, {
                    values: formData,
                });
                success('Record updated!');
            } else {
                await api.post(`/apps/${toolId}/objects/${objectId}/records/`, {
                    app: toolId,
                    object: objectId,
                    values: formData,
                });
                success('Record created!');
            }
            setShowForm(false);
            setEditingRecord(null);
            fetchObjectAndRecords(); // Refresh

            // Reset form
            const initialData: Record<string, any> = {};
            object?.fields.forEach((field: any) => {
                if (field.default) {
                    initialData[field.name] = field.default;
                }
            });
            setFormData(initialData);
        } catch (err: any) {
            error(err.response?.data?.detail || 'Failed to save record');
        }
    };

    const handleEdit = (record: Record<string, any>) => {
        setEditingRecord(record);
        setFormData(record.data);
        setShowForm(true);
    };

    const handleRecordDelete = async (recordId: number) => {
        if (!confirm('Delete this record?')) return;
        try {
            await api.delete(`/records/${recordId}/?app=${toolId}&object=${objectId}`);
            success('Record deleted');
            fetchObjectAndRecords();
        } catch (err) {
            error('Failed to delete record');
        }
    };

    const handleExportCSV = async () => {
        try {
            const response = await api.get(`/apps/${toolId}/objects/${objectId}/export-csv/`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${object?.name}_records.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            success('CSV exported!');
        } catch (err) {
            error('Failed to export CSV');
        }
    };

    const filteredRecords = records.filter((record) => {
        if (!searchQuery) return true;
        const dataStr = JSON.stringify(record.data).toLowerCase();
        return dataStr.includes(searchQuery.toLowerCase());
    });

    const sortedRecords = [...filteredRecords].sort((a, b) => {
        if (!sortField) return 0;
        const aVal = a.data[sortField];
        const bVal = b.data[sortField];
        if (aVal === bVal) return 0;
        const comparison = aVal > bVal ? 1 : -1;
        return sortDirection === 'asc' ? comparison : -comparison;
    });

    const handleSort = (fieldName: string) => {
        if (sortField === fieldName) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(fieldName);
            setSortDirection('asc');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="rounded-lg shadow-sm border h-full flex flex-col bg-highlight">
            {showForm && <ToolForm
                fields={object?.fields || []}
                editing={!!editingRecord}
                clearEditing={() => setEditingRecord(null)}
                formData={formData}
                setFormData={setFormData}
                handleSubmit={handleSubmit}
                handleClose={() => setShowForm(false)}
            />}

            <div className="px-6 py-4 border-b flex justify-between items-center rounded-t-lg">
                <div className='flex items-center space-x-2'>
                    <input
                        type="text"
                        placeholder="Search records..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="px-4 py-2 border placeholder-(--fg-secondary) text-sm rounded-lg focus:ring-2 focus:ring-blue-500 w-64"
                    />
                </div>
                <div className='flex items-center space-x-2'>
                    <IconButton title="Export CSV" icon={RiShareForwardBoxLine} onClick={handleExportCSV} />
                    <Button label="Add Record" onClick={() => setShowForm(true)} />
                </div>
            </div>

            <div className="overflow-auto flex-1">
                <table className="w-full divide-y">
                    <thead className="sticky top-0">
                        <tr>
                            {object?.fields.map((field: Field) => (
                                <th
                                    key={field.name}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100/10 whitespace-nowrap"
                                    onClick={() => handleSort(field.name)}
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>{field.label}</span>
                                        {sortField === field.name && (
                                            <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </div>
                                </th>
                            ))}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase sticky right-0">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredRecords.length === 0 ? (
                            <tr>
                                <td colSpan={(object?.fields.length ?? 0) + 1} className="px-6 py-10 text-center text-gray-500 text-sm">
                                    No records found.
                                </td>
                            </tr>
                        ) : (
                            sortedRecords.map((record) => (
                                <tr key={record.id} className="hover:bg-teal-400/5">
                                    {object?.fields.map((field: any) => (
                                        <td key={field.name} className="px-6 py-4 whitespace-nowrap text-sm border-r border-transparent hover:border-(--color-stroke)">
                                            {record.data[field.name]?.toString() || '-'}
                                        </td>
                                    ))}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2 sticky right-0">
                                        <button
                                            title='Edit'
                                            onClick={() => handleEdit(record)}
                                            className="text-teal-500 hover:text-blue-900 font-medium"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            title='Delete'
                                            onClick={() => handleRecordDelete(record.id as number)}
                                            className="text-red-800 hover:text-red-900 font-medium"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <div className="px-6 py-2 border-t text-xs text-gray-500">
                {records.length} records
            </div>
        </div>
    );
}
