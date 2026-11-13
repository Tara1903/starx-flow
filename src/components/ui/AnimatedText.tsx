"use client";

import React from "react";
import { cn } from "../../lib/utils";

export interface AnimatedTextProps {
  text: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  mode?: "word" | "line";
  priority?: boolean;
  delay?: number;
  staggerSec?: number;
  className?: string;
}

/**
 * StarX Flow semantic text component.
 * Guaranteed 100% immediate content visibility:
 * Renders text immediately as valid semantic HTML without hiding words or depending on animation observers.
 */
export function AnimatedText({
  text,
  as = "h2",
  className,
}: AnimatedTextProps) {
  const Tag = as;
  return <Tag className={cn("inline-block", className)}>{text}</Tag>;
}
