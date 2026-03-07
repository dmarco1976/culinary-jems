# Culinary JEMs — Marketing Automation System Design

**Date**: 2026-03-01
**Status**: Approved
**Scope**: Full marketing strategy + automation tools for Culinary JEMs food truck

---

## Problem

Culinary JEMs has an Instagram (162 followers, 47 posts) and Facebook presence but posts inconsistently with no content strategy. The sister manages the brand day-to-day with ~2-3 hours/week for marketing. She currently uses Canva (paid) for social graphics and wants to cancel it. Content creation and posting should be mostly automated with AI assistance.

## Goals

1. **Catering leads** — funnel social content toward booking catering gigs
2. **Pop-up attendance** — drive daily sales by promoting truck locations
3. **Brand growth** — grow followers, build community across the East Valley
4. **Minimize effort** — 2-3 hours/week from sister, casual involvement from Dominic
5. **Replace Canva** — AI-generated branded graphics eliminate the subscription

## Architecture: n8n + OpenClaw Hybrid

### System Overview

```
Sister (Discord) ←→ OpenClaw (Proxmox CT)
                         ↕
                    n8n (NAS :5678)
                    ↕           ↕
            Google Drive    Meta Graph API
            Google Sheet    → Instagram
                            → Facebook
```

### Components

| Component | Where | Role |
|-----------|-------|------|
| OpenClaw | Proxmox CT (piggybacking initially) | AI brain — captions, graphics, content plans, Discord commands |
| n8n | NAS 192.168.0.69:5678 | Automation — scheduling, posting, notifications, pipeline |
| Google Drive | Cloud (free) | Photo drop zone |
| Google Sheet | Cloud (free) | Content calendar / approval queue |
| Discord | Cloud (free) | Sister's primary interface |
| Meta Graph API | Cloud (free) | Auto-posting to IG + FB |

### Data Flow

1. **Photo intake**: Sister drops photos in Google Drive folder → n8n detects new file → sends to OpenClaw → OpenClaw generates caption + hashtags → draft row added to Google Sheet
2. **Schedule sync**: Sanity/StreetFoodFinder schedule change → n8n triggers OpenClaw → generates event announcement posts → queued in Sheet
3. **Weekly planning**: Sunday → OpenClaw generates next week's content plan → populates Sheet → Discord notification to sister: "Your content for next week is ready to review!"
4. **Day-of hype**: Morning of scheduled event → n8n auto-posts "We're at [venue] tonight!" with branded graphic
5. **Auto-posting**: Approved posts in Sheet → n8n publishes to IG + FB at scheduled times via Meta API
6. **Engagement**: New comments/mentions → Discord notification + OpenClaw suggests reply

---

## Content Strategy

### 5 Content Pillars (Rotating Weekly)

| Day | Pillar | Source | Automation Level |
|-----|--------|--------|-----------------|
| Mon | Menu Spotlight | Photo library + OpenClaw caption | Fully auto |
| Tue | Behind the Scenes | Sister snaps quick photo/video | Semi-auto (she provides photo) |
| Wed | Community/Collab | Schedule data + venue tags | Fully auto |
| Thu | Schedule Announcement | StreetFoodFinder/Sanity data | Fully auto |
| Fri-Sat | Day-of Hype | Schedule trigger | Fully auto |
| Sun | Social Proof/UGC | Reviews + mentions | Fully auto |

### Posting Frequency

- **Instagram**: 4-5 posts/week + 2-3 stories
- **Facebook**: 3-4 posts/week (cross-posted with FB-optimized captions)
- **Sister's input**: 1-2 fresh photos/week + confirm schedule

### Brand Voice Rules (OpenClaw Prompt)

- Elevated but approachable — "chef-driven" not "fancy"
- Fletch references welcome but not forced
- Always mention grass-fed beef / premium ingredients when relevant
- Rotating hashtag sets: `#CulinaryJEMs #GilbertAZ #EastValleyEats #GourmetSliders #FoodTruckLife #AZFoodie #ChefDriven`
- CTA on every post — "Find us at [location]" or "Book us → culinaryjems.com/catering"
- Tone: fun, high-energy, community-first

