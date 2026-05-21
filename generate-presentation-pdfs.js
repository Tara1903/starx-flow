import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

const PUBLIC_DIR = path.resolve('public');

function drawDarkBackground(doc) {
  // A4 Landscape dimensions are 841.89 x 595.28
  doc.rect(0, 0, 842, 596).fill('#09090b');
}

function drawSlideHeader(doc, subtitleText) {
  doc.fillColor('#10b981')
     .font('Helvetica-Bold')
     .fontSize(11)
     .text('STARX FLOW  |  OPERATIONAL RUNBOOK', 40, 35, { characterSpacing: 1.5 });
  
  doc.fillColor('#ffffff')
     .font('Helvetica-Bold')
     .fontSize(18)
     .text(subtitleText, 40, 52);

  doc.strokeColor('#1f2937').lineWidth(1).moveTo(40, 80).lineTo(802, 80).stroke();
}

function drawFooter(doc) {
  doc.strokeColor('#1f2937').lineWidth(1).moveTo(40, 550).lineTo(802, 550).stroke();
  doc.fillColor('#6b7280')
     .font('Helvetica')
     .fontSize(8)
     .text('© 2026 StarX Flow. All rights reserved. Confidentially licensed for StarX Flow merchants.', 40, 562);
}

function buildSetupPresentation() {
  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margins: { top: 30, bottom: 30, left: 40, right: 40 }
  });

  const stream = fs.createWriteStream(path.join(PUBLIC_DIR, 'ai-receptionist-setup.pdf'));
  doc.pipe(stream);

  // --- SLIDE 1: COVER ---
  drawDarkBackground(doc);
  
  // Left cover image
  const imgPath = path.join(PUBLIC_DIR, 'receptionist-cover.png');
  if (fs.existsSync(imgPath)) {
    doc.image(imgPath, 40, 80, { width: 420, height: 260 });
  }

  // Right cover title
  doc.fillColor('#10b981')
     .font('Helvetica-Bold')
     .fontSize(14)
     .text('STARX FLOW MASTERCLASS', 490, 110, { characterSpacing: 2 });

  doc.fillColor('#ffffff')
     .font('Helvetica-Bold')
     .fontSize(28)
     .text('The Ultimate 24/7\nAI Receptionist\nSetup Masterclass', 490, 140, { lineGap: 6 });

  doc.fillColor('#9ca3af')
     .font('Helvetica')
     .fontSize(11)
     .text('A step-by-step playbook to integrate your scheduling calendar, calibrate customer FAQs, and scale front-desk booking capacity.', 490, 270, { width: 310, lineGap: 4 });

  doc.strokeColor('#10b981').lineWidth(3).moveTo(490, 370).lineTo(590, 370).stroke();
  drawFooter(doc);

  // --- SLIDE 2: PHASE 1 ---
  doc.addPage();
  drawDarkBackground(doc);
  drawSlideHeader(doc, 'Phase 1: Pre-requisites & Calendar Hook');

  const steps = [
    { num: '01', title: 'Dedicated Line', desc: 'Secure a clean WhatsApp Business number. Back up chat logs if converting an active line.' },
    { num: '02', title: 'Calendar Sync', desc: 'Connect Google Calendar, Outlook, Square POS, or Clover natively in the Dashboard.' },
    { num: '03', title: 'Roster Definition', desc: 'Define active staff, shifts, active days, service pricing, and appointment buffers.' },
    { num: '04', title: 'Double-Booking Safe', desc: 'Configure 2-way sync to lock slots instantly and prevent overlapping sessions.' }
  ];

  steps.forEach((step, idx) => {
    const x = 40 + (idx * 190);
    // Card panel background
    doc.rect(x, 120, 180, 280).fill('#18181b');
    
    // Step number
    doc.fillColor('#10b981')
       .font('Helvetica-Bold')
       .fontSize(32)
       .text(step.num, x + 15, 140);

    // Title
    doc.fillColor('#ffffff')
       .font('Helvetica-Bold')
       .fontSize(14)
       .text(step.title, x + 15, 190);

    // Desc
    doc.fillColor('#9ca3af')
       .font('Helvetica')
       .fontSize(10)
       .text(step.desc, x + 15, 230, { width: 150, lineGap: 3 });
  });
  drawFooter(doc);

  // --- SLIDE 3: PHASE 2 ---
  doc.addPage();
  drawDarkBackground(doc);
  drawSlideHeader(doc, 'Phase 2: Building the AI Knowledge Base');

  const faqs = [
    { title: 'Identity & Voice', points: ['Match business name/locations', 'Calibrate brand tone (warm/professional)', 'Adopt native localized greetings'] },
    { title: 'Core FAQ Mapping', points: ['Cancellation & refund policies', 'Parking, building access guidelines', 'Service specifications & upgrades'] },
    { title: 'Live Staff Triage', points: ['Define handover triggers', 'Keywords: "emergency", "complaint"', 'Live desktop sound alerts'] }
  ];

  faqs.forEach((faq, idx) => {
    const x = 40 + (idx * 255);
    doc.rect(x, 120, 245, 280).fill('#18181b');

    doc.fillColor('#10b981')
       .font('Helvetica-Bold')
       .fontSize(16)
       .text(faq.title, x + 20, 145);

    let yOffset = 195;
    faq.points.forEach((point) => {
      // Draw Checkmark
      doc.fillColor('#10b981').font('Helvetica-Bold').fontSize(10).text('✔', x + 20, yOffset + 2);
      
      doc.fillColor('#ffffff')
         .font('Helvetica')
         .fontSize(11)
         .text(point, x + 38, yOffset, { width: 190, lineGap: 4 });
      
      yOffset += 50;
    });
  });
  drawFooter(doc);

  // --- SLIDE 4: PHASE 3 ---
  doc.addPage();
  drawDarkBackground(doc);
  drawSlideHeader(doc, 'Phase 3: Integration Testing & Launch');

  doc.rect(40, 120, 762, 280).fill('#18181b');

  doc.fillColor('#10b981')
     .font('Helvetica-Bold')
     .fontSize(20)
     .text('🚀 Go-Live Playbook Checklist', 60, 145);

  doc.fillColor('#9ca3af')
     .font('Helvetica-Oblique')
     .fontSize(11)
     .text('Follow these final checks to ensure flawless automation and customer service.', 60, 175);

  const checklist = [
    'Dry-Run Testing: Send test texts on WhatsApp to book slots, ask for pricing, and request changes.',
    'Waiver Integrations: Confirm that WhatsApp waivers or Stripe deposits display cleanly inside the chat flow.',
    'Staff Escalation Hook: Ensure active front-desk staff can see active chats in the StarX Admin Hub.',
    'Autopilot Activation: Switch the AI Assistant toggle to Live, put up the WhatsApp business link, and watch bookings scale.'
  ];

  checklist.forEach((item, idx) => {
    const y = 220 + (idx * 42);
    doc.fillColor('#10b981').font('Helvetica-Bold').fontSize(12).text('✔', 60, y + 2);
    doc.fillColor('#ffffff')
       .font('Helvetica')
       .fontSize(12)
       .text(item, 85, y, { width: 690 });
  });
  drawFooter(doc);

  doc.end();
}

