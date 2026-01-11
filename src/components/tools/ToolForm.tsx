import Button from "../action/Button";
import FormField from "../forms/FormField";
import type { Field } from "../../lib/types";

export default function ToolForm(
    {
        fields,
        editing,
        formData,
        setFormData,
        clearEditing,
        handleSubmit,
        handleClose
    }:
        {
            fields: Field[],
            editing: boolean,
            formData: Record<string, any>,
            setFormData: (v: Record<string, any>) => void,
            clearEditing: () => void,
            handleSubmit: (e: React.FormEvent) => void,
            handleClose: () => void
        }
) {
    return <div className="fixed top-0 left-0 w-full z-1 bg-background rounded-lg shadow p-6 mb-8">
        <div className="max-w-4xl mx-auto">
            <h2 className="font-semibold mb-4">
                {editing ? 'Edit Record' : 'Add New Record'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                {fields.map((field: any) => (
                    <div key={field.name}>
                        <FormField
                            field={field}
                            value={formData[field.name]}
                            onChange={(value) => {
                                setFormData({ ...formData, [field.name]: value });
                            }}
                        />
                    </div>
                ))}
                <div className="flex justify-end space-x-4">
                    <Button
                        label="Cancel"
                        variant="invert"
                        onClick={() => {
                            clearEditing()
                            const initialData: Record<string, any> = {};
                            fields.forEach((field: any) => {
                                if (field.default) {
                                    initialData[field.name] = field.default;
                                }
                            });
                            setFormData(initialData);
                            handleClose();
                        }}
                    />
                    <Button label={editing ? 'Update Record' : 'Create Record'} type="submit" />
                </div>
            </form>
        </div>
    </div>
}