---

## Graphic Generation (Replacing Canva)

### Tech Stack

HTML/CSS templates → Puppeteer screenshot → PNG at exact IG dimensions

Templates live in OpenClaw project `/templates/` directory. Variables injected (venue, date, slider name, photo URL). Sister never sees HTML — she says "make a schedule card" in Discord.

### 5 Core Templates

| Template | Dimensions | Use Case |
|----------|-----------|----------|
| `schedule-card` | 1080x1080 | Weekly schedule announcement |
| `menu-spotlight` | 1080x1080 | Individual slider feature |
| `story-event` | 1080x1920 | "TONIGHT!" / "THIS WEEKEND" story |
| `event-recap` | 1080x1080 | Post-event "Thanks!" with photo grid |
| `catering-promo` | 1080x1080 | "Book us for your event" CTA |

### Brand Design Tokens

```css
--color-gold: #FFC559;
--color-pink: #F00075;
--color-dark: #111111;
--color-white: #FFFFFF;
--font-family: 'Manrope', sans-serif;
```

---

## Instagram Auto-Posting

### Requirements

1. Instagram Business Account (free — link to FB Page)
2. Meta App with `instagram_content_publish` permission
3. App Review by Meta (1-4 weeks)

### Fallback (Until API Approved)

n8n generates post (caption + image) → sends to Discord → sister one-tap shares to IG. Or uses Meta Business Suite's built-in scheduler.

Facebook Page posting only needs a Page Access Token (simpler).

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
- Set up OpenClaw instance on Proxmox with brand voice prompt + menu/schedule knowledge
- Configure Discord bot for sister's server
- Create 5 branded graphic templates (HTML → Puppeteer → PNG)
- Build Google Sheet content calendar structure
- Connect Google Drive photo folder to n8n

### Phase 2: Content Generation (Week 2)
- n8n workflow: new photo in Drive → OpenClaw generates caption + hashtags → draft to Sheet
- n8n workflow: weekly content plan generation (Sunday) → Sheet + Discord notification
- Discord commands: "Make a menu spotlight for [slider]", "Draft a post about [topic]"
- Test: generate full week of content, review quality

### Phase 3: Schedule Integration (Week 3)
- n8n workflow: schedule changes → auto-generate event posts
- Day-of hype automation: morning post + story graphic for each event
- "We're at X tonight!" auto-posts with venue-tagged graphics

### Phase 4: Auto-Posting (Week 3-4)
- Set up Meta Business Account + Facebook Page token
- Apply for Instagram Content Publishing API access
- n8n workflow: approved posts in Sheet → auto-publish to IG + FB
- Fallback: Discord notification with ready-to-post content if API pending

### Phase 5: Polish & Handoff (Week 4)
- Engagement monitoring: new comments → Discord notification + suggested reply
- Weekly analytics digest → Discord summary
- "Sister's Marketing Guide" — Discord commands, content approval, photo workflow
- Trial week: she runs solo, Dominic observes and adjusts

---

## Cost

| Item | Cost | Notes |
|------|------|-------|
| OpenClaw (Proxmox CT) | $0 | Existing hardware |
| n8n (NAS) | $0 | Already running |
| Discord | $0 | Free tier |
| Google Drive + Sheets | $0 | Free tier |
| Meta Graph API | $0 | Free |
| AI API costs | ~$10-20/mo | Caption + image generation. She takes over when ready |
| **Total** | **~$10-20/mo** | **Replaces Canva Pro $13/mo + hours of manual work** |

---

## Success Metrics (After 30 Days)

- Posting frequency: 4-5x/week on IG, 3-4x/week on FB (up from inconsistent)
- Sister's time: <2 hrs/week on marketing (down from current)
- Canva canceled
- At least 1 catering inquiry per month attributed to social
- Follower growth: +50 IG followers in first month
