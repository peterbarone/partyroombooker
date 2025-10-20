export default function GreetingScene() {
  return (
    <div className="w-full h-full relative">
      {/* Headline */}
      <div className="absolute left-1/2 -translate-x-1/2 text-center px-4 top-[calc(1.25rem+env(safe-area-inset-top))] sm:top-8">
        <div className="app-headline font-party">
          Book a party with
        </div>
        <div className="mt-2 flex justify-center">
          <img
            src="/assets/logo.png"
            alt="Company Logo"
            className="h-20 sm:h-24 md:h-28 w-auto drop-shadow"
          />
        </div>
      </div>
      {/* Characters moved into HUD content area (Greeting step) */}
    </div>
  );
}
