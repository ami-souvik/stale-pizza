import { RiQuoteText } from "react-icons/ri";
import { AiOutlineNumber } from "react-icons/ai";
import { MdAlternateEmail } from "react-icons/md";
import { MdOutlineArrowDropDownCircle } from "react-icons/md";
import { MdOutlineDateRange } from "react-icons/md";
import { MdOutlineCheckBox } from "react-icons/md";
import { GrTextAlignFull } from "react-icons/gr";
import { LuRepeat2 } from "react-icons/lu";

import { type Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import type { Field, DataType } from '../../lib/types';

export type { DataType };

export type DragData =
    | {
        kind: 'datatype';
        datatype: { label: string, type: DataType, icon: React.FC };
        rect: DOMRect;
    }
    | {
        kind: 'field';
        fieldId: string;
        rect: DOMRect;
    }
    | {
        kind: 'field-sidebar';
        field: Field;
        rect: DOMRect;
    };

export type TCardState =
    | {
        type: 'idle';
    }
    | {
        type: 'is-dragging';
    }
    | {
        type: 'is-dragging-and-left-self';
    }
    | {
        type: 'is-over';
        dragging: DOMRect;
        closestEdge: Edge;
    }
    | {
        type: 'preview';
        container: HTMLElement;
        dragging: DOMRect;
    };
export type DropIndicator =
    | null
    | {
        index: number;
        edge: 'top' | 'bottom';
        rect: DOMRect;
    };

export const idle: TCardState = { type: 'idle' };

export const datatypes: Array<{ label: string, type: DataType, icon: React.FC }> = [
    {
        label: 'Text',
        type: 'text',
        icon: RiQuoteText
    },
    {
        label: 'Number',
        type: 'number',
        icon: AiOutlineNumber
    },
    {
        label: 'Email',
        type: 'email',
        icon: MdAlternateEmail
    },
    {
        label: 'Dropdown',
        type: 'dropdown',
        icon: MdOutlineArrowDropDownCircle
    },
    {
        label: 'Date',
        type: 'date',
        icon: MdOutlineDateRange
    },
    {
        label: 'Checkbox',
        type: 'checkbox',
        icon: MdOutlineCheckBox
    },
    {
        label: 'Long Text',
        type: 'long_text',
        icon: GrTextAlignFull
    },
    {
        label: 'Repeating Group',
        type: 'repeating_group',
        icon: LuRepeat2
    }
]

export function createFieldFromDatatype(dt: { label: string, type: DataType, icon: React.FC }): Field {
    return {
        id: crypto.randomUUID(),
        name: `field_${Date.now()}`,
        label: dt.label,
        type: dt.type,
        locally_created: true,
        required: false,
        placeholder: '',
        defaultValue: '',
        validations: {},
    };
}