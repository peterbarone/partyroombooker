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
          className="w-full px-5 py-4 md:px-8 md:py-5 rounded-full border-[3px] font-medium tracking-wide placeholder-opacity-70 focus:outline-none transition-all duration-200 shadow-sm focus:shadow-md bg-amber-50 border-amber-800 focus:border-pink-500 text-amber-800 placeholder-amber-600 text-base md:text-lg text-center"
        />
      </div>
    </div>
  );
}
