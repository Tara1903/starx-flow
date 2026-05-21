import fs from 'fs';
import path from 'path';
import pptxgen from 'pptxgenjs';

const PUBLIC_DIR = path.resolve('public');
const APP_DATA_DIR = 'C:/Users/busin/.gemini/antigravity/brain/28940487-4f10-4ef5-a064-ed3fcf54f8c7';

// Cover images sources
const srcReceptionist = path.join(APP_DATA_DIR, 'receptionist_cover_1779301434839.png');
const srcPlaybook = path.join(APP_DATA_DIR, 'playbook_cover_1779301455105.png');

// Copy files if they exist
try {
  if (fs.existsSync(srcReceptionist)) {
    fs.copyFileSync(srcReceptionist, path.join(PUBLIC_DIR, 'receptionist-cover.png'));
    console.log('Copied receptionist cover successfully!');
  }
  if (fs.existsSync(srcPlaybook)) {
    fs.copyFileSync(srcPlaybook, path.join(PUBLIC_DIR, 'playbook-cover.png'));
    console.log('Copied playbook cover successfully!');
  }
} catch (err) {
  console.error('Error copying cover images:', err);
}

// ----------------------------------------------------
// PLAYBOOK 1: The Ultimate AI Receptionist Setup Masterclass
// ----------------------------------------------------
function buildReceptionistPlaybook() {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';

  // Define global colors
  const BG_COLOR = '09090B'; // Zinc-950
  const PRIMARY_COLOR = '10B981'; // Emerald
  const ACCENT_COLOR = '06B6D4'; // Teal
  const CARD_BG = '18181B'; // Zinc-800
  const TEXT_WHITE = 'FFFFFF';
  const TEXT_MUTED = '9CA3AF'; // Gray-400

  // 1. Cover Slide
  const slide1 = pptx.addSlide();
  slide1.background = { fill: BG_COLOR };
  
  // Left side image
  slide1.addImage({
    path: path.join(PUBLIC_DIR, 'receptionist-cover.png'),
    x: 0.5,
    y: 0.8,
    w: 5.5,
    h: 3.9
  });

  // Right side titles
  slide1.addText('STARX FLOW', {
    x: 6.3,
    y: 0.8,
    w: 6.5,
    h: 0.4,
    fontFace: 'Arial',
    fontSize: 16,
    color: PRIMARY_COLOR,
    bold: true,
    tracking: 2
  });

  slide1.addText('24/7 AI Receptionist\nSetup Masterclass', {
    x: 6.3,
    y: 1.4,
    w: 6.5,
    h: 1.5,
    fontFace: 'Arial',
    fontSize: 34,
    color: TEXT_WHITE,
    bold: true
  });

  slide1.addText('A Step-by-Step Roster & Calendar Integration Playbook for Local Service Businesses.', {
    x: 6.3,
    y: 3.1,
    w: 6.5,
    h: 0.8,
    fontFace: 'Arial',
    fontSize: 14,
    color: TEXT_MUTED
  });

  slide1.addText('OPERATIONAL BLUEPRINT', {
    x: 6.3,
    y: 4.8,
    w: 4.0,
    h: 0.3,
    fontFace: 'Arial',
    fontSize: 10,
    color: PRIMARY_COLOR,
    bold: true
  });

  // 2. Pre-requisites & Calendar Configuration
  const slide2 = pptx.addSlide();
  slide2.background = { fill: BG_COLOR };
  
  slide2.addText('PHASE 1: PRE-REQUISITES & CALENDAR HOOK', { x: 0.6, y: 0.5, w: 10.0, h: 0.3, fontFace: 'Arial', fontSize: 12, color: PRIMARY_COLOR, bold: true });
  slide2.addText('Lay the Solid Foundation', { x: 0.6, y: 0.8, w: 10.0, h: 0.5, fontFace: 'Arial', fontSize: 24, color: TEXT_WHITE, bold: true });

  // Add 4 step boxes
  const steps = [
    { num: '01', title: 'Dedicated Line', desc: 'Secure a clean WhatsApp Business number. Back up chat logs if converting an existing active business line.' },
    { num: '02', title: 'Calendar Sync', desc: 'Integrate Google Calendar, Outlook, Square POS, or Clover natively in the StarX Flow Dashboard.' },
    { num: '03', title: 'Roster Definition', desc: 'Add employees, custom hours, active days, service pricing, and appointment buffers.' },
    { num: '04', title: 'Double-Booking Safe', desc: 'Configure 2-way sync to lock slots instantly and prevent overlapping sessions.' }
  ];

  steps.forEach((step, idx) => {
    const xPos = 0.6 + (idx * 3.0);
    // Draw card background
    slide2.addShape(pptx.shapes.RECTANGLE, { x: xPos, y: 1.8, w: 2.8, h: 3.5, fill: { color: CARD_BG } });
    
    // Step number
    slide2.addText(step.num, { x: xPos + 0.2, y: 2.0, w: 1.0, h: 0.4, fontFace: 'Arial', fontSize: 28, color: PRIMARY_COLOR, bold: true });
    // Title
    slide2.addText(step.title, { x: xPos + 0.2, y: 2.5, w: 2.4, h: 0.4, fontFace: 'Arial', fontSize: 16, color: TEXT_WHITE, bold: true });
    // Desc
    slide2.addText(step.desc, { x: xPos + 0.2, y: 3.0, w: 2.4, h: 2.0, fontFace: 'Arial', fontSize: 11, color: TEXT_MUTED });
  });

  // 3. Knowledge Base
  const slide3 = pptx.addSlide();
  slide3.background = { fill: BG_COLOR };
  
  slide3.addText('PHASE 2: BUILDING THE AI KNOWLEDGE BASE', { x: 0.6, y: 0.5, w: 10.0, h: 0.3, fontFace: 'Arial', fontSize: 12, color: PRIMARY_COLOR, bold: true });
  slide3.addText('Teach the AI Your Front-Desk Rules', { x: 0.6, y: 0.8, w: 10.0, h: 0.5, fontFace: 'Arial', fontSize: 24, color: TEXT_WHITE, bold: true });

  const faqs = [
    { title: 'Identity & Voice', points: ['Match business name/locations', 'Calibrate brand tone (warm/professional)', 'Adopt native localized greetings'] },
    { title: 'Core FAQ Mapping', points: ['Cancellation & refund policies', 'Parking, building access guidelines', 'Service specifications & upgrades'] },
    { title: 'Live Staff Triage', points: ['Define handover triggers', 'Keywords: "emergency", "complaint"', 'Live desktop sound alerts'] }
  ];

  faqs.forEach((faq, idx) => {
    const xPos = 0.6 + (idx * 4.0);
    slide3.addShape(pptx.shapes.RECTANGLE, { x: xPos, y: 1.8, w: 3.7, h: 3.5, fill: { color: CARD_BG } });
    slide3.addText(faq.title, { x: xPos + 0.2, y: 2.0, w: 3.3, h: 0.4, fontFace: 'Arial', fontSize: 18, color: PRIMARY_COLOR, bold: true });
    
    // Add bullet points
    let yOffset = 2.6;
    faq.points.forEach(point => {
      slide3.addText('• ' + point, { x: xPos + 0.2, y: yOffset, w: 3.3, h: 0.7, fontFace: 'Arial', fontSize: 12, color: TEXT_WHITE });
      yOffset += 0.8;
    });
  });

  // 4. Testing & Launch
  const slide4 = pptx.addSlide();
  slide4.background = { fill: BG_COLOR };
  
  slide4.addText('PHASE 3: INTEGRATION TESTING & LAUNCH', { x: 0.6, y: 0.5, w: 10.0, h: 0.3, fontFace: 'Arial', fontSize: 12, color: PRIMARY_COLOR, bold: true });
  slide4.addText('Go Live and Put Bookings on Autopilot', { x: 0.6, y: 0.8, w: 10.0, h: 0.5, fontFace: 'Arial', fontSize: 24, color: TEXT_WHITE, bold: true });

  slide4.addShape(pptx.shapes.RECTANGLE, { x: 0.6, y: 1.8, w: 11.6, h: 3.5, fill: { color: CARD_BG } });

  slide4.addText('🚀 Go-Live Playbook Checklist', { x: 0.9, y: 2.0, w: 11.0, h: 0.4, fontFace: 'Arial', fontSize: 20, color: PRIMARY_COLOR, bold: true });
  
  const checklist = [
    'Dry-Run Testing: Send test texts on WhatsApp to book slots, ask for pricing, and request changes.',
    'Waiver Integrations: Confirm that WhatsApp waivers or Stripe deposits display cleanly inside the chat flow.',
    'Staff Escalation Hook: Ensure active front-desk staff can see active chats in the StarX Admin Hub.',
    'Autopilot Activation: Switch the AI Assistant toggle to Live, put up the WhatsApp business link, and watch bookings scale.'
  ];

  checklist.forEach((item, idx) => {
    slide4.addText('✔   ' + item, {
      x: 1.0,
      y: 2.6 + (idx * 0.6),
      w: 10.8,
      h: 0.5,
      fontFace: 'Arial',
      fontSize: 12,
      color: TEXT_WHITE
    });
  });

  pptx.writeFile({ fileName: path.join(PUBLIC_DIR, 'ai-receptionist-setup.pptx') })
    .then(() => console.log('Successfully created ai-receptionist-setup.pptx!'))
    .catch((err) => console.error('Error writing setup PPTX:', err));
}

