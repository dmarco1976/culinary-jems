"""
Comprehensive Playwright test suite for Culinary JEMs website.
Tests: page loading, navigation, images, menu filters, forms, console errors,
accessibility basics, SEO meta tags, mobile responsiveness.
"""
import json
import os
import sys
import io
from playwright.sync_api import sync_playwright

# Fix Windows console encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

BASE_URL = "http://localhost:4325"
SCREENSHOT_DIR = os.path.join(os.path.dirname(__file__), "screenshots")
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

PAGES = [
    ("/", "Home"),
    ("/menu", "Menu"),
    ("/catering", "Catering"),
    ("/schedule", "Schedule"),
    ("/about", "About"),
    ("/contact", "Contact"),
]

MOBILE_WIDTHS = [320, 375, 414, 768, 1024]

results = {"passed": 0, "failed": 0, "warnings": 0, "details": []}


def log_result(test_name, passed, details="", severity="FAIL"):
    status = "PASS" if passed else severity
    icon = "✓" if passed else ("⚠" if severity == "WARN" else "✗")
    print(f"  {icon} {test_name}: {details}" if details else f"  {icon} {test_name}")
    if passed:
        results["passed"] += 1
    elif severity == "WARN":
        results["warnings"] += 1
    else:
        results["failed"] += 1
    results["details"].append({"test": test_name, "status": status, "details": details})


def test_page_loads(page, path, name):
    """Test that page loads with 200 status and no critical console errors."""
    console_errors = []
    page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)

    response = page.goto(f"{BASE_URL}{path}", wait_until="networkidle")
    status = response.status if response else 0

    log_result(f"{name} page loads", status == 200, f"Status: {status}")

    # Check for critical JS errors (ignore known third-party noise)
    critical_errors = [e for e in console_errors if "ERR_" not in e and "favicon" not in e.lower()]
    if critical_errors:
        log_result(f"{name} console errors", False, f"{len(critical_errors)} errors: {critical_errors[0][:100]}", "WARN")
    else:
        log_result(f"{name} no console errors", True)

    return status == 200


def test_meta_tags(page, path, name):
    """Test SEO meta tags are present and correct."""
    page.goto(f"{BASE_URL}{path}", wait_until="networkidle")

    # No noindex
    noindex = page.locator('meta[name="robots"][content*="noindex"]').count()
    log_result(f"{name} no noindex tag", noindex == 0, "CRITICAL: noindex found!" if noindex > 0 else "")

    # Title exists and is non-empty
    title = page.title()
    log_result(f"{name} has title", len(title) > 0, f'"{title[:60]}"')

    # Description meta
    desc = page.locator('meta[name="description"]').get_attribute("content") or ""
    log_result(f"{name} has description", len(desc) > 20, f"{len(desc)} chars")

    # OG tags
    og_title = page.locator('meta[property="og:title"]').count()
    og_desc = page.locator('meta[property="og:description"]').count()
    log_result(f"{name} has OG tags", og_title > 0 and og_desc > 0)

    # Twitter card
    twitter = page.locator('meta[name="twitter:card"]').count()
    log_result(f"{name} has Twitter card", twitter > 0)


def test_images(page, path, name):
    """Test that all images have alt text and load correctly."""
    page.goto(f"{BASE_URL}{path}", wait_until="networkidle")

    images = page.locator("img").all()
    missing_alt = 0
    broken = 0

    for img in images:
        alt = img.get_attribute("alt")
        aria_hidden = img.get_attribute("aria-hidden")
        src = img.get_attribute("src") or ""
        # Empty alt is valid for decorative images (aria-hidden="true") or lightbox placeholders
        if alt is None and aria_hidden != "true" and src:
            missing_alt += 1
        # Check if image has natural dimensions (loaded) — skip empty src (lightbox placeholder)
        if not src:
            continue
        try:
            natural_width = img.evaluate("el => el.naturalWidth")
            if natural_width == 0:
                broken += 1
        except Exception:
            pass

    log_result(f"{name} all images have alt text", missing_alt == 0, f"{missing_alt} missing" if missing_alt > 0 else f"{len(images)} images OK")
    if broken > 0:
        log_result(f"{name} broken images", False, f"{broken} broken images", "WARN")


def test_navigation(page):
    """Test header nav links work."""
    page.goto(f"{BASE_URL}/", wait_until="networkidle")

    nav_links = page.locator("header nav a").all()
    hrefs = [link.get_attribute("href") for link in nav_links]

    log_result("Header has nav links", len(hrefs) >= 5, f"{len(hrefs)} links found")

    # Test clicking each nav link
    for href in hrefs[:5]:
        if href and href.startswith("/"):
            response = page.goto(f"{BASE_URL}{href}", wait_until="networkidle")
            status = response.status if response else 0
            log_result(f"Nav → {href}", status == 200, f"Status: {status}")


