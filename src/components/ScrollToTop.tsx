"use client";

import React, { useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence, useScroll, useTransform } from "motion/react";
import { ArrowRight, Box, Check, ChevronRight, Lock, TrendingUp, Users, Zap, Globe, Shield, RefreshCcw, PlayCircle, Home as HomeIcon, ShoppingCart, Package, BarChart2, Megaphone, Settings, ChevronDown, Mouse, X } from "lucide-react";
import { usePathname } from 'next/navigation';
import Link from 'next/link';


export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
