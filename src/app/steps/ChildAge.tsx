"use client";

type Props = {
  childName: string;
  value: number;
  onChange: (age: number) => void;
};

export default function ChildAge({ childName, value, onChange }: Props) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center">
      <div className="w-full max-w-xs">
        <input
          type="number"
          min={1}
          max={18}
          placeholder="Age"
          value={value || ""}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          className="input w-full rounded-full text-center text-lg md:text-xl"
        />
      </div>
    </div>
  );
}
