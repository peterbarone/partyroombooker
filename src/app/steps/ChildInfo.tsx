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
          placeholder="Type their name!!"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoCapitalize="words"
          className="input w-full rounded-full text-center capitalize text-lg md:text-xl"
        />
      </div>
    </div>
  );
}
