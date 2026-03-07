# Culinary JEMs — Website Setup Guide

Hey! Your new website is live at **https://culinary-jems.netlify.app** and ready to go. There are 3 things we need you to do to finish the setup. Each one has step-by-step instructions below.

**You'll need:**
- Your SiteGround account login (for the domain)
- Your culinaryjems@gmail.com Google account (for the form handler)
- About 20 minutes total

---

## Part 1: Connect Your Domain (culinaryjems.com)

Right now the site is at `culinary-jems.netlify.app`. We need to point your real domain to it.

### Step 1: Add the domain in Netlify

1. Go to **https://app.netlify.com/projects/culinary-jems**
2. Click **Domain management** (in the left sidebar, under "Configuration")
3. Click **Add a domain**
4. Type `culinaryjems.com` and click **Verify**
5. Click **Add domain**
6. Netlify will show you that it needs DNS verification — that's fine, we'll do that next

### Step 2: Log into SiteGround

1. Go to **https://my.siteground.com** and log in
2. If you don't remember your password, use the "Forgot Password" link — it'll go to whatever email you signed up with

### Step 3: Change the DNS records

Once logged into SiteGround:

1. Go to **Services** → **Domains** (or click on your domain name)
2. Look for **DNS Zone Editor** or **Manage DNS**
3. Find the **A Record** for `@` (or `culinaryjems.com`) — it currently points to `35.215.88.10`
4. **Change it** to point to: `75.2.60.5`
   - (This is Netlify's load balancer IP)
5. Find or create a **CNAME Record** for `www`:
   - **Host/Name**: `www`
   - **Points to**: `culinary-jems.netlify.app`
6. Click **Save** or **Confirm**

### Step 4: Wait for it to work

- DNS changes take **15 minutes to 48 hours** to fully kick in
- You can check progress by going to `culinaryjems.com` in your browser
- Once it works, Netlify automatically sets up HTTPS (the lock icon)

### Step 5: (Optional) Switch nameservers entirely

If you want Netlify to manage ALL your DNS (recommended — simpler long-term):

1. In SiteGround, go to **Domains** → **Nameservers**
2. Change from SiteGround's nameservers to Netlify's:
   - You'll find Netlify's nameservers in the Netlify dashboard under Domain management → click on your domain → "Set up Netlify DNS"
   - They look like: `dns1.p0X.nsone.net` (Netlify will show you the exact ones)
3. Save the changes

> **Note:** After moving the domain away, you can cancel your SiteGround hosting plan if you want — you won't need it anymore. The new site is hosted for free on Netlify.

---

## Part 2: Set Up the Contact/Catering Form Handler

When someone fills out the catering or contact form on the website, the form data gets sent to a Google Apps Script that:
- **Sends you an email** at culinaryjems@gmail.com with all the details
- **Logs every submission** to a Google Sheet so you can track leads

### Step 1: Create the Google Apps Script

1. Log into Google with your **culinaryjems@gmail.com** account
2. Go to **https://script.google.com**
3. Click the blue **+ New project** button
4. You'll see some default code — **select it all and delete it**
5. Ask Dominic for the form handler code (it's in the `google-apps-script/Code.gs` file) — copy and paste the entire thing into the editor
6. Click on "Untitled project" at the top and rename it to **Culinary JEMs Forms**
7. Click the **Save** icon (floppy disk) or press Ctrl+S

### Step 2: Run the initial setup

1. In the script editor, look at the top toolbar — there's a dropdown that says "myFunction" or "setup"
2. **Select `setup`** from that dropdown
3. Click the **Run** button (the play icon ▶)
4. Google will ask for permissions:
   - Click **Review permissions**
   - Choose your **culinaryjems@gmail.com** account
   - You might see a "This app isn't verified" warning — click **Advanced** → **Go to Culinary JEMs Forms (unsafe)** — this is YOUR script, it's safe
   - Click **Allow**
5. Look at the **Execution log** at the bottom — it will show a Google Sheet URL
6. **Open that URL** and bookmark it — this is where all your form submissions will be tracked!

### Step 3: Deploy as a Web App

1. In the script editor, click **Deploy** → **New deployment**
2. Click the **gear icon** ⚙ next to "Select type" → choose **Web app**
3. Fill in:
   - **Description**: `Culinary JEMs form handler`
   - **Execute as**: **Me** (culinaryjems@gmail.com)
   - **Who has access**: **Anyone**
4. Click **Deploy**
5. You'll see a **Web app URL** — it looks like:
   `https://script.google.com/macros/s/REALLY_LONG_ID_HERE/exec`
6. **Copy this URL** — you need it for the next step

### Step 4: Add the URL to Netlify

1. Go to **https://app.netlify.com/projects/culinary-jems**
2. Click **Site configuration** → **Environment variables**
3. Click **Add a variable**
4. Set:
   - **Key**: `PUBLIC_CATERING_FORM_URL`
   - **Value**: paste the Web App URL you copied
5. Click **Save**
6. Go to **Deploys** → click **Trigger deploy** → **Deploy site**
   - This rebuilds the site with the form URL baked in

### Step 5: Test the forms!

1. Go to **culinaryjems.com/catering** (or the Netlify URL if the domain isn't connected yet)
2. Fill out the catering form with fake test data and submit
3. Check TWO things:
   - **Your email** (culinaryjems@gmail.com) — you should get a nicely formatted email with the form details
   - **The Google Sheet** (the one you bookmarked in Step 2) — a new row should appear with all the data
4. Do the same test on the **/contact** page

> **If you need to change anything later** (like the email address):
> 1. Go to https://script.google.com
> 2. Open the "Culinary JEMs Forms" project
> 3. Edit the code
> 4. Click **Deploy** → **Manage deployments** → **Edit** (pencil icon)
> 5. Set version to "New version" and click **Deploy**

---

## Part 3: Your Google Sheet (Lead Tracker)

The Google Sheet that was created in Part 2 is your lead tracking system. Here's how it works:

### What gets logged

Every form submission creates a new row with these columns:

| Column | What it means |
|--------|---------------|
| Timestamp | When they submitted (Arizona time) |
| Form Type | "catering" or "contact" |
| Name | Their name |
| Email | Their email address |
| Phone | Their phone number |
| Event Type | Corporate, Wedding, etc. (catering forms only) |
| Headcount | How many guests (catering only) |
| Preferred Date | When they want the event (catering only) |
| Location | Where the event is (catering only) |
| Subject | Subject line (contact forms only) |
| Message / Details | Their message or event details |

### Tips for using the Sheet

- **Bookmark the Sheet URL** so you can check it anytime
- You can **add your own columns** (like "Status", "Follow-up Date", "Notes") to track your responses — the form will keep adding new rows and won't touch your extra columns
- You can **sort and filter** to see just catering inquiries, or just this month's submissions
- You can **share the Sheet** with anyone who helps manage catering leads
- The Sheet supports up to **10 million cells** — you'll never run out of room
- If you want email notifications on your phone, the Gmail app will buzz you for each new form submission

### Finding the Sheet later

If you lose the bookmark:
1. Go to **https://drive.google.com** (logged in as culinaryjems@gmail.com)
2. Search for **"Culinary JEMs — Form Submissions"**
3. It'll be right there

### Daily limits

- **100 emails per day** on a free Google account
- The Google Sheet has no practical limit

---

## Quick Reference

| What | Where |
|------|-------|
| Live site | https://culinary-jems.netlify.app |
| Netlify dashboard | https://app.netlify.com/projects/culinary-jems |
| Google Apps Script | https://script.google.com (log in as culinaryjems@gmail.com) |
| Form submissions Sheet | Check your Google Drive (search "Culinary JEMs — Form Submissions") |
| Domain DNS | https://my.siteground.com (your SiteGround account) |

---

## Need Help?

If something doesn't work or you get stuck, text Dominic a screenshot and he'll sort it out.
