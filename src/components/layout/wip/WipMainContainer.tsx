import React from 'react';

export default function FixedContainerResponsive() {
  // choose header heights per breakpoint and set the CSS variable on the container
  // small screens: 56px, md: 64px, lg: 72px
  const containerStyle: React.CSSProperties = {
    // NOTE: CSS variables must be set as strings
    // react type cast for CSS variable object
    ['--header-h' as any]: '56px',
    ['--header-h-md' as any]: '64px',
    ['--header-h-lg' as any]: '72px',
    backgroundImage: "url('/assets/header.jpg')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  return (
    <div
      className="mx-auto my-6 w-full max-w-5xl rounded-lg overflow-hidden shadow-lg"
      style={{
        ...containerStyle,
        // responsive heights (mobile-first): tall on small screens, a bit shorter on large screens
        // We can't put responsive vh in inline style; use Tailwind classes below for height instead.
      }}
    >
      {/* container: responsive height with Tailwind (mobile-first) */}
      <div
        className="h-[90vh] sm:h-[85vh] md:h-[80vh] lg:h-[75vh] w-full bg-black/20"
        style={{ backgroundBlendMode: 'overlay' }}
      >
        {/* scroll container: sticky children will stick relative to this element */}
        <div
          className="h-full overflow-auto"
          // enable iOS momentum scrolling
          style={{ WebkitOverflowScrolling: 'touch' as any }}
        >
          {/* Header: use CSS var for height (we demonstrate with class-based heights too) */}
          <header
            className="sticky top-0 z-30 flex items-center gap-4 px-4 bg-white/85 backdrop-blur"
            style={{
              height: 'var(--header-h)',
            }}
          >
            <div className="text-lg font-bold">Trip title — 10–17 Oct</div>
            <div className="ml-auto flex items-center gap-2">
              <button className="px-3 py-1 rounded bg-yellow-400 text-sm">Create</button>
              <button className="px-3 py-1 rounded bg-gray-200 text-sm">Members</button>
            </div>
          </header>

          {/* Nav: sticky just beneath header; use top equal to header height */}
          <nav
            className="sticky z-20 flex gap-2 px-4 items-center bg-white/70"
            style={{ top: 'var(--header-h)', height: 48 }}
          >
            <div className="text-sm font-medium">Tabs / Filters</div>

            {/* Example days scroller: responsive item widths
                - mobile (default): 3 items visible -> w = calc(100%/3)
                - sm (>=640px): 4 items visible -> w = calc(100%/4)
                - md (>=768px): 5 items visible -> w = calc(100%/5)
            */}
            <div className="ml-auto w-[60%] overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' as any }}>
              <ul className="flex gap-2 flex-nowrap">
                {Array.from({ length: 12 }).map((_, i) => (
                  <li
                    key={i}
                    className="flex-none w-[calc(100%/3)] sm:w-[calc(100%/4)] md:w-[calc(100%/5)]"
                  >
                    <button className="w-full h-16 md:h-20 px-2 rounded bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white font-bold">
                      <div className="text-sm md:text-base">Wed</div>
                      <div className="text-xs md:text-sm">10/10</div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* main scrollable content */}
          <main className="p-4 space-y-4">
            <section className="bg-white/90 p-4 rounded shadow">
              <h2 className="font-semibold mb-2">Events</h2>
              <div className="space-y-3">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div key={i} className="p-3 bg-white rounded border">
                    Event #{i + 1} — details...
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white/90 p-4 rounded shadow">
              <h3 className="font-semibold mb-2">Map / Details</h3>
              <div className="h-48 bg-gray-100 rounded" />
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}