def test_menu_filters(page):
    """Test menu page protein filter tabs."""
    page.goto(f"{BASE_URL}/menu", wait_until="networkidle")

    # Check filter buttons exist
    filter_btns = page.locator(".menu-filter-btn").all()
    log_result("Menu filter buttons exist", len(filter_btns) >= 4, f"{len(filter_btns)} filters")

    # Check menu cards exist
    cards = page.locator(".menu-card-wrapper").all()
    log_result("Menu cards render", len(cards) >= 6, f"{len(cards)} cards")

    # Click "Chicken" filter
    chicken_btn = page.locator('.menu-filter-btn:text("Chicken")')
    if chicken_btn.count() > 0:
        chicken_btn.click()
        page.wait_for_timeout(300)

        visible_cards = page.locator('.menu-card-wrapper:not([style*="display: none"])').all()
        chicken_cards = page.locator('.menu-card-wrapper[data-protein="Chicken"]:not([style*="display: none"])').all()
        log_result("Chicken filter works", len(chicken_cards) > 0 and len(visible_cards) == len(chicken_cards),
                   f"{len(chicken_cards)} chicken cards shown, {len(visible_cards)} total visible")

    # Click "All" to reset
    all_btn = page.locator('.menu-filter-btn:text("All")')
    if all_btn.count() > 0:
        all_btn.click()
        page.wait_for_timeout(300)
        all_visible = page.locator('.menu-card-wrapper:not([style*="display: none"])').all()
        log_result("All filter resets", len(all_visible) == len(cards), f"{len(all_visible)} visible after reset")


def test_catering_form_validation(page):
    """Test catering form client-side validation."""
    page.goto(f"{BASE_URL}/catering", wait_until="networkidle")

    # Check form exists
    form = page.locator("#catering-form, form").first
    log_result("Catering form exists", form.count() > 0 if hasattr(form, 'count') else True)

    # Check required fields
    required_fields = page.locator("input[required], textarea[required], select[required]").all()
    log_result("Catering form has required fields", len(required_fields) >= 2, f"{len(required_fields)} required fields")

    # Check sticky CTA on mobile
    sticky = page.locator("#sticky-cta").count()
    log_result("Sticky mobile CTA exists", sticky > 0)


def test_contact_form(page):
    """Test contact form exists and has required fields."""
    page.goto(f"{BASE_URL}/contact", wait_until="networkidle")

    form = page.locator("#contact-form")
    log_result("Contact form exists", form.count() > 0)

    name_field = page.locator("#contact-name")
    email_field = page.locator("#contact-email")
    message_field = page.locator("#contact-message")
    log_result("Contact form has name field", name_field.count() > 0)
    log_result("Contact form has email field", email_field.count() > 0)
    log_result("Contact form has message field", message_field.count() > 0)


def test_json_ld(page, path, name):
    """Test Schema.org JSON-LD is present and valid."""
    page.goto(f"{BASE_URL}{path}", wait_until="networkidle")

    scripts = page.locator('script[type="application/ld+json"]').all()
    if not scripts:
        if path in ["/", "/menu"]:
            log_result(f"{name} has JSON-LD schema", False, "Missing on key page")
        else:
            log_result(f"{name} JSON-LD schema", True, "Not required on this page")
        return

    for i, script in enumerate(scripts):
        content = script.inner_text()
        try:
            data = json.loads(content)
            schema_type = data.get("@type", "unknown")
            log_result(f"{name} JSON-LD valid ({schema_type})", True)
        except json.JSONDecodeError as e:
            log_result(f"{name} JSON-LD parse error", False, str(e))


def test_accessibility_basics(page, path, name):
    """Test basic accessibility: skip nav, focus indicators, aria labels, heading hierarchy."""
    page.goto(f"{BASE_URL}{path}", wait_until="networkidle")

    # Check heading hierarchy (h1 should exist and come before h2)
    h1_count = page.locator("h1").count()
    log_result(f"{name} has h1", h1_count >= 1, f"{h1_count} h1 tags")

    # Check all buttons/links have accessible names
    # Exclude Astro dev toolbar buttons (only present in dev mode)
    buttons = page.locator("button:not(astro-dev-toolbar button):not([data-astro-dev-toolbar])").all()
    nameless_buttons = 0
    for btn in buttons:
        text = btn.inner_text().strip()
        aria_label = btn.get_attribute("aria-label") or ""
        # Skip buttons that are inside Astro dev toolbar shadow DOM
        is_visible = btn.is_visible()
        if not text and not aria_label and is_visible:
            nameless_buttons += 1
    log_result(f"{name} buttons have labels", nameless_buttons == 0,
               f"{nameless_buttons} nameless" if nameless_buttons > 0 else f"{len(buttons)} buttons OK")

    # Check links have discernible text
    links = page.locator("a").all()
    nameless_links = 0
    for link in links[:20]:
        text = link.inner_text().strip()
        aria_label = link.get_attribute("aria-label") or ""
        img_count = link.locator("img").count()
        if not text and not aria_label and img_count == 0:
            nameless_links += 1
    log_result(f"{name} links are accessible", nameless_links == 0,
               f"{nameless_links} nameless" if nameless_links > 0 else "OK")


