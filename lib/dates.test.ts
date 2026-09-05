import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { formatReleaseDate, releaseYear } from './dates.ts';

const localZone = process.env.TZ;

// Most of the people who use this app are west of UTC, where the fault showed. The zone
// is set here rather than left to the machine, so the test says the same thing on a
// laptop in California and on a build server in UTC.
function inZone(zone: string, check: () => void): void {
  process.env.TZ = zone;
  check();
}

afterEach(() => {
  process.env.TZ = localZone;
});

test('a release date reads the same in every zone', () => {
  for (const zone of ['UTC', 'America/Los_Angeles', 'Pacific/Auckland']) {
    inZone(zone, () => {
      assert.equal(formatReleaseDate('2023-04-21'), 'April 21, 2023', zone);
    });
  }
});

test('a set that came out on January 1 keeps its year', () => {
  inZone('America/Los_Angeles', () => {
    assert.equal(releaseYear('2021-01-01'), '2021');
  });
});
