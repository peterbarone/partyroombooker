export default function GreetingScene() {
  return (
    <div className="w-full h-full relative">
      {/* Headline */}
      <div className="absolute left-1/2 -translate-x-1/2 text-center px-4 z-40 top-[calc(theme(spacing.4)+env(safe-area-inset-top))] sm:top-[calc(theme(spacing.8)+env(safe-area-inset-top))]">
        <div className="flex justify-center">
          <img
            src="/assets/logo.png"
            alt="Company Logo"
            className="h-[72px] sm:h-24 md:h-28 w-auto drop-shadow"
          />
        </div>
      </div>
      {/* Characters moved into HUD content area (Greeting step) */}
    </div>
  );
}
