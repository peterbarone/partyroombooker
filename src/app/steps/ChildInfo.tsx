"use client";

type Props = {
  value: string;
  onChange: (name: string) => void;
};

export default function ChildInfo({ value, onChange }: Props) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center @container">
      <div className="w-full max-w-md mt-1">
        <input
          type="text"
          aria-label="Child's name"
          placeholder="Type their name…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoCapitalize="words"
          className="
            input
            bg-parchment bg-parchment-texture
            w-full rounded-full
            px-5 py-4 md:px-8 md:py-5
            font-medium tracking-wide
            text-center capitalize
            text-lg md:text-xl
            hover:shadow-lift
            focus:shadow-glow
            transition
          "
        />
      </div>
    </div>
  );
}
