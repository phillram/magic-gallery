import { NextResponse } from 'next/server';
import { fetchSetIconUrl } from '@/lib/api';

// The redirect is temporary because a set can change which file it points at, and the
// day matches how long the server holds the set list. Together they let a browser keep
// one icon without asking again, while a changed icon still arrives within a day.
const CACHE_CONTROL = 'public, max-age=86400';

// Set icons resolve here rather than in the components that draw them, because the
// gallery loads more sets as a visitor scrolls, and an icon those pages request is an
// ordinary image request that needs no card data and no client-side lookup.
export async function GET(
  _request: Request,
  { params }: { params: { code: string } }
): Promise<NextResponse> {
  const iconUrl = await fetchSetIconUrl(params.code);

  return NextResponse.redirect(iconUrl, {
    status: 307,
    headers: { 'Cache-Control': CACHE_CONTROL },
  });
}
