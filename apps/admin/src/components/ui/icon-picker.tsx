"use client";

import * as React from "react";
import { useState } from "react";
import * as icons from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

// Liste des icônes populaires pour les topics
const POPULAR_ICONS = [
  "Flame",
  "Trophy",
  "Heart",
  "Star",
  "Zap",
  "Target",
  "Award",
  "Crown",
  "Sparkles",
  "Rocket",
  "Brain",
  "Lightbulb",
  "Coffee",
  "Book",
  "Bookmark",
  "Briefcase",
  "Calendar",
  "Camera",
  "Clock",
  "Cloud",
  "Compass",
  "Cpu",
  "Database",
  "Feather",
  "Flag",
  "Gift",
  "Globe",
  "Headphones",
  "Home",
  "Image",
  "Inbox",
  "Key",
  "Layers",
  "Lock",
  "Mail",
  "Map",
  "MessageCircle",
  "Mic",
  "Monitor",
  "Moon",
  "Music",
  "Package",
  "Palette",
  "Paperclip",
  "Phone",
  "PieChart",
  "Play",
  "Plus",
  "Printer",
  "Radio",
  "RefreshCw",
  "Save",
  "Search",
  "Send",
  "Settings",
  "Share",
  "Shield",
  "ShoppingCart",
  "Smartphone",
  "Smile",
  "Speaker",
  "Sun",
  "Tag",
  "ThumbsUp",
  "TrendingUp",
  "Tv",
  "Umbrella",
  "Upload",
  "User",
  "Users",
  "Video",
  "Volume",
  "Watch",
  "Wifi",
  "Wind",
  "X",
  "Youtube",
];

interface IconPickerProps {
  value?: string;
  onChange: (iconName: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredIcons = POPULAR_ICONS.filter((iconName) =>
    iconName.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (iconName: string) => {
    onChange(iconName);
    setOpen(false);
  };

  // Récupérer le composant d'icône dynamiquement
  const IconComponent = value
    ? (icons as any)[value] || icons.Tag
    : icons.Tag;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start gap-2"
        >
          <IconComponent className="w-4 h-4" />
          <span>{value || "Select an icon"}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choose an Icon</DialogTitle>
          <DialogDescription>
            Select an icon for your topic from the list below
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Search icons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <ScrollArea className="h-[400px] pr-4">
            <div className="grid grid-cols-6 gap-2">
              {filteredIcons.map((iconName) => {
                const Icon = (icons as any)[iconName];
                if (!Icon) return null;

                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => handleSelect(iconName)}
                    className={`
                      flex flex-col items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all
                      hover:border-primary hover:bg-primary/5
                      ${value === iconName ? "border-primary bg-primary/10" : "border-border"}
                    `}
                    title={iconName}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-xs text-center truncate w-full">
                      {iconName}
                    </span>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

