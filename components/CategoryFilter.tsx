'use client';

import { CATEGORIES } from '@/data/products';

interface CategoryFilterProps {
  selected: string;
  onSelect: (id: string) => void;
}

export default function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="bg-white border-b border-gray-200 shadow-sm overflow-x-auto">
      <div className="flex items-center gap-1 px-4 py-2 min-w-max">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              selected === cat.id
                ? 'bg-boels-orange text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100 hover:text-boels-orange'
            }`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
