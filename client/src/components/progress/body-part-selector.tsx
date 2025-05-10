import { useState } from "react";

const bodyParts = [
  "Chest",
  "Back",
  "Arms",
  "Waist",
  "Hips",
  "Thighs",
  "Full Body",
  "Other"
];

export function BodyPartSelector({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const toggle = (part: string) => {
    if (value.includes(part)) {
      onChange(value.filter(v => v !== part));
    } else {
      onChange([...value, part]);
    }
  };
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {bodyParts.map(part => (
        <button
          key={part}
          type="button"
          className={`px-3 py-1 rounded-full border text-sm font-medium transition-all
            ${value.includes(part)
              ? 'bg-primary text-white border-primary shadow'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-primary/10 hover:border-primary'}
          `}
          onClick={() => toggle(part)}
        >
          {part}
        </button>
      ))}
    </div>
  );
} 