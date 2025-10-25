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
          className="input bg-parchment bg-parchment-texture w-full rounded-full px-5 py-4 md:px-8 md:py-5 font-medium tracking-wide text-lg md:text-xl text-center text-wiz-ink-700 placeholder:text-wiz-ink-500 hover:shadow-lift focus:shadow-glow transition"
        />
      </div>
    </div>
  );
}
