import fs from 'fs';
import PDFDocument from 'pdfkit';
import path from 'path';

const PUBLIC_DIR = path.resolve('public');

// Ensure public directory exists
if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

function generateChecklistPDF() {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  const stream = fs.createWriteStream(path.join(PUBLIC_DIR, 'ai-receptionist-checklist.pdf'));
  doc.pipe(stream);

  // Styling helper
  const primaryColor = '#10b981'; // Emerald
  const textColor = '#1f2937'; // Slate-800
  const lightGray = '#f3f4f6';

  // --- COVER HEADER ---
  doc.rect(0, 0, 595, 15).fill(primaryColor);
  
  doc.moveDown(3);
  doc.fillColor(primaryColor)
     .font('Helvetica-Bold')
     .fontSize(24)
     .text('STARX FLOW', { tracking: 2 });
  
  doc.moveDown(0.5);
  doc.fillColor(textColor)
     .font('Helvetica-Bold')
     .fontSize(20)
     .text('The Ultimate 24/7 AI Receptionist Setup Checklist');

  doc.moveDown(0.5);
  doc.fillColor('#6b7280')
     .font('Helvetica-Oblique')
     .fontSize(12)
     .text('A step-by-step implementation guide to automate local front-desk scheduling.');

  doc.moveDown(2);
  doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(2);

  // --- CONTENT SECTION ---
  const sections = [
    {
      title: 'Phase 1: Pre-requisites & Calendar Configuration',
      items: [
        { name: 'Dedicated Phone Line', desc: 'Secure a clean WhatsApp Business phone number. If converting an existing line, backup chat logs first.' },
        { name: 'Calendar Integration', desc: 'Connect Google Calendar, Outlook, Square POS, or Clover natively in the StarX Flow Dashboard.' },
        { name: 'Staff Roster & Services', desc: 'Define active staff members, custom shift hours, services offered, durations, and standard pricing.' },
        { name: 'Buffer Time Definition', desc: 'Configure automatic post-appointment buffer periods (e.g., 10 mins) to allow staff transitions without overlaps.' }
      ]
    },
    {
      title: 'Phase 2: Building the AI Knowledge Base',
      items: [
        { name: 'Business Identity & Tone', desc: 'Define your salon, gym, or clinic name and set the voice tone (e.g., Warm, Professional, Energetic).' },
        { name: 'Core FAQ Logging', desc: 'Input answers for cancellation policies, parking arrangements, refund rules, and amenities.' },
        { name: 'Triage Rules', desc: 'Specify fallback keywords (e.g., "emergency", "complaint") that immediately hand over the chat to a live staff member.' }
      ]
    },
    {
      title: 'Phase 3: Interactive Workflows & Intake WA',
      items: [
        { name: 'Intake Forms Setup', desc: 'Design the registration fields required for new clients (e.g., Full Name, Email, Medical History waiver).' },
        { name: 'Deposit & Payment Rules', desc: 'If required, link Stripe or Clover to collect credit card deposits or session pre-payments during the chat flow.' },
        { name: 'Booking Confirmation Template', desc: 'Customize the automated WhatsApp confirmation message, including date, time, address, and cancellation rules.' }
      ]
    },
    {
      title: 'Phase 4: Launch, Testing & Post-Booking automations',
      items: [
        { name: 'Live Testing Run', desc: 'Send dry-run messages to your WhatsApp assistant. Test scheduling a slot, rescheduling, and asking FAQs.' },
        { name: 'Staff Training', desc: 'Show front-desk staff how to monitor active AI chats in the StarX Flow Inbox and take over manually with 1 click.' },
        { name: 'Review Booster Setup', desc: 'Enable Google Review Booster to automatically request ratings 2 hours post-session from satisfied clients.' }
      ]
    }
  ];

  sections.forEach((section) => {
    // Section Header
    doc.fillColor(primaryColor)
       .font('Helvetica-Bold')
       .fontSize(14)
       .text(section.title);
    
    doc.moveDown(0.5);

    section.items.forEach((item) => {
      // Draw Checkbox
      const boxY = doc.y;
      doc.rect(50, boxY + 2, 10, 10).strokeColor('#9ca3af').lineWidth(1.5).stroke();
      
      // Draw text
      doc.fillColor(textColor)
         .font('Helvetica-Bold')
         .fontSize(11)
         .text(item.name, 70, boxY);
      
      doc.fillColor('#4b5563')
         .font('Helvetica')
         .fontSize(10)
         .text(item.desc, 70, doc.y + 2, { width: 475 });
      
      doc.moveDown(1);
    });

    doc.moveDown(1);
  });

  // Footer page numbering
  doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(50, 780).lineTo(545, 780).stroke();
  doc.fillColor('#9ca3af')
     .font('Helvetica')
     .fontSize(8)
     .text('© 2026 StarX Flow. Premium Operational Infrastructure.', 50, 790);

  doc.end();
  console.log('Generated checklist PDF successfully!');
}

