# Content Task Reference

These define the JSON output format and task-specific rules for each content type. Brand voice, menu data, and hashtags are already loaded via your workspace files (SOUL.md, MEMORY.md) — do NOT repeat them here.

---

## Menu Spotlight

**Task-specific rules:**
- Open with a hook (ingredient callout or bold statement)
- Sensory, specific language — NO generic words like "yummy" or "delicious"
- Mention key ingredients by name
- Include 1 story element (why this slider exists, fan favorite status)
- 100-180 words + 5-7 hashtags
- End with a CTA

**JSON output:**
```json
{"caption": "...", "hashtags": "...", "suggested_image": "..."}
```

---

## Schedule Announcement

**Task-specific rules:**
- Open with excitement about the venue
- Clearly state venue name, date, and time
- Mention 1-2 sliders to build anticipation
- If brewery, mention pairing food + drinks
- 60-120 words + 5-7 hashtags
- End with location CTA

**JSON output:**
```json
{"caption": "...", "hashtags": "..."}
```

---

## Day-of Hype

**Task-specific rules:**
- CAPTION: Start with "TONIGHT!" or "TODAY!" in caps
- List 2-3 slider names
- Mention venue and time
- 50-80 words + 5 hashtags
- End with "See you there!" or similar
- STORY_TEXT: 5-10 words for graphic overlay
- HEADLINE: "TONIGHT!" or "TODAY!"

**JSON output:**
```json
{"caption": "...", "hashtags": "...", "story_text": "...", "headline": "TONIGHT!"}
```

---

## Weekly Content Plan

**Task-specific rules:**
- Follow the content pillar rotation (Mon-Sun)
- Each day's caption must be complete and ready to post
- Mark which days need fresh photos vs. library photos
- Vary slider features (don't repeat recent posts)

**JSON output:**
```json
{
  "days": [
    {
      "day": "Monday",
      "pillar": "Menu Spotlight",
      "caption": "...",
      "hashtags": "...",
      "needs_photo": false,
      "suggested_image": "...",
      "notes": "..."
    }
  ]
}
```

---

## Event Recap

**Task-specific rules:**
- Thank the venue by name (tag them)
- Mention crowd/vibe/highlight moment
- Reference a popular slider if known
- Look forward to next time
- 60-120 words + 5-7 hashtags

**JSON output:**
```json
{"caption": "...", "hashtags": "..."}
```

---

## Catering Promo

**Task-specific rules:**
- Open with a question or scenario
- Highlight: gourmet sliders, professional service, customizable menu
- Mention: corporate, private parties, weddings, festivals
- CTA: culinaryjems.com/catering
- 80-150 words + 5-7 hashtags (include #CateringAZ #EventCatering)

**JSON output:**
```json
{"caption": "...", "hashtags": "..."}
```

---

## Caption from Photo

**Task-specific rules:**
- Match the photo's vibe (close-up = ingredient-focused, wide = venue/event-focused)
- If you can identify a specific slider, name it
- 80-150 words + CTA + 5-7 hashtags
- If unsure, keep it general about gourmet sliders

**JSON output:**
```json
{"caption": "...", "hashtags": "...", "suggested_pillar": "..."}
```

---

## Comment Reply

**Task-specific rules:**
- Short (1-2 sentences)
- Emojis sparingly (1-2 max)
- Gracious for compliments
- Helpful and direct for questions
- Empathetic for complaints, offer to make it right

**JSON output:**
```json
{"reply": "..."}
```
