import React from 'react';

export default function FixedContainer() {
  const headerHeight = 64; // px
  return (
    <div
      className="mx-auto my-8 w-[1100px] h-[800px] overflow-hidden shadow-lg"
      style={{ backgroundImage: "url('/assets/header.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      {/* inner wrapper controls scrolling */}
      <div className="h-full bg-white/50 backdrop-blur">
        {/* This is the scroll container. Sticky children will stick inside it. */}
        <div className="h-full overflow-auto">
          {/* Header (sticky inside the container) */}
          <header
            className="sticky top-0 z-20 flex items-center px-4"
            style={{ height: `${headerHeight}px`, background: 'white/50', backdropFilter: 'blur(6px)' }}
          >
            <h1 className="text-lg font-bold">Trip title — dates</h1>
            <div className="ml-auto">members / actions</div>
          </header>

          {/* Nav below header — sticky with top = headerHeight so it remains under header */}
          <nav
            className="sticky z-10 flex gap-2 px-4 items-center"
            style={{ top: `${headerHeight}px`, height: 48, background: 'rgba(255,255,255,0.75)' }}
          >
            <button className="px-3 py-1 rounded bg-yellow-400">Day</button>
            <button className="px-3 py-1 rounded bg-gray-200">Map</button>
            <button className="px-3 py-1 rounded bg-gray-200">Members</button>
          </nav>

          {/* Main content that scrolls under the sticky header/nav */}
          <main className="p-4 space-y-4">
            {/* Example large content area */}
            <section className="bg-white/80 p-4 rounded shadow">
              <h2 className="font-semibold mb-2">Events / Activities</h2>
              <div className="space-y-3">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div key={i} className="p-3 bg-white rounded border">
                    Event #{i + 1} — details...
                  </div>
                ))}
              </div>
            </section>
            {/* repeat sections to create scrollable content */}
          </main>
        </div>
      </div>
    </div>
  );
}