function buildPlaybookPresentation() {
  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margins: { top: 30, bottom: 30, left: 40, right: 40 }
  });

  const stream = fs.createWriteStream(path.join(PUBLIC_DIR, 'whatsapp-booking-playbook.pdf'));
  doc.pipe(stream);

  // --- SLIDE 1: COVER ---
  drawDarkBackground(doc);
  
  // Left cover image
  const imgPath = path.join(PUBLIC_DIR, 'playbook-cover.png');
  if (fs.existsSync(imgPath)) {
    doc.image(imgPath, 40, 80, { width: 420, height: 260 });
  }

  // Right cover title
  doc.fillColor('#10b981')
     .font('Helvetica-Bold')
     .fontSize(14)
     .text('STARX FLOW PLAYBOOK', 490, 110, { characterSpacing: 2 });

  doc.fillColor('#ffffff')
     .font('Helvetica-Bold')
     .fontSize(28)
     .text('WhatsApp Booking\nTemplates Playbook', 490, 140, { lineGap: 6 });

  doc.fillColor('#9ca3af')
     .font('Helvetica')
     .fontSize(11)
     .text('High-converting, copy-pasteable conversation scripts, deposit capture flows, and automated check-out review campaigns.', 490, 270, { width: 310, lineGap: 4 });

  doc.strokeColor('#10b981').lineWidth(3).moveTo(490, 370).lineTo(590, 370).stroke();
  drawFooter(doc);

  // --- SLIDE 2: SALON FLOW ---
  doc.addPage();
  drawDarkBackground(doc);
  drawSlideHeader(doc, 'Template 1: Salon & Spa Auto-Booking Stream');

  const dialogues = [
    { who: 'Client', text: '"Hey, do you have any openings for a massage tomorrow?"', color: '#ef4444' },
    { who: 'AI Receptionist', text: '"Hi! We do have a few openings tomorrow. Here are our available slots:\n- 10:30 AM (with David)\n- 2:00 PM (with Emily)\n- 4:30 PM (with David)\n\nWhich slot matches your schedule?"', color: '#10b981' },
    { who: 'Client', text: '"2:00 PM with Emily works great."', color: '#ef4444' },
    { who: 'AI Receptionist', text: '"Awesome! To secure your 60-Minute Therapeutic Massage with Emily at 2:00 PM tomorrow, please reply with your Full Name and Email Address."', color: '#10b981' }
  ];

  dialogues.forEach((d, idx) => {
    const y = 110 + (idx * 75);
    doc.rect(40, y, 762, 60).fill('#18181b');
    doc.fillColor(d.color)
       .font('Helvetica-Bold')
       .fontSize(11)
       .text(d.who, 60, y + 22);

    doc.fillColor('#ffffff')
       .font('Helvetica')
       .fontSize(10.5)
       .text(d.text, 180, y + 16, { width: 600, lineGap: 3 });
  });
  drawFooter(doc);

  // --- SLIDE 3: CLINIC FLOW ---
  doc.addPage();
  drawDarkBackground(doc);
  drawSlideHeader(doc, 'Template 2: Deposit & Clinic Intro Waivers');

  const clinicFlows = [
    { who: 'Client', text: '"Can I book a Chiropractic Adjustment?"', color: '#ef4444' },
    { who: 'AI Receptionist', text: '"Hi! I can schedule that right now. We have open times this Tuesday at 9:00 AM and Wednesday at 3:00 PM. Which is better?"', color: '#10b981' },
    { who: 'Client', text: '"Tuesday at 9:00 AM."', color: '#ef4444' },
    { who: 'AI Receptionist', text: '"Great! To finalize this slot, first-time patients are required to fill out a brief intake waiver and secure the session with a $20 deposit. \n\nHere is your secure link: [Link]\n\nOnce done, your slot is locked!"', color: '#10b981' }
  ];

  clinicFlows.forEach((d, idx) => {
    const y = 110 + (idx * 75);
    doc.rect(40, y, 762, 60).fill('#18181b');
    doc.fillColor(d.color)
       .font('Helvetica-Bold')
       .fontSize(11)
       .text(d.who, 60, y + 22);

    doc.fillColor('#ffffff')
       .font('Helvetica')
       .fontSize(10.5)
       .text(d.text, 180, y + 14, { width: 600, lineGap: 3 });
  });
  drawFooter(doc);

  // --- SLIDE 4: REVIEW BOOSTER ---
  doc.addPage();
  drawDarkBackground(doc);
  drawSlideHeader(doc, 'Template 3: Google Review Booster Campaign');

  doc.rect(40, 120, 762, 280).fill('#18181b');

  doc.fillColor('#10b981')
     .font('Helvetica-Bold')
     .fontSize(20)
     .text('📈 Google Review Automator Script', 70, 150);

  doc.fillColor('#9ca3af')
     .font('Helvetica-Oblique')
     .fontSize(11)
     .text('Trigger timing: Automatically 2 hours after checkout on calendar.', 70, 185);

  const templateMsg = '"Hey [Client-Name]! Thank you for visiting us today at [Business-Name]. We hope you loved your session with [Staff-Name]!\n\nIf you have 10 seconds, it would mean the world to our local staff if you shared your experience on Google: \n[Your-Google-Review-Link]\n\nHave an amazing week!"';

  doc.fillColor('#ffffff')
     .font('Helvetica-Oblique')
     .fontSize(15)
     .text(templateMsg, 70, 230, { width: 700, lineGap: 8 });
  drawFooter(doc);

  doc.end();
}

buildSetupPresentation();
buildPlaybookPresentation();
console.log('Successfully generated landscape slide PDFs!');
