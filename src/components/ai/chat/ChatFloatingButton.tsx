
import React from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

interface ChatFloatingButtonProps {
  onClick: () => void;
  className?: string;
}

export default function ChatFloatingButton({ onClick, className = "" }: ChatFloatingButtonProps) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <Button
        onClick={onClick}
        className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
        size="lg"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    </div>
  );
}
