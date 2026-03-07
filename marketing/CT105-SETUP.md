# CT 105 Setup — Culinary JEMs OpenClaw Instance

Instructions for Alvin to set up a dedicated OpenClaw container for the Culinary JEMs food truck marketing bot.

**What this is:** A standalone OpenClaw instance that serves as the Culinary JEMs social media content bot. It has its own Discord presence, its own brand personality (loaded via workspace files), and connects to Dominic's infrastructure (Claude subscription, NAS storage, n8n automation). The sister interacts with it through Discord.

---

## 1. Current Resource Map (Proxmox Host: 30GB RAM, 22 cores)

| CT | Name | RAM | Cores | Disk | Role |
|----|------|-----|-------|------|------|
| 100 | dev-trusted | 20,480MB | 14 | 900G | Command Center, Liquidity Tracker, OpenClaw node |
| 101 | OpenClaw | 8,192MB | 8 | 50G | Alvin gateway + Discord + Telegram |
| 102 | chucky | 4,096MB | 2 | 16G | |
| 103 | priya | 2,048MB | 2 | 8G | |
| 104 | julia | 2,048MB | 2 | 8G | Research agent |
| **Total allocated** | | **36,864MB** | **28** | | Over-committed but host caching handles it |

### Suggested Right-Sizing

Dev-trusted and CT 101 are over-provisioned. Here's a suggested rebalance to make room for CT 105 cleanly:

| CT | Current RAM | Suggested RAM | Notes |
|----|------------|---------------|-------|
| 100 (dev-trusted) | 20,480MB | **12,288MB (12GB)** | Command Center + LT + Docker don't need 20GB. 12GB is generous. |
| 101 (OpenClaw/Alvin) | 8,192MB | **4,096MB (4GB)** | Gateway + Discord + Telegram. 4GB is plenty — Julia runs fine on 2GB. |
| 102 (chucky) | 4,096MB | 4,096MB | Leave as-is |
| 103 (priya) | 2,048MB | 2,048MB | Leave as-is |
| 104 (julia) | 2,048MB | 2,048MB | Leave as-is |
| **105 (culinary-jems)** | — | **2,048MB (2GB)** | NEW — content generation only, no browser/search tools |
| **New total** | | **26,624MB** | Fits comfortably in 30GB with headroom |

Use your judgment here — these are suggestions. The key point is CT 101 and CT 100 have way more than they need, so reclaiming some makes the whole host healthier.

To resize (containers must be stopped first):
```bash
# On Proxmox host (192.168.0.70):
pct set 100 -memory 12288
pct set 101 -memory 4096
```

---

## 2. Create CT 105

Clone from CT 104 (Julia) — same Debian base with OpenClaw already installed.

```bash
# On Proxmox host:
pct clone 104 105 --hostname culinary-jems --full
pct set 105 -memory 2048 -cores 2 -swap 1024
pct set 105 -net0 name=eth0,bridge=vmbr1,firewall=1,gw=10.10.10.1,ip=10.10.10.105/24,type=veth
pct set 105 -nameserver 8.8.8.8
pct set 105 -onboot 1
pct start 105
```

After start:
```bash
pct exec 105 -- bash -c "hostname culinary-jems && echo culinary-jems > /etc/hostname"
```

---

## 3. Join Tailscale

```bash
pct exec 105 -- tailscale up
```

Note the Tailscale IP — this becomes the `OPENCLAW_JEMS_URL` value for n8n (e.g., `http://100.x.x.x:18789`).

---

## 4. Clean Julia's Workspace, Deploy JEMs

Since this is cloned from Julia, clear out her workspace and replace with JEMs files:

```bash
# From CT 101 (Alvin), where JEMs workspace files are staged:
ssh root@10.10.10.105 "rm -rf /root/.openclaw/workspace/*"
scp /root/.openclaw/workspace-jems/SOUL.md root@10.10.10.105:/root/.openclaw/workspace/
scp /root/.openclaw/workspace-jems/IDENTITY.md root@10.10.10.105:/root/.openclaw/workspace/
scp /root/.openclaw/workspace-jems/MEMORY.md root@10.10.10.105:/root/.openclaw/workspace/
ssh root@10.10.10.105 "mkdir -p /root/.openclaw/workspace/references"
scp /root/.openclaw/workspace-jems/references/* root@10.10.10.105:/root/.openclaw/workspace/references/
```

Workspace files are also available at NAS: `/volume1/SynologyDrive/culinary-jems/marketing/openclaw-workspace/`

---

## 5. Configure openclaw.json

On CT 105, replace Julia's config with a minimal one for content generation:

```json
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "anthropic/claude-sonnet-4-6"
      },
      "workspace": "/root/.openclaw/workspace",
      "compaction": {
        "mode": "safeguard"
      },
      "maxConcurrent": 2,
      "subagents": {
        "maxConcurrent": 4
      }
    },
    "list": [
      {
        "id": "main",
        "model": "anthropic/claude-sonnet-4-6",
        "identity": {
          "name": "Culinary JEMs",
          "emoji": "🍔"
        }
      }
    ]
  },
  "auth": {
    "profiles": {
      "anthropic:default": {
        "provider": "anthropic",
        "mode": "oauth"
      }
    },
    "order": {
      "anthropic": ["anthropic:default"]
    }
  },
  "gateway": {
    "port": 18789,
    "mode": "local",
    "bind": "tailnet",
    "auth": {
      "mode": "token"
    }
  },
  "tools": {
    "web": {
      "search": { "enabled": false },
      "fetch": { "enabled": false }
    }
  },
  "commands": {
    "native": "auto",
    "nativeSkills": "auto"
  }
}
```

