/**
 * Culinary JEMs — Form Handler (Google Apps Script)
 *
 * Handles submissions from both the Catering and Contact forms.
 * - Sends a formatted email notification to the owner
 * - Logs every submission to a Google Sheet
 *
 * SETUP:
 * 1. Go to https://script.google.com and create a new project
 * 2. Paste this entire file into Code.gs
 * 3. Update OWNER_EMAIL below with your real email
 * 4. Run setup() once to create the Google Sheet and set permissions
 * 5. Deploy → New Deployment → Web App → Execute as "Me", Access "Anyone"
 * 6. Copy the deployment URL into your .env as PUBLIC_CATERING_FORM_URL
 *
 * LIMITS: 100 emails/day on free Google account (plenty for a food truck)
 */

// ─── CONFIG ────────────────────────────────────────────────────────────────
var OWNER_EMAIL = 'culinaryjems@gmail.com';
var SHEET_NAME = 'Form Submissions';
var SUBJECT_CATERING = 'New Catering Inquiry — Culinary JEMs';
var SUBJECT_CONTACT = 'New Message — Culinary JEMs Website';
// ────────────────────────────────────────────────────────────────────────────

/**
 * Run this once to create the spreadsheet and log sheet.
 * Menu: Run → setup
 */
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    ss = SpreadsheetApp.create('Culinary JEMs — Form Submissions');
    Logger.log('Created spreadsheet: ' + ss.getUrl());
  }

  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // Header row
    sheet.appendRow([
      'Timestamp',
      'Form Type',
      'Name',
      'Email',
      'Phone',
      'Event Type',
      'Headcount',
      'Preferred Date',
      'Location',
      'Subject',
      'Message / Details'
    ]);
    sheet.getRange(1, 1, 1, 11).setFontWeight('bold');
    sheet.setFrozenRows(1);
    Logger.log('Created sheet: ' + SHEET_NAME);
  }

  // Store spreadsheet ID for doPost to find
  PropertiesService.getScriptProperties().setProperty('SHEET_ID', ss.getId());
  Logger.log('Setup complete. Spreadsheet URL: ' + ss.getUrl());
}

/**
 * Handles incoming POST requests from the website forms.
 * Deployed as a web app with "Execute as me" + "Anyone can access".
 */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    // Honeypot check — bots fill this hidden field
    if (data.website) {
      return jsonResponse({ status: 'ok' });
    }

    var formType = data.formType || 'catering';
    var timestamp = new Date().toLocaleString('en-US', { timeZone: 'America/Phoenix' });

    // ── Log to Google Sheet ──
    logToSheet(timestamp, formType, data);

    // ── Send email notification ──
    if (formType === 'contact') {
      sendContactEmail(data, timestamp);
    } else {
      sendCateringEmail(data, timestamp);
    }

    return jsonResponse({ status: 'ok', message: 'Submission received' });
  } catch (err) {
    Logger.log('Error in doPost: ' + err.toString());
    return jsonResponse({ status: 'error', message: err.toString() });
  }
}

/**
 * Handle GET requests (e.g., browser navigating to the URL directly).
 */
function doGet() {
  return ContentService
    .createTextOutput('Culinary JEMs form handler is running.')
    .setMimeType(ContentService.MimeType.TEXT);
}

// ─── EMAIL FUNCTIONS ────────────────────────────────────────────────────────

function sendCateringEmail(data, timestamp) {
  var subject = SUBJECT_CATERING;
  if (data.eventType) {
    subject += ' (' + data.eventType + ')';
  }

  var body = [
    '--- NEW CATERING INQUIRY ---',
    '',
    'Name:           ' + (data.name || 'Not provided'),
    'Email:          ' + (data.email || 'Not provided'),
    'Phone:          ' + (data.phone || 'Not provided'),
    '',
    'Event Type:     ' + (data.eventType || 'Not specified'),
    'Headcount:      ' + (data.headcount || 'Not specified'),
    'Preferred Date: ' + (data.preferredDate || 'Not specified'),
    'Location:       ' + (data.location || 'Not specified'),
    '',
    'Additional Details:',
    data.details || '(none)',
    '',
    '---',
    'Submitted: ' + timestamp,
    'Source: culinaryjems.com/catering'
  ].join('\n');

  var htmlBody = [
    '<div style="font-family: Arial, sans-serif; max-width: 600px;">',
    '<div style="background: #FFC559; padding: 16px 24px; border-radius: 8px 8px 0 0;">',
    '<h2 style="margin: 0; color: #111111;">New Catering Inquiry</h2>',
    '</div>',
    '<div style="background: #ffffff; padding: 24px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 8px 8px;">',
    '<table style="width: 100%; border-collapse: collapse;">',
    row('Name', escapeHtml(data.name)),
    row('Email', '<a href="mailto:' + escapeHtml(data.email || '') + '">' + escapeHtml(data.email || 'N/A') + '</a>'),
    row('Phone', data.phone ? '<a href="tel:' + escapeHtml(data.phone) + '">' + escapeHtml(data.phone) + '</a>' : 'N/A'),
    row('Event Type', escapeHtml(data.eventType), '#FFC559'),
    row('Headcount', escapeHtml(data.headcount)),
    row('Preferred Date', escapeHtml(data.preferredDate)),
    row('Location', escapeHtml(data.location)),
    '</table>',
    data.details ? '<div style="margin-top: 16px; padding: 12px; background: #f9f9f9; border-radius: 6px;"><strong>Details:</strong><br>' + escapeHtml(data.details).replace(/\n/g, '<br>') + '</div>' : '',
    '<p style="color: #999; font-size: 12px; margin-top: 20px;">Submitted ' + timestamp + ' from culinaryjems.com</p>',
    '</div>',
    '</div>'
  ].join('');

  MailApp.sendEmail({
    to: OWNER_EMAIL,
    subject: subject,
    body: body,
    htmlBody: htmlBody,
    replyTo: data.email || OWNER_EMAIL,
    name: 'Culinary JEMs Website'
  });
}

