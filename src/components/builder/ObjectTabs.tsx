"use client"

import { cn } from "@/lib/helper";
import { Table } from "@/lib/types";

interface ObjectTabsProps {
  objects: Table[];
  activeObject: Table | null;
  onSelect: (object: Table) => void;
}

export default function ObjectTabs({ objects, activeObject, onSelect }: ObjectTabsProps) {
  return (
    <div className='flex space-x-1 border-b border-zinc-800 p-1'>
      {objects.map((table: Table) => (
        <div
          key={table.name}
          title={table.label}
          className={cn(
            'px-4 py-1.5 text-xs font-medium uppercase rounded transition-colors',
            activeObject?.id === table.id 
                ? 'bg-zinc-800 text-white' 
                : 'cursor-pointer hover:bg-zinc-900 text-zinc-400'
          )}
          onClick={() => onSelect(table)}
        >
          <span>{table.label}</span>
        </div>
      ))}
    </div>
  );
}
