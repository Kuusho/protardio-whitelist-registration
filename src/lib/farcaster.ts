import { sdk } from '@farcaster/frame-sdk';
import type { FarcasterUser } from '@/types';

// Initialize the SDK
export async function initializeSdk(): Promise<void> {
  try {
    await sdk.actions.ready();
  } catch (error) {
    console.error('Failed to initialize Farcaster SDK:', error);
  }
}

// Sign in with Farcaster
export async function signInWithFarcaster(): Promise<FarcasterUser | null> {
  try {
    // Use the SDK sign-in action
    const result = await sdk.actions.signIn({
      nonce: crypto.randomUUID(),
    });
    
    if (!result) {
      return null;
    }
    
    // Get user context from SDK
    const context = await sdk.context;
    const user = context?.user;
    
    if (!user) {
      return null;
    }
    
    return {
      fid: user.fid,
      username: user.username || `fid:${user.fid}`,
      displayName: user.displayName,
      pfpUrl: user.pfpUrl,
      custodyAddress: '', // Will be populated from Neynar
      verifiedAddresses: [], // Will be populated from Neynar
    };
  } catch (error) {
    console.error('Sign in failed:', error);
    throw error;
  }
}

// Open cast composer with pre-filled text and embed
export async function composeCast(text: string, embedUrl: string): Promise<void> {
  try {
    await sdk.actions.openUrl(
      `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(embedUrl)}`
    );
  } catch (error) {
    console.error('Failed to open composer:', error);
    // Fallback: try composeCast action
    try {
      // @ts-ignore - composeCast might not be in types
      await sdk.actions.composeCast?.({
        text,
        embeds: [embedUrl],
      });
    } catch {
      // Final fallback: open URL externally
      window.open(
        `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(embedUrl)}`,
        '_blank'
      );
    }
  }
}

// Open external URL (e.g., follow link)
export async function openUrl(url: string): Promise<void> {
  try {
    await sdk.actions.openUrl(url);
  } catch {
    window.open(url, '_blank');
  }
}

// Get current user context (if already signed in)
export async function getCurrentUser(): Promise<FarcasterUser | null> {
  try {
    const context = await sdk.context;
    const user = context?.user;
    
    if (!user) {
      return null;
    }
    
    return {
      fid: user.fid,
      username: user.username || `fid:${user.fid}`,
      displayName: user.displayName,
      pfpUrl: user.pfpUrl,
      custodyAddress: '',
      verifiedAddresses: [],
    };
  } catch {
    return null;
  }
}

// Check if running inside Farcaster client
export function isInFarcasterClient(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check for Farcaster context
  return !!(window as unknown as { farcaster?: unknown }).farcaster;
}
