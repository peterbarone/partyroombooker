"use client";

type Props = {
  value: string;
  onChange: (name: string) => void;
};

export default function ChildInfo({ value, onChange }: Props) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center @container">
      <div className="mt-2 mb-6 text-center">
        <div className="space-y-1 font-extrabold tracking-tight drop-shadow-sm">
          <h2 className="text-amber-800 leading-tight text-3xl sm:text-4xl md:text-5xl">WHO&apos;S THE</h2>
          <h2 className="text-pink-600 leading-tight text-3xl sm:text-4xl md:text-5xl">BIRTHDAY STAR?</h2>
        </div>
      </div>
      <div className="w-full max-w-md">
        <input
          type="text"
          placeholder="Enter your child’s name"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-5 py-4 md:px-8 md:py-5 rounded-full border-[3px] font-medium tracking-wide placeholder-opacity-70 focus:outline-none transition-all duration-200 shadow-sm focus:shadow-md bg-amber-50 border-amber-800 focus:border-pink-500 text-amber-800 placeholder-amber-600 text-base md:text-lg text-center"
        />
      </div>
    </div>
  );
}
