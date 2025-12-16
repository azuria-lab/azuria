import { cn } from "@/lib/utils";

export type UserStatus = "online" | "away" | "offline";

interface UserStatusProps {
  status: UserStatus;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const statusColors = {
  online: "bg-green-500",
  away: "bg-yellow-500",
  offline: "bg-red-500",
};

const sizeClasses = {
  sm: "h-2 w-2",
  md: "h-3 w-3",
  lg: "h-4 w-4",
};

export default function UserStatus({ status, className, size = "md" }: UserStatusProps) {
  return (
    <div
      className={cn(
        "rounded-full border-2 border-background",
        statusColors[status],
        sizeClasses[size],
        className
      )}
      title={
        status === "online"
          ? "Online"
          : status === "away"
          ? "Ausente"
          : "Offline"
      }
    />
  );
}