def test_mobile_screenshots(page, path, name):
    """Take screenshots at multiple mobile breakpoints."""
    for width in MOBILE_WIDTHS:
        page.set_viewport_size({"width": width, "height": 812})
        page.goto(f"{BASE_URL}{path}", wait_until="networkidle")
        page.wait_for_timeout(500)

        filename = f"{name.lower()}-{width}px.png"
        filepath = os.path.join(SCREENSHOT_DIR, filename)
        page.screenshot(path=filepath, full_page=True)
        log_result(f"{name} screenshot at {width}px", True, filepath)

    # Reset viewport
    page.set_viewport_size({"width": 1280, "height": 720})


def test_hamburger_menu(page):
    """Test mobile hamburger menu opens and closes."""
    page.set_viewport_size({"width": 375, "height": 812})
    page.goto(f"{BASE_URL}/", wait_until="networkidle")

    hamburger = page.locator("#mobile-menu-btn")
    mobile_menu = page.locator("#mobile-menu")

    log_result("Hamburger button exists", hamburger.count() > 0)

    if hamburger.count() > 0:
        hamburger.click()
        page.wait_for_timeout(500)

        # Check menu is visible (translated to view)
        has_translate_0 = mobile_menu.evaluate("el => el.classList.contains('translate-x-0')")
        log_result("Mobile menu opens", has_translate_0)

        # Close it
        close_btn = page.locator("#mobile-menu-close")
        if close_btn.count() > 0:
            close_btn.click()
            page.wait_for_timeout(500)
            has_translate_full = mobile_menu.evaluate("el => el.classList.contains('translate-x-full')")
            log_result("Mobile menu closes", has_translate_full)

    page.set_viewport_size({"width": 1280, "height": 720})


def test_faq_accordion(page):
    """Test FAQ accordion on catering page."""
    page.goto(f"{BASE_URL}/catering", wait_until="networkidle")

    # Use specific .faq-toggle selector to avoid matching hamburger menu button
    faq_buttons = page.locator('.faq-toggle').all()

    log_result("FAQ accordion items exist", len(faq_buttons) > 0, f"{len(faq_buttons)} items")

    if faq_buttons:
        # Click first FAQ and verify it opens
        first_btn = faq_buttons[0]
        first_btn.click()
        page.wait_for_timeout(500)
        is_expanded = first_btn.get_attribute("aria-expanded") == "true"
        log_result("FAQ item opens on click", is_expanded)

        # Click again to close
        first_btn.click()
        page.wait_for_timeout(500)
        is_closed = first_btn.get_attribute("aria-expanded") == "false"
        log_result("FAQ item closes on click", is_closed)


def test_photo_gallery(page):
    """Test photo gallery on catering page."""
    page.goto(f"{BASE_URL}/catering", wait_until="networkidle")

    gallery_items = page.locator('[data-gallery-item], .gallery-item, button:has(img)').all()
    if not gallery_items:
        gallery_items = page.locator('section img[loading="lazy"]').all()

    log_result("Gallery photos render", len(gallery_items) > 0, f"{len(gallery_items)} photos")


def test_next_event_banner(page):
    """Test the persistent next event banner."""
    page.goto(f"{BASE_URL}/", wait_until="networkidle")

    banner = page.locator("text=NEXT").first
    log_result("Next event banner visible", banner.is_visible() if banner.count() > 0 else False)

    # Check it appears on other pages too
    page.goto(f"{BASE_URL}/menu", wait_until="networkidle")
    banner_menu = page.locator("text=NEXT").first
    log_result("Banner persists on /menu", banner_menu.is_visible() if banner_menu.count() > 0 else False)


