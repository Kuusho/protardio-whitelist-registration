# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Protardio Whitelist Mini App is a Farcaster Mini App for Phase 1 Tier 3 whitelist registration. It's a Next.js 14 application that uses the Farcaster Frame SDK for authentication and Neynar API for social graph verification.

**Visual Identity**: Retro-internet meets wartime propaganda aesthetic with CRT scanlines, glitch effects, Press Start 2P pixel font, and a green (#00ff00) / magenta (#ff00ff) / red color palette.

## Development Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint
npm run lint
```

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes with Supabase for persistence
- **APIs**: Farcaster Frame SDK (@farcaster/frame-sdk), Neynar API v2
- **Database**: Supabase (PostgreSQL)

## Architecture

### Application Flow

1. **Loading Screen** (`src/components/LoadingScreen.tsx`) - XP-style boot screen
2. **Landing Screen** - Shows phase info, requirements, spots remaining, and SIWF button
3. **Sign In with Farcaster** (`src/lib/farcaster.ts`) - Native Farcaster authentication
4. **Verification Screen** - Three-step verification process:
   - Neynar Score check (via `/api/verify-score`)
   - Follow verification (via `/api/verify-follow`)
   - Share requirement (honor system with friction)
5. **Registration** - Submit to `/api/register` endpoint
6. **Success/Already Registered Screen** - Confirmation with user details

### Core Components

- **`WhitelistApp`** (`src/components/WhitelistApp.tsx`) - Main app component containing all state and screen logic. This is the single source of truth for the application flow.
- **`LoadingScreen`** - Animated loading sequence with progress bar
- **`Header`** - App header with logo and title
- **`StatusIndicator`** - Verification check UI component with idle/checking/passed/failed states
- **`AllowlistFullModal`** - Modal shown when registration cap is reached
- **`CRTEffects`** - CSS-based CRT scanlines and retro effects

### API Routes Architecture

All API routes in `src/app/api/` follow a consistent pattern:

1. **`/api/verify-score`** (POST) - Checks Neynar score against threshold
   - Calls `getUserByFid()` from `src/lib/neynar.ts`
   - Returns score, user data, and whether threshold is met
   - Threshold from `NEXT_PUBLIC_MINIMUM_NEYNAR_SCORE` env var

2. **`/api/verify-follow`** (POST) - Verifies if user follows @protardio
   - Uses `checkFollowStatusByList()` for reliable pagination-based check
   - Falls back to `checkFollowStatus()` viewer_context method if needed
   - Returns boolean isFollowing status

3. **`/api/check-registration`** (GET) - Checks if FID is already registered
   - Query param: `?fid=12345`
   - Returns existing registration data if found

4. **`/api/registration-status`** (GET) - Returns current registration count vs cap
   - Returns `{ count, cap, isFull, spotsRemaining }`
   - Cap from `REGISTRATION_CAP` env var (0 = unlimited)

5. **`/api/register`** (POST) - Main registration endpoint
   - Validates all requirements (score, follow, share)
   - Checks registration cap BEFORE inserting
   - Returns `isFull: true` if cap reached
   - Prevents duplicate FID and wallet addresses

### Neynar API Integration

The `src/lib/neynar.ts` module handles all Neynar API interactions:

- **`getUserByFid()`** - Fetch user data with optional viewer context
- **`getNeynarScore()`** - Get user's Neynar score from `experimental.neynar_user_score`
- **`checkFollowStatus()`** - Check follow via viewer_context (faster but cache-dependent)
- **`checkFollowStatusByList()`** - Paginate through following list (slower but reliable)
- **`getFidByUsername()`** - Look up FID by username

**Important**: Follow checks use the pagination method by default for reliability. Neynar's viewer_context can have cache delays of 30-60 seconds.

### Farcaster SDK Integration

The `src/lib/farcaster.ts` module wraps Farcaster Frame SDK:

- **`initializeSdk()`** - Initialize SDK (call once on mount)
- **`signInWithFarcaster()`** - Trigger SIWF flow and return user data
- **`composeCast()`** - Open cast composer with pre-filled text/embed
- **`openUrl()`** - Open external URL (e.g., follow link)
- **`getCurrentUser()`** - Get user context if already signed in
- **`isInFarcasterClient()`** - Check if running inside Farcaster client

### Supabase Integration

The `src/lib/supabase.ts` module provides server and client instances:

- Server client uses `SUPABASE_SERVICE_ROLE_KEY` for privileged operations
- Database schema defined in `supabase/schema.sql`
- **registrations** table with unique constraints on FID and wallet_address
- Views: `allowlist_export` (for CSV export), `registration_stats` (analytics)

### Type System

All types defined in `src/types/index.ts`:

- **`FarcasterUser`** - User data from SIWF
- **`NeynarUser`** - Neynar API user response with viewer_context
- **`Registration`** - Database registration record
- **`VerificationState`** - 'idle' | 'checking' | 'passed' | 'failed'

### Registration Cap System

The app supports a configurable registration cap via `REGISTRATION_CAP` env var:

- `0` = unlimited registrations
- `>0` = hard cap (e.g., 1500)
- Frontend shows spots remaining and progress bar
- `/api/registration-status` provides real-time count
- `/api/register` checks cap atomically before insert
- `AllowlistFullModal` appears when cap reached

### Phase Configuration

Phases are controlled by `NEXT_PUBLIC_CURRENT_PHASE`:

- `phase1_tier3` - Phase 1 Tier 3 (0.5+ Neynar score)
- `phase2_tier1` - Phase 2 Tier 1 (0.7+ score)

This value is stored in the `tier` column of registrations table.

## Environment Variables

Required `.env.local` variables:

```env
# Neynar API
NEYNAR_API_KEY=your_neynar_api_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App Config
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_PROTARDIO_FID=1118370
NEXT_PUBLIC_MINIMUM_NEYNAR_SCORE=0.5
NEXT_PUBLIC_CURRENT_PHASE=phase1_tier3
REGISTRATION_CAP=1500  # 0 for unlimited
```

## Database Operations

### Setup Database

Run `supabase/schema.sql` in Supabase SQL Editor to create:
- `registrations` table with indexes
- RLS policies
- `allowlist_export` view
- `registration_stats` view
- Auto-update `updated_at` trigger

### Export Allowlist

In Supabase dashboard:

```sql
SELECT wallet_address FROM allowlist_export;
```

Or use CSV export feature on the `allowlist_export` view.

### Common Queries

```sql
-- Count registrations by tier
SELECT tier, COUNT(*) FROM registrations GROUP BY tier;

-- Check if FID is registered
SELECT * FROM registrations WHERE fid = 12345;

-- Get stats
SELECT * FROM registration_stats;
```

## Farcaster Mini App Configuration

The `public/.well-known/farcaster.json` file defines the mini app manifest:

- Generate `accountAssociation` at https://warpcast.com/~/developers/mini-apps
- Requires domain verification before submission
- Icons: `icon.png` (200x200), `splash.png` (200x200), `og-image.png` (1200x630)

## Code Patterns

### Adding New Verification Steps

To add a new verification step to the registration flow:

1. Add state in `WhitelistApp` component:
   ```typescript
   const [newCheck, setNewCheck] = useState<VerificationState>('idle');
   ```

2. Create verification function:
   ```typescript
   const verifyNewThing = useCallback(async (fid: number) => {
     setNewCheck('checking');
     // ... API call
     setNewCheck('passed' or 'failed');
   }, []);
   ```

3. Call from `handleConnect()` after existing verifications

4. Add to verification checklist UI with `<StatusIndicator>`

5. Update `canRegister` condition:
   ```typescript
   const canRegister = scoreCheck === 'passed' && followCheck === 'passed' && newCheck === 'passed' && hasShared;
   ```

### Creating New API Endpoints

Pattern for API routes (`src/app/api/[name]/route.ts`):

```typescript
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Disable caching

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // ... validation

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Message' },
      { status: 500 }
    );
  }
}
```

### Styling Conventions

- Use Tailwind utility classes
- Theme colors defined in `tailwind.config.js`:
  - `protardio-bg`: #0a0a0a (black)
  - `protardio-green`: #00ff00
  - `protardio-magenta`: #ff00ff
  - `protardio-red`: #dc143c
  - `protardio-yellow`: #ffff00
- Font: Press Start 2P (loaded via `font-pixel` class)
- Responsive: mobile-first with `sm:` breakpoints

## Common Issues

**"User not found" error**: Check Neynar API key is valid and FID exists.

**Follow check always fails**:
- Verify `NEXT_PUBLIC_PROTARDIO_FID` is correct
- Neynar cache can take 30-60 seconds to update after following
- The app uses `checkFollowStatusByList()` which paginates through following list for accuracy

**Registration fails**:
- Check Supabase connection and RLS policies
- Verify no duplicate FID or wallet address
- Check registration cap hasn't been reached

**Glitch effects not working**: Check that `glitchActive` state is being set and `CRTEffects` component is rendered.

## Path Aliases

TypeScript paths configured in `tsconfig.json`:
- `@/*` maps to `./src/*`

Example: `import { WhitelistApp } from '@/components/WhitelistApp'`
