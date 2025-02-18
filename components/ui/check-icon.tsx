// components/CheckIcon.tsx
import { cn } from "@/lib/utils"

interface CheckIconProps {
  isValid: boolean;
  className?: string;
}

export const CheckIcon = ({ isValid, className }: CheckIconProps) => {
  if (!isValid) return null;
  
  return (
    <svg
      className={cn("h-4 w-4 text-green-500 absolute right-2 top-1/2 -translate-y-1/2", className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
};