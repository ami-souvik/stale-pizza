export type DataType = 'text' | 'number' | 'date' | 'dropdown' | 'checkbox' | 'email' | 'long_text' | 'repeating_group';

export interface Field {
  id: number | string; // Changed to support string for locally created fields (crypto.randomUUID)
  name: string;
  label: string;
  type: DataType;
  required: boolean;
  default?: string;
  placeholder?: string;
  options?: string[];
  fields?: Field[]; // For repeating groups
  auto_generated?: boolean;
  auto_calculated?: boolean;
  is_primary?: boolean;
  is_stage?: boolean;
  locally_created?: boolean;
  defaultValue?: string;
  validations?: Record<string, any>;
}

export interface Rule {
    id: number;
    name: string;
    trigger_type: string;
    trigger_config: Record<string, any>;
    actions: Record<string, any>[];
    is_active: boolean;
    created_at: string;
}

export interface View {
    id: number;
    name: string;
    slug: string;
    type: 'form' | 'list' | 'kanban' | 'timeline';
    config: Record<string, any>;
    is_default: boolean;
    is_public: boolean;
    created_at: string;
    updated_at: string;
}

export interface Table {
  id: number;
  label: string;
  name: string;
  fields: Field[];
  views: (View | string)[];
  rules?: Rule[];
}

export interface ToolSchema {
  objects: Table[]
}

export interface ToolTemplate {
  id: number;
  name: string;
  slug: string;
  description: string;
  schema: ToolSchema;
  icon: string;
  is_applied: boolean;
  created_at: string;
  updated_at: string;
}

export interface App {
  id: number;
  workspace: number;
  template?: number;
  name: string;
  description: string;
  tool_type: string;
  is_public: boolean;
  share_password?: string;
  share_slug: string;
  created_at: string;
  updated_at: string;
  record_count: number;
  app_objects: Table[];
}

export interface ToolRecord {
  id: number;
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: number;
  user: number;
  name: string;
  logo?: string;
  created_at: string;
  updated_at: string;
}
