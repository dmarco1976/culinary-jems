# Google Apps Script — Setup Guide

## What This Does
- Receives form submissions from both the Catering and Contact forms
- Sends a branded HTML email to culinaryjems@gmail.com
- Logs every submission to a Google Sheet (your sister can track leads there)

## Setup Steps (5 minutes)

### 1. Create the Script
1. Go to [script.google.com](https://script.google.com)
2. Click **New Project**
3. Delete the default code, paste the contents of `Code.gs`
4. Name the project "Culinary JEMs Forms"

### 2. Run Initial Setup
1. In the script editor, select the `setup` function from the dropdown
2. Click **Run**
3. It will ask for permissions — click "Review permissions" → choose your Google account → "Allow"
4. Check the **Execution log** — it will show the Google Sheet URL
5. Open that Sheet URL and bookmark it — this is where all form submissions are logged

### 3. Deploy as Web App
1. Click **Deploy** → **New deployment**
2. Click the gear icon → select **Web app**
3. Settings:
   - **Description**: "Culinary JEMs form handler"
   - **Execute as**: "Me"
   - **Who has access**: "Anyone"
4. Click **Deploy**
5. Copy the **Web app URL** (looks like `https://script.google.com/macros/s/LONG_ID/exec`)

### 4. Add the URL to Your Site
Add this to your `.env` file (or Netlify environment variables):
```
PUBLIC_CATERING_FORM_URL=https://script.google.com/macros/s/YOUR_ID_HERE/exec
```

### 5. Test It
1. Go to your site's catering page
2. Fill out the form with test data
3. Verify:
   - You receive an email at culinaryjems@gmail.com
   - A new row appears in the Google Sheet

## Updating the Script
If you need to change anything (email address, fields, etc.):
1. Edit the script at script.google.com
2. Click **Deploy** → **Manage deployments** → **Edit** (pencil icon)
3. Set version to "New version" and click **Deploy**

## Limits
- **100 emails/day** on free Google accounts (a food truck won't approach this)
- **20,000 URL fetches/day** (also far more than needed)
- Google Sheet supports up to 10 million cells