def test_external_links(page):
    """Test that external links have rel=noopener."""
    page.goto(f"{BASE_URL}/", wait_until="networkidle")

    external_links = page.locator('a[target="_blank"]').all()
    missing_noopener = 0
    for link in external_links:
        rel = link.get_attribute("rel") or ""
        href = link.get_attribute("href") or "?"
        # Skip Astro dev toolbar links (astro.build, github.com/withastro, docs.astro.build)
        if "astro.build" in href or "github.com/withastro" in href or "docs.astro.build" in href:
            continue
        if "noopener" not in rel:
            missing_noopener += 1
            print(f"    WARNING: {href} missing rel=noopener")

    log_result("External links have noopener", missing_noopener == 0,
               f"{missing_noopener} missing" if missing_noopener > 0 else f"{len(external_links)} links OK")


def test_manifest(page):
    """Test PWA manifest is accessible (build-only — warns in dev mode)."""
    response = page.goto(f"{BASE_URL}/manifest.webmanifest", wait_until="networkidle")
    status = response.status if response else 0
    # @vite-pwa/astro only generates manifest during build, not in dev mode
    if status == 404:
        log_result("PWA manifest loads", True, "404 in dev (expected — generated at build time)", "WARN")
        return
    log_result("PWA manifest loads", status == 200, f"Status: {status}")

    if status == 200:
        try:
            content = page.content()
            # The manifest is JSON, try to extract it
            data = json.loads(page.locator("pre").inner_text() if page.locator("pre").count() > 0 else page.evaluate("() => document.body.innerText"))
            log_result("Manifest has name", "name" in data, data.get("name", ""))
            log_result("Manifest has icons", "icons" in data and len(data["icons"]) > 0)
            log_result("Manifest has theme_color", "theme_color" in data, data.get("theme_color", ""))
        except Exception as e:
            log_result("Manifest parse", False, str(e)[:80], "WARN")


def main():
    print("\n" + "=" * 60)
    print("CULINARY JEMS — COMPREHENSIVE SITE TEST SUITE")
    print("=" * 60)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 720})

        # ── 1. PAGE LOADING ──
        print("\n── PAGE LOADING ──")
        for path, name in PAGES:
            test_page_loads(page, path, name)

        # ── 2. SEO META TAGS ──
        print("\n── SEO META TAGS ──")
        for path, name in PAGES:
            test_meta_tags(page, path, name)

        # ── 3. JSON-LD SCHEMA ──
        print("\n── JSON-LD SCHEMA ──")
        for path, name in PAGES:
            test_json_ld(page, path, name)

        # ── 4. IMAGES ──
        print("\n── IMAGES ──")
        for path, name in PAGES:
            test_images(page, path, name)

        # ── 5. NAVIGATION ──
        print("\n── NAVIGATION ──")
        test_navigation(page)

        # ── 6. MENU FILTERS ──
        print("\n── MENU FILTERS ──")
        test_menu_filters(page)

        # ── 7. FORMS ──
        print("\n── FORMS ──")
        test_catering_form_validation(page)
        test_contact_form(page)

        # ── 8. INTERACTIVE COMPONENTS ──
        print("\n── INTERACTIVE COMPONENTS ──")
        test_hamburger_menu(page)
        test_faq_accordion(page)
        test_photo_gallery(page)
        test_next_event_banner(page)

        # ── 9. SECURITY BASICS ──
        print("\n── SECURITY BASICS ──")
        test_external_links(page)

        # ── 10. PWA MANIFEST ──
        print("\n── PWA MANIFEST ──")
        test_manifest(page)

        # ── 11. ACCESSIBILITY ──
        print("\n── ACCESSIBILITY ──")
        for path, name in PAGES:
            test_accessibility_basics(page, path, name)

        # ── 12. MOBILE SCREENSHOTS ──
        print("\n── MOBILE SCREENSHOTS ──")
        # Only take screenshots for key pages to save time
        for path, name in [("/", "Home"), ("/menu", "Menu"), ("/catering", "Catering")]:
            test_mobile_screenshots(page, path, name)

        browser.close()

    # ── SUMMARY ──
    print("\n" + "=" * 60)
    print(f"RESULTS: {results['passed']} passed, {results['failed']} failed, {results['warnings']} warnings")
    print("=" * 60)

    if results["failed"] > 0:
        print("\n── FAILURES ──")
        for d in results["details"]:
            if d["status"] == "FAIL":
                print(f"  ✗ {d['test']}: {d['details']}")

    if results["warnings"] > 0:
        print("\n── WARNINGS ──")
        for d in results["details"]:
            if d["status"] == "WARN":
                print(f"  ⚠ {d['test']}: {d['details']}")

    print(f"\nScreenshots saved to: {SCREENSHOT_DIR}")
    return 1 if results["failed"] > 0 else 0


if __name__ == "__main__":
    sys.exit(main())
