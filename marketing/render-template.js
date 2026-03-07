#!/usr/bin/env node
/**
 * Culinary JEMs — Template Renderer
 *
 * Renders HTML marketing templates to PNG using Puppeteer.
 * Used by n8n workflows to generate branded social media graphics.
 *
 * Usage:
 *   node render-template.js <template> <variables-json> <output-path>
 *
 * Examples:
 *   node render-template.js schedule-card '{"venue":"SanTan Brewing","date":"Friday, March 7","time":"5:00 - 9:00 PM","address":"8 S San Marcos Pl","city":"Chandler, AZ"}' ./output/schedule.png
 *   node render-template.js menu-spotlight '{"name":"The Fat Sam","protein":"Beef","description":"Four Peaks Kilt Lifter braised beef, tobacco onions, roasted garlic aioli","photoUrl":"./photos/fat-sam.jpg"}' ./output/spotlight.png
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Template dimensions
const DIMENSIONS = {
  'schedule-card':   { width: 1080, height: 1080 },
  'menu-spotlight':  { width: 1080, height: 1080 },
  'story-event':     { width: 1080, height: 1920 },
  'event-recap':     { width: 1080, height: 1080 },
  'catering-promo':  { width: 1080, height: 1080 },
};

// Default variable values (logo path, fallback images)
const DEFAULTS = {
  logoUrl: path.resolve(__dirname, '../public/assets/imported/logo.png'),
};

function toFileUrl(filePath) {
  const resolved = path.resolve(filePath).replace(/\\/g, '/');
  // Windows paths need three slashes: file:///C:/...
  if (/^[A-Z]:/.test(resolved)) {
    return `file:///${resolved}`;
  }
  return `file://${resolved}`;
}

async function renderTemplate(templateName, variables, outputPath) {
  // Validate template exists
  const templateDir = path.resolve(__dirname, 'templates');
  const templatePath = path.join(templateDir, `${templateName}.html`);
  if (!fs.existsSync(templatePath)) {
    const available = Object.keys(DIMENSIONS).join(', ');
    throw new Error(`Template "${templateName}" not found. Available: ${available}`);
  }

  // Get dimensions
  const dims = DIMENSIONS[templateName];
  if (!dims) {
    throw new Error(`No dimensions defined for template "${templateName}"`);
  }

  // Merge defaults with provided variables
  const vars = { ...DEFAULTS, ...variables };

  // Resolve local file paths to file:// URLs
  for (const [key, value] of Object.entries(vars)) {
    if (typeof value === 'string' && !value.startsWith('http') && !value.startsWith('file://') && !value.startsWith('data:')) {
      // Resolve relative to CWD
      const resolved = path.resolve(value);
      if (fs.existsSync(resolved)) {
        vars[key] = toFileUrl(resolved);
      }
    }
  }

  // Read template HTML
  let html = fs.readFileSync(templatePath, 'utf-8');

  // Replace the stylesheet link with an absolute file:// URL
  const stylesPath = path.join(templateDir, 'styles.css');
  html = html.replace(
    'href="styles.css"',
    `href="${toFileUrl(stylesPath)}"`
  );

  // Replace {{variable}} placeholders
  for (const [key, value] of Object.entries(vars)) {
    const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    html = html.replace(placeholder, String(value));
  }

  // Ensure output directory exists
  const outputDir = path.dirname(path.resolve(outputPath));
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write a temp HTML file so Puppeteer can navigate to it via file:// protocol.
  // This gives proper access to file:// resources (images, CSS).
  const tmpFile = path.join(os.tmpdir(), `culinaryjems-${templateName}-${Date.now()}.html`);
  fs.writeFileSync(tmpFile, html, 'utf-8');

  // Launch Puppeteer and render
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--allow-file-access-from-files',
      '--disable-web-security',
    ],
  });

  try {
    const page = await browser.newPage();

    // Set viewport to exact template dimensions
    await page.setViewport({
      width: dims.width,
      height: dims.height,
      deviceScaleFactor: 1,
    });

    // Navigate to the temp file (file:// protocol for local resource access)
    await page.goto(toFileUrl(tmpFile), {
      waitUntil: 'networkidle0',
      timeout: 15000,
    });

    // Wait for fonts to load
    await page.evaluateHandle('document.fonts.ready');

    // Wait for images to render
    await new Promise(resolve => setTimeout(resolve, 800));

    // Screenshot at exact dimensions
    await page.screenshot({
      path: path.resolve(outputPath),
      type: 'png',
      clip: {
        x: 0,
        y: 0,
        width: dims.width,
        height: dims.height,
      },
    });

    console.log(`✓ Rendered ${templateName} → ${outputPath} (${dims.width}x${dims.height})`);
    return outputPath;
  } finally {
    await browser.close();
    // Clean up temp file
    try { fs.unlinkSync(tmpFile); } catch {}
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.error('Usage: node render-template.js <template-name> <variables-json> <output-path>');
    console.error('');
    console.error('Templates:', Object.keys(DIMENSIONS).join(', '));
    console.error('');
    console.error('Example:');
    console.error('  node render-template.js schedule-card \'{"venue":"SanTan Brewing","date":"Friday, March 7","time":"5-9 PM","address":"8 S San Marcos Pl","city":"Chandler, AZ"}\' ./output/schedule.png');
    process.exit(1);
  }

  const [templateName, variablesJson, outputPath] = args;

  let variables;
  try {
    variables = JSON.parse(variablesJson);
  } catch (err) {
    // If it's a file path, try reading it
    if (fs.existsSync(variablesJson)) {
      variables = JSON.parse(fs.readFileSync(variablesJson, 'utf-8'));
    } else {
      console.error('Error: Could not parse variables JSON:', err.message);
      process.exit(1);
    }
  }

  try {
    await renderTemplate(templateName, variables, outputPath);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

// Export for programmatic use (n8n Execute Command node)
module.exports = { renderTemplate, DIMENSIONS };

// Run CLI if called directly
if (require.main === module) {
  main();
}