function sendContactEmail(data, timestamp) {
  var subject = SUBJECT_CONTACT;
  if (data.subject) {
    subject += ' — ' + data.subject;
  }

  var body = [
    '--- NEW CONTACT MESSAGE ---',
    '',
    'Name:    ' + (data.name || 'Not provided'),
    'Email:   ' + (data.email || 'Not provided'),
    'Subject: ' + (data.subject || 'General inquiry'),
    '',
    'Message:',
    data.message || '(empty)',
    '',
    '---',
    'Submitted: ' + timestamp,
    'Source: culinaryjems.com/contact'
  ].join('\n');

  var htmlBody = [
    '<div style="font-family: Arial, sans-serif; max-width: 600px;">',
    '<div style="background: #111111; padding: 16px 24px; border-radius: 8px 8px 0 0;">',
    '<h2 style="margin: 0; color: #FFC559;">New Contact Message</h2>',
    '</div>',
    '<div style="background: #ffffff; padding: 24px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 8px 8px;">',
    '<table style="width: 100%; border-collapse: collapse;">',
    row('Name', escapeHtml(data.name)),
    row('Email', '<a href="mailto:' + escapeHtml(data.email || '') + '">' + escapeHtml(data.email || 'N/A') + '</a>'),
    row('Subject', escapeHtml(data.subject) || 'General inquiry'),
    '</table>',
    '<div style="margin-top: 16px; padding: 12px; background: #f9f9f9; border-radius: 6px;"><strong>Message:</strong><br>' + escapeHtml(data.message || '').replace(/\n/g, '<br>') + '</div>',
    '<p style="color: #999; font-size: 12px; margin-top: 20px;">Submitted ' + timestamp + ' from culinaryjems.com</p>',
    '</div>',
    '</div>'
  ].join('');

  MailApp.sendEmail({
    to: OWNER_EMAIL,
    subject: subject,
    body: body,
    htmlBody: htmlBody,
    replyTo: data.email || OWNER_EMAIL,
    name: 'Culinary JEMs Website'
  });
}

// ─── SHEET LOGGING ──────────────────────────────────────────────────────────

function logToSheet(timestamp, formType, data) {
  var sheetId = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  if (!sheetId) {
    Logger.log('No SHEET_ID set. Run setup() first.');
    return;
  }

  var ss = SpreadsheetApp.openById(sheetId);
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    Logger.log('Sheet not found: ' + SHEET_NAME);
    return;
  }

  sheet.appendRow([
    timestamp,
    formType,
    data.name || '',
    data.email || '',
    data.phone || '',
    data.eventType || '',
    data.headcount || '',
    data.preferredDate || '',
    data.location || '',
    data.subject || '',
    data.details || data.message || ''
  ]);
}

// ─── HELPERS ────────────────────────────────────────────────────────────────

function escapeHtml(str) {
  if (!str) return '';
  return str.toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function row(label, value, highlight) {
  var bg = highlight ? ' background:' + highlight + ';' : '';
  return '<tr><td style="padding: 8px 0; color: #666; width: 140px; vertical-align: top;">' + label + '</td>'
       + '<td style="padding: 8px 0; font-weight: 600;' + bg + '">' + (value || 'N/A') + '</td></tr>';
}

// Note: Google Apps Script ContentService always returns HTTP 200.
// Errors are communicated via the JSON payload's "status" field.
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
