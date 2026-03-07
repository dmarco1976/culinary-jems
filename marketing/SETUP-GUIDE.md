# Culinary JEMs Marketing Automation — Setup Guide

This guide covers the manual setup steps that can't be automated: Discord server/bot, Google Sheet, and Meta API.

---

## Step 1: Discord Server + Bot

### 1a. Create Discord Server
1. Open Discord (desktop or mobile)
2. Click the **+** button in the left sidebar → "Create My Own" → "For me and my friends"
3. Name: **Culinary JEMs Marketing**
4. Upload the logo as the server icon

### 1b. Create Channels
Create these text channels:
- `#content-queue` — New content drafts
- `#approvals` — Weekly content plans
- `#notifications` — Post confirmations + engagement alerts
- `#commands` — Sister types commands here

### 1c. Create Discord Bot
1. Go to https://discord.com/developers/applications
2. Click **New Application** → Name: "CulinaryJEMs Bot"
3. Go to **Bot** tab → Click **Add Bot**
4. Copy the **Bot Token** (save this — you'll need it for n8n)
5. Under **Privileged Gateway Intents**, enable:
   - Message Content Intent
   - Server Members Intent
6. Go to **OAuth2** → **URL Generator**
   - Scopes: `bot`, `applications.commands`
   - Bot Permissions: Send Messages, Read Message History, Embed Links, Attach Files
7. Copy the generated URL and open it to invite the bot to your server

### 1d. Get Discord Webhook URLs
For each channel (#content-queue, #approvals, #notifications):
1. Right-click channel → **Edit Channel** → **Integrations** → **Webhooks**
2. Create a new webhook, name it "CulinaryJEMs Bot"
3. Copy the webhook URL

### 1e. Save These Values
```
DISCORD_BOT_TOKEN=<bot token>
DISCORD_SERVER_ID=<right-click server name → Copy Server ID>
DISCORD_WEBHOOK_CONTENT_QUEUE=<webhook URL for #content-queue>
DISCORD_WEBHOOK_APPROVALS=<webhook URL for #approvals>
DISCORD_WEBHOOK_NOTIFICATIONS=<webhook URL for #notifications>
```

---

## Step 2: Google Sheet — Content Calendar

### 2a. Create the Sheet
1. Log into Google Drive as `culinaryjems@gmail.com`
2. Create a new Google Sheet
3. Name: **Culinary JEMs — Content Calendar**

### 2b. Set Up Column Headers (Row 1)
| A | B | C | D | E | F | G | H | I | J | K | L | M |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Post ID | Status | Scheduled Date | Scheduled Time | Platform | Content Pillar | Caption | Image URL | Venue | Event Date | Created At | Posted At | Notes |

### 2c. Format the Sheet
1. **Bold Row 1** and freeze it (View → Freeze → 1 row)
2. **Column B (Status)** — Add data validation:
   - Select column B (excluding header)
   - Data → Data validation → Dropdown
   - Values: `draft`, `approved`, `posted`, `skipped`
3. **Column E (Platform)** — Add data validation:
   - Values: `instagram`, `facebook`, `both`
4. **Column F (Content Pillar)** — Add data validation:
   - Values: `Menu Spotlight`, `BTS`, `Community`, `Schedule`, `Hype`, `Social Proof`
5. **Conditional formatting** (Format → Conditional formatting):
   - Status = "draft" → Yellow background
   - Status = "approved" → Green background
   - Status = "posted" → Gray background
   - Status = "skipped" → Light red background
6. **Column widths**: Make Caption (G) wide (~400px), others auto-fit

### 2d. Share the Sheet
1. Share with Dominic's Google account (Editor)
2. Share with the n8n service account (if using Google Sheets OAuth)

### 2e. Get the Sheet ID
The Sheet ID is in the URL:
```
https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
```
Save as: `CONTENT_CALENDAR_SHEET_ID=<sheet ID>`

### 2f. Create Google Drive Folders
1. In culinaryjems@gmail.com Drive, create:
   - **CulinaryJEMs Photos** (where sister drops photos)
   - **CulinaryJEMs Graphics** (where rendered templates are uploaded)
2. Get folder IDs from the URL:
```
GDRIVE_PHOTOS_FOLDER_ID=<photos folder ID>
GDRIVE_GRAPHICS_FOLDER_ID=<graphics folder ID>
```

---

## Step 3: n8n Credential Setup

### 3a. Google OAuth2 Credentials
1. Go to https://console.cloud.google.com
2. Create a new project: "CulinaryJEMs Marketing"
3. Enable APIs:
   - Google Sheets API
   - Google Drive API
4. Create OAuth2 credentials (Web application type)
5. Add redirect URI: `http://192.168.0.69:5678/rest/oauth2-credential/callback`
6. In n8n, create credentials:
   - **Google Sheets - CulinaryJEMs**: Use OAuth2 flow, authorize as culinaryjems@gmail.com
   - **Google Drive - CulinaryJEMs**: Same OAuth2, authorize same account

### 3b. OpenClaw API Token
In n8n, create an **HTTP Header Auth** credential:
- Name: `OpenClaw API Token`
- Header Name: `Authorization`
- Header Value: `Bearer b3f48c83...` (the full OpenClaw token)

### 3c. Discord Webhook (no credential needed)
Discord webhooks are direct URLs stored as environment variables. No n8n credential needed.

### 3d. n8n Environment Variables
Set these in n8n settings (or Docker env):
```bash
OPENCLAW_JEMS_URL=<dedicated OpenClaw instance URL, e.g. http://100.93.207.14:18789>
CONTENT_CALENDAR_SHEET_ID=<from Step 2e>
CONTENT_CALENDAR_URL=<full Google Sheet URL for Discord links>
GDRIVE_PHOTOS_FOLDER_ID=<from Step 2f>
GDRIVE_GRAPHICS_FOLDER_ID=<from Step 2f>
DISCORD_WEBHOOK_CONTENT_QUEUE=<from Step 1e>
DISCORD_WEBHOOK_APPROVALS=<from Step 1e>
DISCORD_WEBHOOK_NOTIFICATIONS=<from Step 1e>
FB_PAGE_ID=<from Step 4>
FB_PAGE_ACCESS_TOKEN=<from Step 4>
IG_BUSINESS_ACCOUNT_ID=<from Step 4>
```

---

## Step 4: Meta API Setup (Start ASAP — Takes 1-4 Weeks)

### 4a. Prerequisites
1. Instagram account must be a **Business Account** (not Personal or Creator)
   - IG → Settings → Account → Switch to Professional Account → Business
2. Instagram must be linked to a **Facebook Page**
   - FB Page → Settings → Instagram → Connect Account

### 4b. Create Meta App
1. Go to https://developers.facebook.com
2. Click **Create App** → Business type → Name: "CulinaryJEMs Social"
3. Add products:
   - **Facebook Login** (for page token)
   - **Instagram Graph API**

### 4c. Get Page Access Token
1. In Meta App → Tools → Graph API Explorer
2. Select your app, get User Token
3. Add permissions: `pages_manage_posts`, `pages_read_engagement`, `instagram_basic`, `instagram_content_publish`
4. Generate token → Exchange for Long-Lived Token:
```bash
curl -s "https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=APP_ID&client_secret=APP_SECRET&fb_exchange_token=SHORT_LIVED_TOKEN"
```
5. Get Page Access Token:
```bash
curl -s "https://graph.facebook.com/v19.0/me/accounts?access_token=LONG_LIVED_USER_TOKEN"
```

### 4d. Get Instagram Business Account ID
```bash
curl -s "https://graph.facebook.com/v19.0/PAGE_ID?fields=instagram_business_account&access_token=PAGE_ACCESS_TOKEN"
```

### 4e. Submit for App Review
1. Meta App → App Review → Request Permissions
2. Request: `pages_manage_posts`, `instagram_content_publish`
3. Provide screenshots of the app flow
4. Wait 1-4 weeks for approval

### 4f. Save Values
```
FB_PAGE_ID=<Facebook Page ID>
FB_PAGE_ACCESS_TOKEN=<long-lived page access token>
IG_BUSINESS_ACCOUNT_ID=<from 4d>
```

### Fallback While Waiting
While the Meta API is under review, the system works in **manual mode**:
- n8n sends ready-to-post content to Discord with caption + image
- Sister copies caption and downloads image
- Posts manually via Instagram/Facebook app
- Or uses **Meta Business Suite** (free, has a built-in scheduler)

---

## Step 5: Import n8n Workflows

### 5a. Import via n8n UI
1. Open n8n at http://192.168.0.69:5678
2. For each workflow file in `marketing/n8n-workflows/`:
   - Click **+ Add Workflow** → **Import from File**
   - Select the JSON file
   - Update any credential references to match your n8n credential names
   - Activate the workflow

### 5b. Import via API
```bash
N8N_KEY="eyJhbGci..."  # your n8n API key

for file in marketing/n8n-workflows/*.json; do
  curl -X POST "http://192.168.0.69:5678/api/v1/workflows" \
    -H "X-N8N-API-KEY: $N8N_KEY" \
    -H "Content-Type: application/json" \
    -d @"$file"
done
```

### 5c. Workflow Activation Order
1. **01-photo-intake-pipeline** — Activate first (foundation)
2. **02-weekly-content-planner** — Activate (runs Sundays)
3. **03-schedule-event-generator** — Activate (webhook-triggered)
4. **04-auto-poster** — Activate last (depends on content existing)
5. **05-day-of-hype** — Activate (runs daily mornings)
6. **06-engagement-monitor** — Activate only after Meta API approved

### 5d. Update Render Path
In workflows 03 and 05, update the `Render Schedule Card` / `Render Story Graphic` node's command path:
```
cd /path/to/culinary-jems/marketing && node render-template.js ...
```
Replace `/path/to/` with the actual path where the marketing templates are deployed. On NAS, this might need to be a Docker volume mount or accessible path.

---

## Step 6: Deploy Puppeteer Renderer

The graphic template renderer needs Node.js + Puppeteer installed wherever n8n can execute commands.

### Option A: Install on NAS (if Node.js available)
```bash
cd /path/to/culinary-jems/marketing
npm install
```

### Option B: Docker sidecar
Create a small Docker container with Node.js + Puppeteer, mount the marketing templates, and have n8n call it via HTTP or shared volume.

### Option C: Render on dev-trusted
If NAS can't run Puppeteer, have n8n call dev-trusted via HTTP to render:
```bash
# On dev-trusted:
cd /path/to/culinary-jems/marketing && npm install
# Expose render endpoint or use SSH from n8n
```

---

## Verification Checklist

- [ ] Discord server created with 4 channels
- [ ] Bot invited and webhook URLs saved
- [ ] Google Sheet created with headers + validation
- [ ] Google Drive folders created (Photos + Graphics)
- [ ] n8n credentials configured (Google, OpenClaw)
- [ ] Environment variables set in n8n
- [ ] Workflows imported and credentials linked
- [ ] Puppeteer renderer installed and paths updated
- [ ] Test: Drop a photo → draft appears in Sheet + Discord notification
- [ ] Test: Type `!week` → content plan generated
- [ ] Test: Approve a post → it posts (or Discord fallback notification)
- [ ] Meta API application submitted (parallel track)
- [ ] Sister trained on weekly routine
