import type { DataType } from "@/lib/types";

export interface FormField {
    id: number;
    name: string;
    label: string;
    type: DataType;
    required: boolean;
    options: any;
    default_value: string;
}
  
export interface FormResponse {
    object: {
      name: string;
      label: string;
    };
    view: {
      id: number;
      name?: string;
      type: string;
      config: {
        fields: string[];
      };
    };
    fields: FormField[];
}