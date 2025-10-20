export default function GreetingScene() {
  return (
    <div className="w-full h-full relative">
      {/* Headline */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center px-4">
        <div
          className="text-white text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight drop-shadow-[0_2px_0_rgba(0,0,0,0.5)]"
          style={{ textShadow: "0 3px 0 rgba(0,0,0,0.45), 0 0 8px rgba(0,0,0,0.35)" }}
        >
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
