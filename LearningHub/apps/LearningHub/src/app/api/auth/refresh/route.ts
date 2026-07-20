import { NextResponse } from 'next/server';
import { serverRefresh } from '@learning-hub/data/server';

export async function POST() {
  try {
    const result = await serverRefresh();
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Refresh failed' },
      { status: 401 },
    );
  }
}
