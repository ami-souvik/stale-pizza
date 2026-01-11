import React, { useEffect, useMemo, useRef, useState } from "react";
import invariant from "tiny-invariant";
import {
    draggable,
    dropTargetForElements,
    monitorForElements
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import {
    attachClosestEdge,
    extractClosestEdge
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import FormField from "../forms/FormField";
import { datatypes, idle } from "../layout/data";
import type { DataType, DragData, DropIndicator, TCardState } from "../layout/data";
import Button from "../action/Button";
import { useToast } from "../../providers/ToastProvider";
import { cn, isShallowEqual } from "../../lib/helper";
import api from "@/lib/api/client";
import type { Field, View } from "../../lib/types";
import { RiDragMove2Fill } from "react-icons/ri";

const getIcon = (type: DataType) => {
    return datatypes.find(dt => dt.type === type)?.icon || datatypes[0].icon;
}

function SharedDropIndicator({
    offset,
    indicator,
}: {
    offset: number,
    indicator: {
        index: number;
        edge: 'top' | 'bottom';
        rect: DOMRect;
    };
}) {
    const style =
        indicator.edge === 'top'
            ? { top: indicator.rect.top - offset }
            : { top: indicator.rect.bottom - offset };
    return (
        <div
            className="pointer-events-none absolute left-0 right-0 z-50 flex items-center"
            style={{
                top: `${style.top}px`,
            }}
        >
            <div className="ml-2 p-1 bg-blue-500 rounded-full">
                <div className="h-1 w-1 bg-white rounded-full" />
            </div>
            <div className="mr-4 h-[2px] w-full bg-blue-500 rounded" />
        </div>
    );
}

function SidebarField({ field }: { field: Field }) {
    const ref = useRef<HTMLDivElement | null>(null);
    const [state, setState] = useState<TCardState>(idle);

    useEffect(() => {
        const el = ref.current;
        invariant(el);

        return draggable({
            element: el,
            getInitialData: () => ({
                kind: 'field-sidebar',
                field: field,
                rect: el.getBoundingClientRect(),
            }),
            onDragStart() {
                setState({ type: 'is-dragging' });
            },
            onDrop() {
                setState(idle);
            }
        });
    }, [field]);

    return (
        <div
            ref={ref}
            className={`p-3 bg-highlight border rounded-lg shadow-sm flex items-center space-x-3 cursor-grab hover:shadow-md transition-all ${state.type === 'is-dragging' ? 'opacity-50' : ''}`}
        >
            <div className="p-2 bg-white rounded text-gray-600">
                {React.createElement(getIcon(field.type))}
            </div>
            <div className="flex-1">
                <p className="text-sm font-medium">{field.label}</p>
                <p className="text-xs text-fg-secondary capitalize">{field.type}</p>
            </div>
            <RiDragMove2Fill className="text-gray-400" />
        </div>
    );
}

function CanvasField({
    field,
    index,
    onSelect,
    selected,
    onHover,
    onLeave
}: {
    field: Field,
    index: number,
    onSelect: () => void,
    selected: boolean,
    onHover: React.Dispatch<React.SetStateAction<DropIndicator>>;
    onLeave: () => void;
}) {
    const ref = useRef<HTMLDivElement | null>(null);
    const [state, setState] = useState<TCardState>(idle);

    useEffect(() => {
        const el = ref.current;
        invariant(el);

        return combine(
            draggable({
                element: el,
                getInitialData: () => ({
                    kind: 'field',
                    fieldId: field.id.toString(),
                    rect: el.getBoundingClientRect(),
                }),
                onDragStart() {
                    setState({ type: 'is-dragging' });
                },
                onDrop() {
                    setState(idle);
                }
            }),
            dropTargetForElements({
                element: el,
                getData: ({ element, input }) => {
                    return attachClosestEdge(
                        {
                            index,
                        },
                        { element, input, allowedEdges: ['top', 'bottom'] }
                    );
                },
                onDrag({ self }) {
                    const closestEdge = extractClosestEdge(self.data);
                    if (!closestEdge) return;

                    const indicator: DropIndicator = {
                        index,
                        edge: closestEdge as 'top' | 'bottom',
                        rect: ref.current!.getBoundingClientRect(),
                    };

                    onHover((current) => {
                        if (current && isShallowEqual(indicator as unknown as Record<string, unknown>, current as unknown as Record<string, unknown>)) {
                            return current;
                        }
                        return indicator;
                    });
                },
                onDragLeave() {
                    onLeave();
                },
                onDrop() {
                    onLeave();
                },
            })
        );
    }, [field, index, onHover, onLeave]);

    return (
        <div
            ref={ref}
            onClick={onSelect}
            className={cn(
                "relative group p-4 border-2 rounded-lg transition-all mb-3",
                selected ? "border-blue-500 ring-1 ring-blue-200" : "border-transparent hover:border-gray-200",
                state.type === 'is-dragging' ? 'opacity-40' : ''
            )}
        >
            <div className="pointer-events-none">
                <FormField field={field} value="" onChange={() => { }} />
            </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-gray-100 rounded cursor-grab">
                <RiDragMove2Fill className="text-gray-500" />
            </div>
        </div>
    );
}

export default function FormBuilder({ object: initObject, viewId }: { object: { appId: string | number, id: number, fields: Field[] }, viewId: string | number }) {
    const [formFields, setFormFields] = useState<Field[]>([]);
    const [view, setView] = useState<View | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedFieldId, setSelectedFieldId] = useState<number | string | null>(null);
    const [dropIndicator, setDropIndicator] = useState<DropIndicator>(null);

    const scrollableRef = useRef<HTMLDivElement | null>(null);
    const mainRef = useRef<HTMLDivElement | null>(null);
    const [mainRefRect, setMainRefRect] = useState<DOMRect | { left: number, top: number }>({ left: 0, top: 0 });

    const { success, error } = useToast();

    // Fetch view data
    useEffect(() => {
        const fetchView = async () => {
            try {
                const response = await api.get(`/apps/${initObject.appId}/objects/${initObject.id}/views/${viewId}/`);
                const viewData = response.data;
                setView(viewData);
                
                // Materialize form fields from config
                const fieldNames = viewData.config.fields || [];
                if (fieldNames.length > 0) {
                    const materialized = fieldNames.map((name: string) => initObject.fields.find(f => f.name === name)).filter(Boolean);
                    setFormFields(materialized);
                } else {
                    // Default to all fields if empty
                    setFormFields(initObject.fields);
                }
            } catch {
                error('Failed to load form layout');
            } finally {
                setLoading(false);
            }
        };
        fetchView();
    }, [initObject.appId, initObject.id, viewId, initObject.fields, error]);

    // Fields available in sidebar (those not yet in formFields)
    const availableFields = useMemo(() => {
        const usedNames = new Set(formFields.map(f => f.name));
        return initObject.fields.filter(f => !usedNames.has(f.name));
    }, [initObject.fields, formFields]);

    const selectedField = useMemo(() => formFields.find(f => f.id === selectedFieldId), [formFields, selectedFieldId]);

    useEffect(() => {
        if (mainRef.current) {
            setMainRefRect(mainRef.current.getBoundingClientRect());
        }
    }, [formFields]); // Update rect when layout changes

    useEffect(() => {
        if (!scrollableRef.current) return;
        const element = scrollableRef.current;
        invariant(element);

        return monitorForElements({
            onDrop({ source, location }) {
                const targets = location.current.dropTargets;
                if (!targets.length) return;

                const target = targets[0];
                const targetData = target.data;
                const sourceData = source.data as DragData;

                // Handle dropping a sidebar field
                if (sourceData.kind === 'field-sidebar') {
                    const newField = sourceData.field;

                    if (targetData.index === undefined) {
                        // Dropped on empty area
                        setFormFields(prev => [...prev, newField]);
                    } else {
                        // Dropped relative to another field
                        const edge = extractClosestEdge(targetData);
                        const targetIndex = targetData.index as number;

                        setFormFields(prev => {
                            const next = [...prev];
                            const insertIndex = edge === 'bottom' ? targetIndex + 1 : targetIndex;
                            next.splice(insertIndex, 0, newField);
                            return next;
                        });
                    }
                    setSelectedFieldId(newField.id);
                }

                // Handle reordering canvas fields
                if (sourceData.kind === 'field') {
                    const fieldId = sourceData.fieldId;
                    const targetIndex = targetData.index as number;

                    if (typeof targetIndex !== 'number') return;

                    const edge = extractClosestEdge(targetData);

                    setFormFields(prev => {
                        const oldIndex = prev.findIndex(f => f.id.toString() === fieldId);
                        if (oldIndex === -1) return prev;

                        const next = [...prev];
                        const [movedField] = next.splice(oldIndex, 1);

                        // Adjust target index because removal might shift indices
                        let insertIndex = edge === 'bottom' ? targetIndex + 1 : targetIndex;
                        if (oldIndex < insertIndex) insertIndex--; // Compensate for removal if source was before target

                        next.splice(insertIndex, 0, movedField);
                        return next;
                    });
                }
                setDropIndicator(null);
            },
        });
    }, [formFields]);

    const handleSave = async () => {
        // Validation: Check for required fields
        const requiredFields = initObject.fields.filter(f => f.required);
        const formFieldNames = new Set(formFields.map(f => f.name));
        const missingRequired = requiredFields.filter(f => !formFieldNames.has(f.name));

        if (missingRequired.length > 0) {
            error(`Missing required fields: ${missingRequired.map(f => f.label).join(', ')}`);
            return;
        }

        try {
            await api.patch(`/apps/${initObject.appId}/objects/${initObject.id}/views/${viewId}/`, {
                config: {
                    ...view?.config,
                    fields: formFields.map(f => f.name)
                }
            });
            success('Form saved successfully');
        } catch {
            error('Failed to save form');
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    return (
        <div ref={scrollableRef} className="h-full flex flex-col">
            <div className="bg-highlight border-b px-6 py-3 flex justify-between items-center shadow-sm z-10">
                <div>
                    <h1 className="text-lg font-semibold">Form Layout</h1>
                    <p className="text-xs text-fg-secondary">Drag fields from the sidebar to build your form</p>
                </div>
                <Button label="Save Form" onClick={handleSave} />
            </div>

            <div className="flex-1 overflow-hidden grid grid-cols-[300px_1fr_300px]">
                {/* Left Sidebar: Available Fields */}
                <div className="border-r overflow-y-auto p-4">
                    <h3 className="font-semibold text-sm mb-4">Available Fields</h3>
                    <div className="space-y-3">
                        {availableFields.map(field => (
                            <SidebarField key={field.id} field={field} />
                        ))}
                        {availableFields.length === 0 && (
                            <p className="text-sm text-gray-400 text-center py-8">
                                All fields are used in the form.
                            </p>
                        )}
                    </div>
                </div>

                {/* Canvas */}
                <div className="overflow-y-auto p-8 relative">
                    <div
                        ref={mainRef}
                        className="max-w-2xl mx-auto bg-highlight rounded-xl shadow-sm min-h-[400px] p-8 border relative"
                    >
                        {dropIndicator && <SharedDropIndicator offset={mainRefRect.top} indicator={dropIndicator} />}

                        {formFields.length === 0 && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 pointer-events-none">
                                <p className="text-lg font-medium">Empty Form</p>
                                <p className="text-sm">Drag fields here to start</p>
                            </div>
                        )}

                        {formFields.map((field, index) => (
                            <CanvasField
                                key={field.id}
                                field={field}
                                index={index}
                                selected={field.id === selectedFieldId}
                                onSelect={() => setSelectedFieldId(field.id)}
                                onHover={setDropIndicator}
                                onLeave={() => setDropIndicator(null)}
                            />
                        ))}

                        {/* Drop zone for empty canvas */}
                        {formFields.length === 0 && (
                            <div
                                className="absolute inset-0 z-10"
                                ref={(el) => {
                                    if (el) {
                                        dropTargetForElements({
                                            element: el,
                                            getData: () => ({ index: 0 }), // Always index 0 for empty
                                        });
                                    }
                                }}
                            />
                        )}
                    </div>
                </div>

                {/* Right Sidebar: Field Properties */}
                <div className="border-l overflow-y-auto p-4">
                    <h3 className="font-semibold text-sm mb-4">Properties</h3>
                    {selectedField ? (
                        <div className="space-y-4">
                            <FormField
                                field={{ label: 'Label', type: 'text', required: false }}
                                value={selectedField.label}
                                onChange={(val) => {
                                    setFormFields(prev => prev.map(f =>
                                        f.id === selectedField.id ? { ...f, label: val as string } : f
                                    ));
                                }}
                            />
                            <FormField
                                field={{ label: 'Placeholder', type: 'text', required: false }}
                                value={selectedField.placeholder}
                                onChange={(val) => {
                                    setFormFields(prev => prev.map(f =>
                                        f.id === selectedField.id ? { ...f, placeholder: val as string } : f
                                    ));
                                }}
                            />
                            <FormField
                                field={{ label: 'Required', type: 'checkbox', required: false }}
                                value={selectedField.required}
                                onChange={(val) => {
                                    // Note: Changing 'required' here only affects the form view validation if we implemented that.
                                    // The schema validation on Save checks the *original* schema requirements.
                                    // A user shouldn't be able to make a required schema field optional in the form, 
                                    // but they could make an optional schema field required in the form.
                                    setFormFields(prev => prev.map(f =>
                                        f.id === selectedField.id ? { ...f, required: val as boolean } : f
                                    ));
                                }}
                            />
                            <div className="pt-4 border-t">
                                <Button
                                    label="Remove from Form"
                                    variant="invert"
                                    onClick={() => {
                                        setFormFields(prev => prev.filter(f => f.id !== selectedField.id));
                                        setSelectedFieldId(null);
                                    }}
                                />
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400">Select a field on the canvas to edit properties.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
