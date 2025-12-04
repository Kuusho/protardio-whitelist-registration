# Protardio Whitelist Mini App

Farcaster Mini App for Protardio Phase 1 Tier 3 whitelist registration.

## Features

- **Sign in with Farcaster (SIWF)** - Native Farcaster authentication
- **Neynar Score Verification** - Gates registration to quality users (0.5+ score)
- **Follow Verification** - Requires following @protardio
- **Share Requirement** - Prompts sharing before registration
- **Supabase Backend** - Real-time database for registrations

## Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **APIs**: Farcaster Frame SDK, Neynar API v2
- **Deployment**: Vercel

## Visual Identity

- Retro-internet meets wartime propaganda aesthetic
- CRT scanlines and glitch effects
- Press Start 2P pixel font
- Green (#00ff00) / Magenta (#ff00ff) / Red color palette

## Setup

### 1. Clone and Install

```bash
git clone <your-repo>
cd protardio-whitelist
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```env
# Neynar API (get from https://neynar.com)
NEYNAR_API_KEY=your_neynar_api_key

# Supabase (get from https://supabase.com)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App Config
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_PROTARDIO_FID=12345  # Get your FID from Warpcast
NEXT_PUBLIC_MINIMUM_NEYNAR_SCORE=0.5
NEXT_PUBLIC_CURRENT_PHASE=phase1_tier3
```

### 3. Setup Supabase Database

1. Create a new Supabase project
2. Go to SQL Editor
3. Run the schema from `supabase/schema.sql`

### 4. Add Assets

Place these files in `/public`:
- `logo.png` - Protardio isometric P logo
- `loading-bg.png` - XP Bliss loading background
- `og-image.png` - Open Graph image for social sharing
- `icon.png` - Mini app icon (512x512)
- `splash.png` - Splash screen image

### 5. Configure Farcaster Manifest

1. Generate account association at https://warpcast.com/~/developers
2. Update `public/.well-known/farcaster.json` with your credentials

### 6. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

## Deployment

### Step 1: Deploy to Vercel

1. Push to GitHub
2. Import to Vercel: https://vercel.com/new
3. Set root directory (if monorepo)
4. Add environment variables:
   - `NEYNAR_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL=https://protardio.xyz`
   - `NEXT_PUBLIC_PROTARDIO_FID=1118370`
   - `NEXT_PUBLIC_MINIMUM_NEYNAR_SCORE=0.5`
   - `NEXT_PUBLIC_CURRENT_PHASE=phase1_tier3`
   - `REGISTRATION_CAP=1500`
5. Deploy

### Step 2: Configure Domain

1. In Vercel, go to Settings → Domains
2. Add `protardio.xyz`
3. Update DNS records as instructed

### Step 3: Add Required Images

Upload these to `/public`:
- `icon.png` - 200x200px app icon (use your isometric P logo)
- `splash.png` - 200x200px splash screen 
- `og-image.png` - 1200x630px Open Graph image

Templates provided: `og-template.html`, `splash-template.html`

### Step 4: Generate Account Association

1. Go to https://warpcast.com/~/developers/mini-apps
2. Click "Create Mini App"
3. Enter domain: `protardio.xyz`
4. Copy the generated `accountAssociation` values
5. Update `public/.well-known/farcaster.json`:

```json
{
  "accountAssociation": {
    "header": "PASTE_HEADER_HERE",
    "payload": "PASTE_PAYLOAD_HERE",
    "signature": "PASTE_SIGNATURE_HERE"
  },
  "frame": {
    "version": "1",
    "name": "Protardio Whitelist",
    "iconUrl": "https://protardio.xyz/icon.png",
    "splashImageUrl": "https://protardio.xyz/splash.png",
    "splashBackgroundColor": "#0a0a0a",
    "homeUrl": "https://protardio.xyz"
  }
}
```

### Step 5: Test & Submit

1. Paste `https://protardio.xyz` in a Warpcast cast
2. Open the mini app and test all flows
3. Submit for review in Warpcast developer portal

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/verify-score` | POST | Check Neynar score for FID |
| `/api/verify-follow` | POST | Check if FID follows @protardio |
| `/api/register` | POST | Submit registration |
| `/api/check-registration` | GET | Check if FID is already registered |
| `/api/registration-status` | GET | Get current count vs cap |

## Database Schema

See `supabase/schema.sql` for full schema including:
- `registrations` table
- Indexes for performance
- RLS policies
- Export views for allowlist generation

## Exporting Allowlist

In Supabase dashboard, run:

```sql
SELECT wallet_address FROM allowlist_export;
```

Or use the CSV export feature on the `allowlist_export` view.

## Registration Cap

Set `REGISTRATION_CAP` in environment variables:
- `0` = unlimited registrations
- `1500` = cap at 1500 registrations

The app will:
- Show spots remaining on landing page
- Disable registration when full
- Display "Allowlist Full" modal

## Phase Configuration

Switch between phases by updating `NEXT_PUBLIC_CURRENT_PHASE`:
- `phase1_tier3` - Phase 1 Tier 3 (0.5+ score)
- `phase2_tier1` - Phase 2 Tier 1 (0.7+ score)

## Troubleshooting

**"User not found" error**
- Check Neynar API key is valid
- Verify FID exists

**Follow check always fails**
- Ensure @protardio FID is correct in env
- May need to wait for Neynar cache to update (30-60 seconds)

**Registration fails**
- Check Supabase connection
- Verify RLS policies are set up
- Check for duplicate FID/wallet

## License

MIT
