import { NextRequest, NextResponse } from 'next/server';
import { checkFollowStatus, checkFollowStatusByList, getFidByUsername } from '@/lib/neynar';

export const dynamic = 'force-dynamic';

// Cache protardio FID to avoid repeated lookups
let cachedProtardioFid: number | null = null;

export async function POST(request: NextRequest) {
  try {
    const { fid } = await request.json();
    
    if (!fid) {
      return NextResponse.json(
        { success: false, error: 'FID required' },
        { status: 400 }
      );
    }
    
    const apiKey = process.env.NEYNAR_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API configuration error' },
        { status: 500 }
      );
    }
    
    // Get protardio FID (from env or lookup)
    // Hardcoded FID for @protardio: 1118370
    let protardioFid = parseInt(process.env.NEXT_PUBLIC_PROTARDIO_FID || '1118370');
    
    if (!protardioFid || protardioFid === 0) {
      if (!cachedProtardioFid) {
        console.log('Looking up @protardio FID...');
        cachedProtardioFid = await getFidByUsername('protardio', apiKey);
        console.log('Found @protardio FID:', cachedProtardioFid);
      }
      protardioFid = cachedProtardioFid || 0;
    }
    
    if (!protardioFid) {
      return NextResponse.json(
        { success: false, error: 'Could not find @protardio' },
        { status: 500 }
      );
    }
    
    console.log(`Checking if FID ${fid} follows @protardio (FID ${protardioFid})...`);
    
    // Try viewer_context first (faster)
    let isFollowing = await checkFollowStatus(fid, protardioFid, apiKey);
    
    // If viewer_context says false, double-check with the following list
    // This is more reliable but slower
    if (!isFollowing) {
      console.log('viewer_context returned false, checking following list as fallback...');
      isFollowing = await checkFollowStatusByList(fid, protardioFid, apiKey);
    }
    
    console.log(`Final result: FID ${fid} follows @protardio? ${isFollowing}`);
    
    return NextResponse.json({
      success: true,
      isFollowing,
      protardioFid,
      viewerFid: fid,
    });
  } catch (error) {
    console.error('Verify follow error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify follow status' },
      { status: 500 }
    );
  }
}
