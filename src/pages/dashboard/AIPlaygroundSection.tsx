import React from "react";
import { AIConfigPanel } from "../../components/dashboard/AIConfigPanel";
import { AIChatTester } from "../../components/dashboard/AIChatTester";

export function AIPlaygroundSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-[fade-in_0.4s_ease-out]">
      {/* Left panel: Prompt Instructions, Tone selector, Save button */}
      <AIConfigPanel />

      {/* Right panel: Live interactive Gemini AI sandbox testing console */}
      <AIChatTester />
    </div>
  );
}
