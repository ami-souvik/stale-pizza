import { useState } from "react";
import FormField from "./FormField";
import type { FormResponse } from "../../types/form";

interface Props {
    data: FormResponse;
    onSubmit: (values: Record<string, any>) => Promise<void>;
}

export default function FormView({ data, onSubmit }: Props) {
    const [loading, setLoading] = useState(false);
    const [values, setValues] = useState<Record<string, any>>(
        data?.fields ? Object.fromEntries(
            data.fields.map((f) => [f.name, f.default_value || ""])
        ) : []
    );
    const isValid = true;

    const handleChange = (name: string, value: any) => {
        setValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await onSubmit(values);
        setLoading(false);
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-lg"
        >
            {data.fields.map((field) => (
                <FormField
                    key={field.id}
                    field={{
                        ...field,
                        options: field.options as string[],
                        default: field.default_value
                    }}
                    value={values[field.name]}
                    onChange={(val) => handleChange(field.name, val)}
                />
            ))}
            <button
                type="submit"
                disabled={loading}
                className={`relative w-60 p-4 cursor-pointer flex justify-between items-center text-xl text-white font-light rounded-xl ${isValid ? "bg-teal-700" : "bg-teal-700/40"}`}>
                <p>Get Quote</p>
            </button>
        </form>
    );
}