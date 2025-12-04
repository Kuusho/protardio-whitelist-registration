import axios from 'axios';
import type { NeynarUser } from '@/types';

const NEYNAR_API_BASE = 'https://api.neynar.com/v2/farcaster';

// Create axios instance with default config
const neynarApi = axios.create({
  baseURL: NEYNAR_API_BASE,
  headers: {
    'accept': 'application/json',
  },
});

// Get user data by FID (with optional viewer context)
export async function getUserByFid(
  fid: number, 
  apiKey: string,
  viewerFid?: number
): Promise<NeynarUser | null> {
  try {
    const params: Record<string, number> = { fids: fid };
    if (viewerFid) {
      params.viewer_fid = viewerFid;
    }
    
    const response = await neynarApi.get('/user/bulk', {
      params,
      headers: { 'x-api-key': apiKey },
    });
    
    const users = response.data?.users;
    if (users && users.length > 0) {
      return users[0] as NeynarUser;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user from Neynar:', error);
    throw error;
  }
}

// Get Neynar score for user
export async function getNeynarScore(fid: number, apiKey: string): Promise<number> {
  try {
    const user = await getUserByFid(fid, apiKey);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Neynar score is in experimental.neynar_user_score
    // If not available, calculate approximate score from power badge + followers
    if (user.experimental?.neynar_user_score !== undefined) {
      return user.experimental.neynar_user_score;
    }
    
    // Fallback: power badge = 1.0, otherwise scale by followers
    if (user.power_badge) {
      return 1.0;
    }
    
    // Simple approximation based on follower count
    // This is a placeholder - real Neynar score is more complex
    const followerScore = Math.min(user.follower_count / 10000, 0.9);
    return Math.round(followerScore * 100) / 100;
  } catch (error) {
    console.error('Error getting Neynar score:', error);
    throw error;
  }
}

// Check if user follows a target FID using viewer_context
export async function checkFollowStatus(
  viewerFid: number,
  targetFid: number,
  apiKey: string
): Promise<boolean> {
  try {
    // Fetch target user with viewer_fid to get viewer_context
    const response = await neynarApi.get('/user/bulk', {
      params: { 
        fids: targetFid,
        viewer_fid: viewerFid 
      },
      headers: { 'x-api-key': apiKey },
    });
    
    console.log('Neynar follow check response:', JSON.stringify(response.data, null, 2));
    
    const users = response.data?.users;
    if (users && users.length > 0) {
      const user = users[0];
      // viewer_context.following means "does the viewer follow this user"
      const isFollowing = user.viewer_context?.following === true;
      console.log(`Follow check: viewer ${viewerFid} follows target ${targetFid}? ${isFollowing}`);
      console.log('viewer_context:', user.viewer_context);
      return isFollowing;
    }
    
    console.log('No users returned from Neynar API');
    return false;
  } catch (error) {
    console.error('Error checking follow status:', error);
    throw error;
  }
}

// Alternative: Check following list directly (more reliable, bypasses viewer_context)
export async function checkFollowStatusByList(
  fid: number,
  targetFid: number,
  apiKey: string
): Promise<boolean> {
  try {
    let cursor: string | null = null;
    const limit = 150; // Max allowed
    let pageCount = 0;
    const maxPages = 20; // Safety limit
    
    console.log(`Checking if FID ${fid} follows FID ${targetFid} via following list...`);
    
    // Paginate through the user's following list
    while (pageCount < maxPages) {
      const params: Record<string, string | number> = { fid, limit };
      if (cursor) params.cursor = cursor;
      
      const response = await neynarApi.get('/following', {
        params,
        headers: { 'x-api-key': apiKey },
      });
      
      const users = response.data?.users || [];
      pageCount++;
      
      console.log(`Page ${pageCount}: got ${users.length} following`);
      
      // Check if target is in this page
      const found = users.find((u: NeynarUser) => u.fid === targetFid);
      if (found) {
        console.log(`Found! User ${fid} follows ${targetFid}`);
        return true;
      }
      
      // Check for more pages
      cursor = response.data?.next?.cursor;
      if (!cursor || users.length < limit) {
        break;
      }
    }
    
    console.log(`Not found after ${pageCount} pages. User ${fid} does NOT follow ${targetFid}`);
    return false;
  } catch (error) {
    console.error('Error checking follow status by list:', error);
    throw error;
  }
}

// Get FID by username (for looking up @protardio FID)
export async function getFidByUsername(username: string, apiKey: string): Promise<number | null> {
  try {
    const response = await neynarApi.get('/user/by_username', {
      params: { username },
      headers: { 'x-api-key': apiKey },
    });
    
    return response.data?.user?.fid || null;
  } catch (error) {
    console.error('Error fetching FID by username:', error);
    return null;
  }
}
