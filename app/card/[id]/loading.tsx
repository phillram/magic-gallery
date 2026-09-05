// The card page waits on Scryfall before it can render anything, so without this the
// visitor gets a blank window for as long as that takes.
export default function CardLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading the card">
      <div className="h-4 w-32 animate-pulse rounded-sm bg-ink-800" />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] xl:gap-12">
        <div className="mx-auto aspect-5/7 w-full max-w-sm animate-pulse rounded-xl bg-ink-900" />
        <div className="flex flex-col gap-6">
          <div className="space-y-3">
            <div className="h-9 w-2/3 animate-pulse rounded-sm bg-ink-800" />
            <div className="h-4 w-1/2 animate-pulse rounded-sm bg-ink-850" />
          </div>
          <div className="h-40 animate-pulse rounded-xl bg-ink-900" />
          <div className="h-52 animate-pulse rounded-xl bg-ink-900" />
        </div>
      </div>
    </div>
  );
}
