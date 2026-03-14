import Image from "next/image";
import { cn } from "@/lib/utils";

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

export function Logo({
  size = "md",
  className,
  showText = false,
  textClassName,
}: LogoProps) {
  const { image, text } = sizeMap[size];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className="relative flex items-center justify-center"
        style={{ width: image, height: image }}
      >
        <Image
          src="/logo.png"
          alt="Focus Logo"
          width={image}
          height={image}
          className="object-contain"
          priority
        />
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