Key differences from Alvin/Julia:
- **Model**: Sonnet (not Opus) — faster, cheaper, plenty for captions
- **Bind**: `tailnet` — so n8n and other services can reach it (NOT loopback)
- **No web tools** — doesn't need search or fetch
- **No heartbeat** — no self-monitoring needed
- **No Telegram** — Discord only (configured separately below)
- **Auth**: needs Dominic's OAuth token paired — run `openclaw configure` interactively or copy auth profile from CT 101

### Auth Setup

The bot needs access to Dominic's Claude subscription. Easiest approach:
```bash
# On CT 105:
openclaw configure
# Follow prompts to authenticate with Anthropic OAuth
```

Or copy the auth credentials from CT 101 if compatible:
```bash
scp root@10.10.10.10:/root/.openclaw/agents/main/agent/auth-profiles.json \
    root@10.10.10.105:/root/.openclaw/agents/main/agent/auth-profiles.json
```

---

## 6. Discord Bot Setup

This requires Dominic to create the Discord application first (see `SETUP-GUIDE.md` Step 1). Once the bot token and server IDs are available, add to openclaw.json:

```json
{
  "channels": {
    "discord": {
      "enabled": true,
      "token": "<DISCORD_BOT_TOKEN>",
      "groupPolicy": "allowlist",
      "streaming": "off",
      "dmPolicy": "pairing",
      "guilds": {
        "<SERVER_ID>": {
          "requireMention": false,
          "channels": {
            "<COMMANDS_CHANNEL_ID>": { "allow": true, "requireMention": false },
            "<CONTENT_QUEUE_CHANNEL_ID>": { "allow": true, "requireMention": false },
            "<APPROVALS_CHANNEL_ID>": { "allow": true, "requireMention": false },
            "<NOTIFICATIONS_CHANNEL_ID>": { "allow": true, "requireMention": false }
          }
        }
      }
    }
  }
}
```

The bot should respond to commands in #commands:
- `!spotlight [slider-name]` — Menu spotlight caption
- `!schedule [venue] [date] [time]` — Schedule announcement
- `!hype [venue]` — Day-of hype post
- `!week` — Full weekly content plan
- `!recap [venue]` — Event recap
- `!catering` — Catering promo

These commands are defined in the workspace SOUL.md — the bot knows what to do with each one.

---

## 7. Start the Gateway

```bash
pct exec 105 -- bash -c "nohup openclaw gateway --force --port 18789 >> /var/log/openclaw-gateway.log 2>&1 &"
```

Optional: set up a watchdog cron like CT 101 has:
```bash
# Cron every 1 min:
* * * * * ss -tlnp | grep -q 18789 || (nohup openclaw gateway --force --port 18789 >> /var/log/openclaw-gateway.log 2>&1 &)
```

---

## 8. Test

From CT 101 or any machine with access:
```bash
# Test the agent responds with brand knowledge
openclaw agent --agent main -m "Menu Spotlight task. Write a 2-sentence caption for The Fat Sam. Respond as JSON: {\"caption\": \"...\", \"hashtags\": \"...\"}"
```

Expected: response mentions Kilt Lifter braise, tobacco onions, roasted garlic aioli (from workspace MEMORY.md). If it gives a generic response, the workspace files didn't load.

---

## 9. Wire n8n

Once CT 105 is on Tailscale, set this environment variable in n8n (NAS 192.168.0.69:5678):

```
OPENCLAW_JEMS_URL=http://<CT105_TAILSCALE_IP>:18789
```

**Important**: The gateway is WebSocket-only — it returns 405 on REST POST to `/v1/chat/completions`. The n8n workflows currently use HTTP Request nodes which won't work directly. Options:

**Option A: HTTP proxy wrapper** (recommended)
Create a small Express/Fastify server on CT 105 that accepts POST `/v1/chat/completions` and internally calls `openclaw agent -m "..." --json`. Exposes the agent as a standard OpenAI-compatible API.

**Option B: n8n Execute Command via SSH**
Change the n8n workflow OpenClaw nodes from HTTP Request to Execute Command:
```bash
ssh root@<CT105_TAILSCALE_IP> 'openclaw agent -m "..." --json'
```

**Option C: Check for undocumented HTTP mode**
`openclaw gateway --help` or docs may reveal an HTTP/REST compatibility layer. Check `https://docs.openclaw.ai/cli/gateway`.

Use your judgment on which approach is cleanest.

---

## 10. Reference Files

All source files are in `SynologyDrive/culinary-jems/marketing/`:

| File | Purpose |
|------|---------|
| `openclaw-workspace/SOUL.md` | Master brand voice + personality |
| `openclaw-workspace/IDENTITY.md` | Agent role definition |
| `openclaw-workspace/MEMORY.md` | Full menu data (6 sliders + sides) |
| `openclaw-workspace/content-templates.md` | JSON output formats per task type |
| `openclaw-workspace/graphic-specs.md` | Brand design tokens + template specs |
| `SETUP-GUIDE.md` | Full setup guide (Discord, Google Sheet, Meta API, n8n) |
| `n8n-workflows/*.json` | 6 workflow JSONs (already imported to n8n, IDs below) |
| `templates/*.html` | 5 branded graphic templates |
| `render-template.js` | Puppeteer rendering script |

### n8n Workflow IDs (already imported, inactive)
- `EcLcoBKEB3Oas2Pf` — Photo Intake Pipeline
- `0PCWenvwS0QEQkKK` — Weekly Content Planner
- `m5cpLEIbF0tZzA2y` — Schedule Event Post Generator
- `UkjnFBmQsJoryHr8` — Auto-Poster
- `akUDoQDiJRRPjfJW` — Day-of Hype
- `92n0UK1vFQHFi1o7` — Engagement Monitor
