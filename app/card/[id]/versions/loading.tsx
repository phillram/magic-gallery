// This page asks Scryfall twice before it can draw, so it waits longer than the card
// page does. The shape below is the gallery it is about to become.
export default function VersionsLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading the printings">
      <div className="h-4 w-40 animate-pulse rounded-sm bg-ink-800" />
      <div className="flex items-center gap-4">
        <div className="hidden h-28 w-20 animate-pulse rounded-lg bg-ink-900 sm:block" />
        <div className="space-y-3">
          <div className="h-9 w-80 max-w-full animate-pulse rounded-sm bg-ink-800" />
          <div className="h-4 w-64 max-w-full animate-pulse rounded-sm bg-ink-850" />
        </div>
      </div>
      <div className="h-14 animate-pulse rounded-xl bg-ink-900" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }, (_, index) => (
          <div key={index} className="aspect-5/7 animate-pulse rounded-xl bg-ink-900" />
        ))}
      </div>
    </div>
  );
}
