import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import type { Registration } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      fid, 
      username, 
      walletAddress, 
      neynarScore, 
      followsProtardio, 
      hasShared 
    } = body;
    
    // Validate required fields
    if (!fid || !username || !walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate score threshold
    const minScore = parseFloat(process.env.NEXT_PUBLIC_MINIMUM_NEYNAR_SCORE || '0.5');
    if (neynarScore < minScore) {
      return NextResponse.json(
        { success: false, error: `Score ${neynarScore} below threshold ${minScore}` },
        { status: 400 }
      );
    }
    
    // Validate follow status
    if (!followsProtardio) {
      return NextResponse.json(
        { success: false, error: 'Must follow @protardio' },
        { status: 400 }
      );
    }
    
    // Validate share status
    if (!hasShared) {
      return NextResponse.json(
        { success: false, error: 'Must share registration' },
        { status: 400 }
      );
    }
    
    const supabase = createServerClient();
    const currentPhase = process.env.NEXT_PUBLIC_CURRENT_PHASE || 'phase1_tier3';
    const cap = parseInt(process.env.REGISTRATION_CAP || '0');
    
    // Check registration cap BEFORE inserting
    if (cap > 0) {
      const { count, error: countError } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('tier', currentPhase);
      
      if (countError) {
        console.error('Error counting registrations:', countError);
      } else if (count !== null && count >= cap) {
        return NextResponse.json({
          success: false,
          error: 'Allowlist is full',
          isFull: true,
          count: count,
          cap: cap,
        }, { status: 403 });
      }
    }
    
    // Check for existing registration
    const { data: existing } = await supabase
      .from('registrations')
      .select('*')
      .eq('fid', fid)
      .single();
    
    if (existing) {
      return NextResponse.json({
        success: false,
        error: 'Already registered',
        alreadyRegistered: true,
        registration: existing,
      });
    }
    
    // Check for duplicate wallet
    const { data: walletExists } = await supabase
      .from('registrations')
      .select('fid')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single();
    
    if (walletExists) {
      return NextResponse.json(
        { success: false, error: 'Wallet address already registered' },
        { status: 400 }
      );
    }
    
    // Create registration
    const registration: Omit<Registration, 'id' | 'created_at' | 'updated_at'> = {
      fid,
      username,
      wallet_address: walletAddress.toLowerCase(),
      neynar_score: neynarScore,
      follows_protardio: true,
      has_shared: true,
      registered_at: new Date().toISOString(),
      tier: currentPhase as 'phase1_tier3' | 'phase2_tier1',
      status: 'pending',
    };
    
    const { data, error } = await supabase
      .from('registrations')
      .insert(registration)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to save registration' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      registration: data,
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { success: false, error: 'Registration failed' },
      { status: 500 }
    );
  }
}
