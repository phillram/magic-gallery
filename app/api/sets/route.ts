import { NextResponse } from 'next/server';
import { fetchSetOptions, SET_LIST_TTL_SECONDS } from '@/lib/api';

// A set is named once and then keeps that name, so a browser can hold this list for a
// day. That is what makes going back to the browser free: the picker needs the list on
// every mount, and without a cache header every mount paid for it again.
const CACHE_CONTROL = `public, max-age=${SET_LIST_TTL_SECONDS}`;

// The set picker and the filter chips need the code and the name of every paper set.
// Scryfall only serves that as its full set list, which is most of a megabyte of
// fields nothing here reads, so the browser reads the short version from us instead.
export async function GET(): Promise<NextResponse> {
  try {
    return NextResponse.json(await fetchSetOptions(), {
      headers: { 'Cache-Control': CACHE_CONTROL },
    });
  } catch (error) {
    console.error('Error building the set list:', error);
    // An empty list leaves the picker empty, so do not let a browser keep it. The
    // next mount asks again.
    return NextResponse.json([], { headers: { 'Cache-Control': 'no-store' } });
  }
}
