import type { DataType, Field as FieldType } from "@/lib/types";

type FormFieldConfig = {
    id?: string | number;
    name?: string;
    label: string;
    type: DataType;
    required?: boolean;
    placeholder?: string;
    options?: string[];
    default?: string;
    fields?: FieldType[]; // For repeating groups
    auto_generated?: boolean;
    auto_calculated?: boolean;
}

interface Props {
    field: FormFieldConfig;
    value?: string | number | boolean;
    onChange: (value: string | number | boolean) => void;
}

function FieldInput(props: Props) {
    const { field, value, onChange } = props;
    switch (props.field.type) {
        case 'text':
        case 'email':
            return <input
                type="text"
                value={value as string || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={field.placeholder}
                required={field.required}
                className="w-full px-4 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
        case 'number':
            return <input
                type="number"
                value={value as number || ''}
                onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                placeholder={field.placeholder}
                required={field.required}
                className="w-full px-4 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
        case 'date':
            return <input
                type="date"
                value={value as string || ''}
                onChange={(e) => onChange(e.target.value)}
                required={field.required}
                className="w-full px-4 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
        case 'dropdown':
            return <select
                value={value as string || field.default || ''}
                onChange={(e) => onChange(e.target.value)}
                required={field.required}
                className="w-full px-4 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
                {field.options?.map((opt: string) => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
        case 'long_text':
            return <textarea
                value={value as string || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={field.placeholder}
                required={field.required}
                rows={4}
                className="w-full px-4 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
        default:
            return null;
    }
}

export default function FormField(props: Props) {
    if (props.field.type === 'checkbox')
        return <div className="flex items-center space-x-2">
            <input
                type="checkbox"
                checked={!!props.value || false}
                onChange={(e) => props.onChange(e.target.checked)}
                className="w-4 h-4"
            />
            <label className="block text-xs font-medium">
                {props.field.label}
                {props.field.required && <span className="text-red-400">*</span>}
            </label>
        </div>
    else
        return <div>
            <label className="block mb-1 text-xs font-medium">
                {props.field.label}
                {props.field.required && <span className="text-red-400">*</span>}
            </label>
            <FieldInput {...props} />
        </div>
}
