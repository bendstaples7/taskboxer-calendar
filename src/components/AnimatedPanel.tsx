
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface AnimatedPanelProps {
  children: React.ReactNode;
  title: string;
  side: "left" | "right";
  expanded: boolean;
  onToggle: () => void;
  className?: string;
}

const AnimatedPanel: React.FC<AnimatedPanelProps> = ({
  children,
  title,
  side,
  expanded,
  onToggle,
  className
}) => {
  return (
    <div
      className={cn(
        "flex flex-col bg-white border rounded-lg overflow-hidden transition-all duration-300 ease-in-out",
        expanded ? "flex-1" : "flex-[0.15]",
        className
      )}
    >
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-semibold flex-1 text-center">{title}</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="panel-handle rounded-full hover:bg-blue-100"
          aria-label={expanded ? `Collapse ${title}` : `Expand ${title}`}
        >
          {side === "left" && expanded && <ChevronLeft className="h-5 w-5" />}
          {side === "left" && !expanded && <ChevronRight className="h-5 w-5" />}
          {side === "right" && expanded && <ChevronRight className="h-5 w-5" />}
          {side === "right" && !expanded && <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>
      <div className={cn(
        "flex-1 overflow-auto transition-all duration-300",
        !expanded && "opacity-0 pointer-events-none"
      )}>
        {children}
      </div>
    </div>
  );
};

export default AnimatedPanel;
