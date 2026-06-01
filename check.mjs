import fs from 'fs';
import path from 'path';

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) {
      walk(p);
    } else if (p.endsWith('.tsx') || p.endsWith('.ts')) {
      const c = fs.readFileSync(p, 'utf8');
      if (c.includes('from "framer-motion"') || c.includes("from 'framer-motion'") || c.includes('from "motion/react"') || c.includes("from 'motion/react'")) {
        if (!c.includes('"use client"') && !c.includes("'use client'")) {
          console.log(p);
        }
      }
    }
  }
}

walk('./src');
