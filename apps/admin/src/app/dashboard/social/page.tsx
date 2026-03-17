"use client";

import { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/auth";
import { useLocale } from "@/contexts/LocaleContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface SocialNetwork {
  id: string;
  name: string;
  url: string;
  icon: string;
  color?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
}

export default function SocialPage() {
  const { t } = useLocale();
  const [socials, setSocials] = useState<SocialNetwork[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingSocial, setEditingSocial] = useState<SocialNetwork | null>(
    null,
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [socialToDelete, setSocialToDelete] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    icon: "",
    color: "#667eea",
    isActive: true,
    order: 0,
  });

  const fetchSocials = useCallback(async () => {
    try {
      const response = await apiClient.get<SocialNetwork[]>("/social");
      setSocials(response.data);
    } catch {
      toast.error(t.social?.loadError || "Error loading social networks");
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchSocials();
  }, [fetchSocials]);

  const resetForm = () => {
    setFormData({
      name: "",
      url: "",
      icon: "",
      color: "#667eea",
      isActive: true,
      order: 0,
    });
    setEditingSocial(null);
  };

  const openSheet = (social?: SocialNetwork) => {
    if (social) {
      setEditingSocial(social);
      setFormData({
        name: social.name,
        url: social.url,
        icon: social.icon,
        color: social.color || "#667eea",
        isActive: social.isActive,
        order: social.order,
      });
    } else {
      resetForm();
    }
    setIsSheetOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingSocial) {
        await apiClient.put(`/social/${editingSocial.id}`, formData);
        toast.success(t.social?.updated || "Social network updated");
      } else {
        await apiClient.post("/social", formData);
        toast.success(t.social?.created || "Social network created");
      }
      fetchSocials();
      setIsSheetOpen(false);
      resetForm();
    } catch {
      toast.error(t.social?.error || "Error saving social network");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await apiClient.put(`/social/${id}/toggle-active`);
      setSocials((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s)),
      );
      toast.success(t.social?.toggled || "Visibility updated");
    } catch {
      toast.error(t.social?.error || "Error");
    }
  };

  const handleDelete = async () => {
    if (!socialToDelete) return;
    try {
      await apiClient.delete(`/social/${socialToDelete}`);
      setSocials((prev) => prev.filter((s) => s.id !== socialToDelete));
      toast.success(t.social?.deleted || "Social network deleted");
    } catch {
      toast.error(t.social?.deleteError || "Error deleting");
    } finally {
      setDeleteDialogOpen(false);
      setSocialToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t.social?.title || "Social Networks"}
          </h1>
          <p className="text-muted-foreground">
            {t.social?.subtitle || "Manage social network links"}
          </p>
        </div>
        <Button onClick={() => openSheet()}>
          <Plus className="h-4 w-4 mr-2" />
          {t.social?.add || "Add Social Network"}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.social?.name || "Name"}</TableHead>
                <TableHead>{t.social?.icon || "Icon"}</TableHead>
                <TableHead>{t.social?.url || "URL"}</TableHead>
                <TableHead>{t.social?.status || "Status"}</TableHead>
                <TableHead>{t.social?.order || "Order"}</TableHead>
                <TableHead className="text-right">
                  {t.common?.actions || "Actions"}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {socials.map((social) => (
                <TableRow key={social.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded flex items-center justify-center text-white text-xs"
                        style={{ backgroundColor: social.color || "#667eea" }}
                      >
                        {social.icon.charAt(0).toUpperCase()}
                      </div>
                      {social.name}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {social.icon}
                  </TableCell>
                  <TableCell>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      {social.url.substring(0, 30)}...
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </TableCell>
                  <TableCell>
                    <Badge variant={social.isActive ? "default" : "secondary"}>
                      {social.isActive
                        ? t.common?.active || "Active"
                        : t.common?.inactive || "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{social.order}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleActive(social.id)}
                      >
                        {social.isActive ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openSheet(social)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSocialToDelete(social.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {socials.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {t.social?.noSocials || "No social networks yet"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {editingSocial
                ? t.social?.edit || "Edit Social Network"
                : t.social?.add || "Add Social Network"}
            </SheetTitle>
            <SheetDescription>
              {t.social?.formDescription ||
                "Configure the social network details"}
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="name">{t.social?.name || "Name"}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, name: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">{t.social?.url || "URL"}</Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, url: e.target.value }))
                }
                required
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="icon">
                {t.social?.icon || "Icon"} (Ionicons)
              </Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, icon: e.target.value }))
                }
                required
                placeholder="logo-facebook"
              />
              <p className="text-xs text-muted-foreground">
                Use Ionicons names: logo-facebook, logo-instagram, logo-twitter,
                logo-linkedin, logo-youtube, logo-tiktok
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">{t.social?.color || "Color"}</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, color: e.target.value }))
                  }
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={formData.color}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, color: e.target.value }))
                  }
                  placeholder="#667eea"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="order">{t.social?.order || "Order"}</Label>
              <Input
                id="order"
                type="number"
                value={formData.order}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    order: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">
                {t.social?.visible || "Visible in app"}
              </Label>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData((p) => ({ ...p, isActive: checked }))
                }
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editingSocial
                ? t.common?.save || "Save"
                : t.common?.create || "Create"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t.social?.deleteTitle || "Delete Social Network"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t.social?.deleteConfirm || "Are you sure?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t.common?.cancel || "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              {t.common?.delete || "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
