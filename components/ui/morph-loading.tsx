"use client"

import { cn } from "@/lib/utils"

interface UniqueLoadingProps {
  variant?: "morph"
  size?: "sm" | "md" | "lg"
  className?: string
}

export default function UniqueLoading({
  variant = "morph",
  size = "md",
  className,
}: UniqueLoadingProps) {
  const containerSizes = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  }

  // Colors matching the project's chart visualization palette
  const morphColors = [
    "bg-blue-500",    // Primary brand color
    "bg-teal-500",    // Complementary
    "bg-purple-500",  // Accent
    "bg-pink-500",    // Highlight
  ]

  if (variant === "morph") {
    return (
      <div className={cn("relative", containerSizes[size], className)}>
        <div className="absolute inset-0 flex items-center justify-center">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "absolute w-4 h-4",
                morphColors[i],
                "shadow-lg",
                "shadow-current/50"
              )}
              style={{
                animation: `morph-${i} 2s infinite ease-in-out`,
                animationDelay: `${i * 0.2}s`,
                filter: "blur(0.5px)",
              }}
            />
          ))}
        </div>
      </div>
    )
  }

  return null
}