function generateTemplatesPDF() {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  const stream = fs.createWriteStream(path.join(PUBLIC_DIR, 'whatsapp-booking-templates.pdf'));
  doc.pipe(stream);

  // Styling helper
  const primaryColor = '#10b981'; // Emerald
  const textColor = '#1f2937'; // Slate-800
  const bgLight = '#f9fafb';

  // --- COVER HEADER ---
  doc.rect(0, 0, 595, 15).fill(primaryColor);
  
  doc.moveDown(3);
  doc.fillColor(primaryColor)
     .font('Helvetica-Bold')
     .fontSize(24)
     .text('STARX FLOW', { tracking: 2 });
  
  doc.moveDown(0.5);
  doc.fillColor(textColor)
     .font('Helvetica-Bold')
     .fontSize(20)
     .text('WhatsApp Booking & Engagement Templates');

  doc.moveDown(0.5);
  doc.fillColor('#6b7280')
     .font('Helvetica-Oblique')
     .fontSize(12)
     .text('High-converting copy-pasteable script templates for local service businesses.');

  doc.moveDown(2);
  doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(2);

  // --- TEMPLATES ---
  const templates = [
    {
      title: 'Template 1: The Auto-Booking Stream (Salon & Spa)',
      audience: 'Ideal for hair salons, massage therapists, spas, and personal trainers.',
      dialogue: [
        { speaker: 'Client', text: '"Hey, do you have any openings for a massage tomorrow?"' },
        { speaker: 'AI Assistant', text: '"Hi! We do have a few openings tomorrow. I\'d love to help lock this in for you. Here are our available slots:\n- 10:30 AM (with David)\n- 2:00 PM (with Emily)\n- 4:30 PM (with David)\n\nWhich slot matches your schedule?"' },
        { speaker: 'Client', text: '"2:00 PM with Emily works great."' },
        { speaker: 'AI Assistant', text: '"Awesome! To secure your 60-Minute Therapeutic Massage with Emily at 2:00 PM tomorrow, please reply with your:\n1. Full Name\n2. Email Address"' },
        { speaker: 'Client', text: '"Sarah Connor, sarah@example.com"' },
        { speaker: 'AI Assistant', text: '"Fantastic, Sarah! Your appointment has been booked. A calendar invite and receipt has been sent to sarah@example.com. See you tomorrow at 2:00 PM!"' }
      ]
    },
    {
      title: 'Template 2: Deposit & Waiver Collection (Wellness & Gyms)',
      audience: 'Best for chiropractic clinics, yoga studios, wellness groups, and medical spas.',
      dialogue: [
        { speaker: 'Client', text: '"Can I book a Chiropractic Adjustment?"' },
        { speaker: 'AI Assistant', text: '"Hi! I can schedule that right now. We have open times this Tuesday at 9:00 AM and Wednesday at 3:00 PM. Which is better?"' },
        { speaker: 'Client', text: '"Tuesday at 9:00 AM."' },
        { speaker: 'AI Assistant', text: '"Great! To finalize this slot, first-time patients are required to fill out a brief intake waiver and secure the session with a $20 deposit. \n\nHere is your secure booking link: [Link]\n\nOnce completed, your appointment will register automatically on our schedule!"' }
      ]
    },
    {
      title: 'Template 3: The Google Review Booster (Post-Session)',
      audience: 'Triggered automatically 2 hours after calendar appointment checkout.',
      dialogue: [
        { speaker: 'AI Assistant', text: '"Hey Sarah! Thank you for visiting us today at Aura Spa. We hope you loved your session with Emily! \n\nIf you have 10 seconds, it would mean the world to our local staff if you shared your experience on Google: [Your-Google-Review-Link]\n\nHave an amazing week!"' }
      ]
    }
  ];

  templates.forEach((tpl) => {
    doc.fillColor(primaryColor)
       .font('Helvetica-Bold')
       .fontSize(14)
       .text(tpl.title);
    
    doc.fillColor('#6b7280')
       .font('Helvetica-Oblique')
       .fontSize(10)
       .text(tpl.audience);
    
    doc.moveDown(0.8);

    tpl.dialogue.forEach((dialog) => {
      const isClient = dialog.speaker === 'Client';
      
      // Dialogue bubble styling
      doc.fillColor(isClient ? '#ef4444' : primaryColor)
         .font('Helvetica-Bold')
         .fontSize(10)
         .text(`${dialog.speaker}: `, { continued: true });
      
      doc.fillColor(textColor)
         .font('Helvetica')
         .fontSize(10)
         .text(dialog.text);
      
      doc.moveDown(0.5);
    });

    doc.moveDown(1.5);
  });

  // Footer page numbering
  doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(50, 780).lineTo(545, 780).stroke();
  doc.fillColor('#9ca3af')
     .font('Helvetica')
     .fontSize(8)
     .text('© 2026 StarX Flow. Premium Operational Infrastructure.', 50, 790);

  doc.end();
  console.log('Generated templates PDF successfully!');
}

generateChecklistPDF();
generateTemplatesPDF();
