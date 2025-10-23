export default function GreetingScene() {
  return (
    <div className="w-full h-full relative">
      {/* Headline */}
      <div className="absolute left-1/2 -translate-x-1/2 text-center px-4 top-[calc(1 rem+env(safe-area-inset-top))] sm:top-8">
        <div className="relative inline-block">
          {/* Background image behind the headline text */}
          <img
            src="/assets/partywith.png"
            alt=""
            aria-hidden
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[320px] sm:w-[420px] md:w-[520px] pointer-events-none select-none"
          />
          <div className="app-headline relative">
            Party with
          </div>
        </div>
        <div className="mt-[50px] flex justify-center">
          <img
            src="/assets/logo.png"
            alt="Company Logo"
            className="h-30 sm:h-24 md:h-28 w-auto drop-shadow"
          />
        </div>
      </div>
      {/* Characters moved into HUD content area (Greeting step) */}
    </div>
  );
}