// ----------------------------------------------------
// PLAYBOOK 2: WhatsApp Booking Playbook & High-Converting Templates
// ----------------------------------------------------
function buildPlaybookTemplates() {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';

  // Colors
  const BG_COLOR = '09090B';
  const PRIMARY_COLOR = '10B981'; // Emerald
  const CARD_BG = '18181B';
  const TEXT_WHITE = 'FFFFFF';
  const TEXT_MUTED = '9CA3AF';

  // 1. Cover Slide
  const slide1 = pptx.addSlide();
  slide1.background = { fill: BG_COLOR };
  
  // Left side image
  slide1.addImage({
    path: path.join(PUBLIC_DIR, 'playbook-cover.png'),
    x: 0.5,
    y: 0.8,
    w: 5.5,
    h: 3.9
  });

  // Right side titles
  slide1.addText('STARX FLOW', {
    x: 6.3,
    y: 0.8,
    w: 6.5,
    h: 0.4,
    fontFace: 'Arial',
    fontSize: 16,
    color: PRIMARY_COLOR,
    bold: true,
    tracking: 2
  });

  slide1.addText('WhatsApp Booking\nTemplates Playbook', {
    x: 6.3,
    y: 1.4,
    w: 6.5,
    h: 1.5,
    fontFace: 'Arial',
    fontSize: 34,
    color: TEXT_WHITE,
    bold: true
  });

  slide1.addText('High-Converting, Copy-Pasteable Conversation Flows & Auto-Followups for Service Businesses.', {
    x: 6.3,
    y: 3.1,
    w: 6.5,
    h: 0.8,
    fontFace: 'Arial',
    fontSize: 14,
    color: TEXT_MUTED
  });

  slide1.addText('CAMPAIGN ASSETS', {
    x: 6.3,
    y: 4.8,
    w: 4.0,
    h: 0.3,
    fontFace: 'Arial',
    fontSize: 10,
    color: PRIMARY_COLOR,
    bold: true
  });

  // 2. Salon / Spa Flow
  const slide2 = pptx.addSlide();
  slide2.background = { fill: BG_COLOR };

  slide2.addText('TEMPLATE 1: SALON & SPA AUTO-BOOKING STREAM', { x: 0.6, y: 0.5, w: 10.0, h: 0.3, fontFace: 'Arial', fontSize: 12, color: PRIMARY_COLOR, bold: true });
  slide2.addText('High-Convert Flow (90%+ Retention)', { x: 0.6, y: 0.8, w: 10.0, h: 0.5, fontFace: 'Arial', fontSize: 24, color: TEXT_WHITE, bold: true });

  // Dialogue mockup
  const dialogues = [
    { who: 'Client', text: '"Hey, do you have any openings for a massage tomorrow?"', color: 'EF4444' },
    { who: 'AI Receptionist', text: '"Hi! We do have a few openings tomorrow. Here are our available slots:\n- 10:30 AM (with David)\n- 2:00 PM (with Emily)\n- 4:30 PM (with David)\n\nWhich slot matches your schedule?"', color: PRIMARY_COLOR },
    { who: 'Client', text: '"2:00 PM with Emily works great."', color: 'EF4444' },
    { who: 'AI Receptionist', text: '"Awesome! To secure your 60-Minute Therapeutic Massage with Emily at 2:00 PM tomorrow, please reply with your Full Name and Email Address."', color: PRIMARY_COLOR }
  ];

  dialogues.forEach((d, idx) => {
    const yPos = 1.6 + (idx * 1.0);
    slide2.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: yPos, w: 11.6, h: 0.85, fill: { color: CARD_BG } });
    slide2.addText(d.who, { x: 0.8, y: yPos + 0.15, w: 2.0, h: 0.4, fontFace: 'Arial', fontSize: 12, color: d.color, bold: true });
    slide2.addText(d.text, { x: 2.8, y: yPos + 0.15, w: 9.0, h: 0.6, fontFace: 'Arial', fontSize: 10.5, color: TEXT_WHITE });
  });

  // 3. Deposit & Clinic Flow
  const slide3 = pptx.addSlide();
  slide3.background = { fill: BG_COLOR };

  slide3.addText('TEMPLATE 2: DEPOSIT & CLINIC INTRO WAIVERS', { x: 0.6, y: 0.5, w: 10.0, h: 0.3, fontFace: 'Arial', fontSize: 12, color: PRIMARY_COLOR, bold: true });
  slide3.addText('Intake and Booking Secure Script', { x: 0.6, y: 0.8, w: 10.0, h: 0.5, fontFace: 'Arial', fontSize: 24, color: TEXT_WHITE, bold: true });

  const clinicFlows = [
    { who: 'Client', text: '"Can I book a Chiropractic Adjustment?"', color: 'EF4444' },
    { who: 'AI Receptionist', text: '"Hi! I can schedule that right now. We have open times this Tuesday at 9:00 AM and Wednesday at 3:00 PM. Which is better?"', color: PRIMARY_COLOR },
    { who: 'Client', text: '"Tuesday at 9:00 AM."', color: 'EF4444' },
    { who: 'AI Receptionist', text: '"Great! To finalize this slot, first-time patients are required to fill out a brief intake waiver and secure the session with a $20 deposit. \n\nHere is your secure link: [Link]\n\nOnce done, your slot is locked!"', color: PRIMARY_COLOR }
  ];

  clinicFlows.forEach((d, idx) => {
    const yPos = 1.6 + (idx * 1.0);
    slide3.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: yPos, w: 11.6, h: 0.85, fill: { color: CARD_BG } });
    slide3.addText(d.who, { x: 0.8, y: yPos + 0.15, w: 2.0, h: 0.4, fontFace: 'Arial', fontSize: 12, color: d.color, bold: true });
    slide3.addText(d.text, { x: 2.8, y: yPos + 0.15, w: 9.0, h: 0.6, fontFace: 'Arial', fontSize: 10.5, color: TEXT_WHITE });
  });

  // 4. Google Review booster
  const slide4 = pptx.addSlide();
  slide4.background = { fill: BG_COLOR };

  slide4.addText('TEMPLATE 3: THE GOOGLE REVIEW BOOSTER CAMPAIGN', { x: 0.6, y: 0.5, w: 10.0, h: 0.3, fontFace: 'Arial', fontSize: 12, color: PRIMARY_COLOR, bold: true });
  slide4.addText('Post-Session Review Booster Auto-Pilot', { x: 0.6, y: 0.8, w: 10.0, h: 0.5, fontFace: 'Arial', fontSize: 24, color: TEXT_WHITE, bold: true });

  slide4.addShape(pptx.shapes.RECTANGLE, { x: 0.6, y: 1.8, w: 11.6, h: 3.5, fill: { color: CARD_BG } });

  slide4.addText('📈 Google Review Automator Script', { x: 0.9, y: 2.1, w: 11.0, h: 0.4, fontFace: 'Arial', fontSize: 20, color: PRIMARY_COLOR, bold: true });
  
  slide4.addText('Trigger timing: 2 hours after checkout', { x: 0.9, y: 2.6, w: 11.0, h: 0.3, fontFace: 'Arial', fontSize: 11, color: TEXT_MUTED, italic: true });

  const templateMsg = '"Hey [Client-Name]! Thank you for visiting us today at [Business-Name]. We hope you loved your session with [Staff-Name]!\n\nIf you have 10 seconds, it would mean the world to our local staff if you shared your experience on Google: \n[Your-Google-Review-Link]\n\nHave an amazing week!"';

  slide4.addText(templateMsg, {
    x: 0.9,
    y: 3.1,
    w: 11.0,
    h: 1.5,
    fontFace: 'Arial',
    fontSize: 14,
    color: TEXT_WHITE,
    italic: true,
    lineSpacing: 22
  });

  pptx.writeFile({ fileName: path.join(PUBLIC_DIR, 'whatsapp-booking-playbook.pptx') })
    .then(() => console.log('Successfully created whatsapp-booking-playbook.pptx!'))
    .catch((err) => console.error('Error writing templates PPTX:', err));
}

buildReceptionistPlaybook();
buildPlaybookTemplates();
