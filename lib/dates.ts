// Scryfall sends a release date with no time in it, such as "2023-04-21". JavaScript
// reads a date like that as midnight UTC. A browser west of UTC then formats it as the
// day before, so March of the Machine arrived on screen in Los Angeles as April 20.
//
// A set comes out on one day, and that day is the same day everywhere. So every date
// here is read back in the zone it was written in, rather than in the zone of whoever
// is looking at it.
const RELEASE_ZONE = 'UTC';

export function formatReleaseDate(releasedAt: string): string {
  return new Date(releasedAt).toLocaleDateString('en-US', {
    timeZone: RELEASE_ZONE,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// A set that came out on January 1 lost a whole year to the same fault.
export function releaseYear(releasedAt: string): string {
  return new Date(releasedAt).toLocaleDateString('en-US', {
    timeZone: RELEASE_ZONE,
    year: 'numeric',
  });
}
