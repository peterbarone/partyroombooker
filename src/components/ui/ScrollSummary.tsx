import { ReactNode } from "react";

export default function ScrollSummary({ children }: { children: ReactNode }) {
  return <div className="max-h-80 overflow-y-auto rounded-2xl bg-white/80 p-4">{children}</div>;
}
