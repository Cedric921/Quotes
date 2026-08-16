"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
  textClassName?: string;
}

const sizeMap = {
  sm: { image: 32, text: "text-lg" },
  md: { image: 40, text: "text-xl" },
  lg: { image: 64, text: "text-2xl" },
  xl: { image: 80, text: "text-3xl" },
};

// Fallback SVG logo component
function FallbackLogo({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="50" r="45" fill="url(#gradient)" />
      <text
        x="50"
        y="62"
        textAnchor="middle"
        fill="white"
        fontSize="36"
        fontWeight="bold"
        fontFamily="system-ui"
      >
        F
      </text>
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Logo({
  size = "md",
  className,
  showText = false,
  textClassName,
}: LogoProps) {
  const { image, text } = sizeMap[size];
  const [hasError, setHasError] = useState(false);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className="relative flex items-center justify-center"
        style={{ width: image, height: image }}
      >
        {hasError ? (
          <FallbackLogo size={image} />
        ) : (
          <Image
            src="/logo.png"
            alt="Focus Logo"
            width={image}
            height={image}
            className="object-contain"
            priority
            onError={() => setHasError(true)}
          />
        )}
      </div>
      {showText && (
        <div>
          <h1
            className={cn(
              "font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent",
              text,
              textClassName,
            )}
          >
            Focus
          </h1>
        </div>
      )}
    </div>
  );
}

export default Logo;
