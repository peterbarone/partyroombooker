export default function GreetingScene() {
  return (
    <div className="w-full h-full relative">
      {/* Headline */}
      <div className="absolute left-1/2 -translate-x-1/2 text-center px-4 z-40 top-4 sm:top-8">
        <div className="flex justify-center">
          <img
            src="/assets/logo.png"
            alt="Company Logo"
            className="h-[72px] sm:h-24 md:h-28 w-auto drop-shadow"
          />
        </div>
      </div>
      {/* Characters */}
      <img
        src="/assets/greeting/wizzygreeting.png"
        alt="Wizzy"
        className="pointer-events-none select-none absolute bottom-20 left-[-50px] sm:left-[-50px] w-[70%] sm:w-[70%] md:w-[70%] max-w-[480px] z-40"
      />
      <img
        src="/assets/greeting/rufffsgreeting.png"
        alt="Ruffs"
        className="pointer-events-none select-none absolute bottom-24 right-0 w-[40%] max-w-[210px] z-40"
      />
    </div>
  );
}
