"use client";

import { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/auth";
import { useLocale } from "@/contexts/LocaleContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  Plus,
  Pencil,
  Trash2,
  Image as ImageIcon,
  AlertTriangle,
  Eye,
  EyeOff,
  Upload,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface Theme {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
}

export default function ThemesPage() {
  const { t } = useLocale();
  const [themes, setThemes] = useState<Theme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [themeToDelete, setThemeToDelete] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
    order: 0,
  });

  const fetchThemes = useCallback(async () => {
    try {
      const response = await apiClient.get<Theme[]>("/themes");
      setThemes(response.data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || t.themes.loadError);
    } finally {
      setIsLoading(false);
    }
  }, [t.themes.loadError]);

  useEffect(() => {
    fetchThemes();
  }, [fetchThemes]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t.themes.fileTooLarge);
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", isActive: true, order: 0 });
    setSelectedFile(null);
    setPreviewUrl(null);
    setEditingTheme(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingTheme && !selectedFile) {
      toast.error(t.themes.imageRequired);
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading(
      editingTheme ? t.themes.updating : t.themes.creating,
    );

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("isActive", String(formData.isActive));
      data.append("order", String(formData.order));
      if (selectedFile) {
        data.append("image", selectedFile);
      }

      if (editingTheme) {
        await apiClient.put(`/themes/${editingTheme.id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success(t.themes.themeUpdated, { id: toastId });
      } else {
        await apiClient.post("/themes", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success(t.themes.themeCreated, { id: toastId });
      }

      setIsSheetOpen(false);
      resetForm();
      fetchThemes();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || t.themes.error, {
        id: toastId,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (theme: Theme) => {
    setEditingTheme(theme);
    setFormData({
      name: theme.name,
      description: theme.description || "",
      isActive: theme.isActive,
      order: theme.order,
    });
    setPreviewUrl(theme.thumbnailUrl || theme.imageUrl);
    setIsSheetOpen(true);
  };

  const handleDelete = async () => {
    if (!themeToDelete) return;
    const toastId = toast.loading(t.themes.deleting);
    try {
      await apiClient.delete(`/themes/${themeToDelete}`);
      toast.success(t.themes.themeDeleted, { id: toastId });
      fetchThemes();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || t.themes.error, {
        id: toastId,
      });
    } finally {
      setDeleteDialogOpen(false);
      setThemeToDelete(null);
    }
  };

  const handleToggleActive = async (theme: Theme) => {
    const toastId = toast.loading(t.themes.updating);
    try {
      await apiClient.post(`/themes/${theme.id}/toggle-active`);
      toast.success(
        theme.isActive ? t.themes.themeDeactivated : t.themes.themeActivated,
        { id: toastId },
      );
      fetchThemes();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || t.themes.error, {
        id: toastId,
      });
    }
  };

  const activeCount = themes.filter((t) => t.isActive).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t.themes.title}
          </h1>
          <p className="text-muted-foreground">
            {t.themes.description.replace("{count}", String(activeCount))}
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsSheetOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          {t.themes.newTheme}
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {themes.map((theme) => (
          <Card
            key={theme.id}
            className={`overflow-hidden ${!theme.isActive ? "opacity-60" : ""}`}
          >
            <div className="relative aspect-9/16 w-full">
              <Image
                src={theme.thumbnailUrl || theme.imageUrl}
                alt={theme.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3 className="text-white font-semibold truncate">
                  {theme.name}
                </h3>
                <div className="flex items-center gap-1 mt-1">
                  {theme.isActive ? (
                    <span className="text-xs text-green-400 flex items-center gap-1">
                      <Eye className="h-3 w-3" /> {t.themes.active}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <EyeOff className="h-3 w-3" /> {t.themes.inactive}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="p-2 flex justify-between items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToggleActive(theme)}
              >
                {theme.isActive ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(theme)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setThemeToDelete(theme.id);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {themes.length === 0 && (
        <Card className="p-12 text-center">
          <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t.themes.noThemes}</h3>
          <p className="text-muted-foreground mb-4">
            {t.themes.startAddingThemes}
          </p>
          <Button onClick={() => setIsSheetOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t.themes.newTheme}
          </Button>
        </Card>
      )}

      {/* Sheet for create/edit */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingTheme ? t.themes.editTheme : t.themes.newTheme}
            </SheetTitle>
            <SheetDescription>
              {editingTheme
                ? t.themes.sheetDescriptionEdit
                : t.themes.sheetDescriptionNew}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <div className="space-y-2">
              <Label htmlFor="name">{t.themes.name} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder={t.themes.namePlaceholder}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t.themes.descriptionLabel}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder={t.themes.descriptionPlaceholder}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">
                {t.themes.image} {!editingTheme && "*"}
              </Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                {previewUrl ? (
                  <div className="relative aspect-9/16 w-32 mx-auto mb-2">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                ) : (
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                )}
                <Input
                  id="image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {t.themes.imageHint}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">{t.themes.order}</Label>
              <Input
                id="order"
                type="number"
                min="0"
                value={formData.order}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    order: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">{t.themes.isActive}</Label>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editingTheme ? t.themes.updateTheme : t.themes.createTheme}
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {t.themes.deleteConfirmTitle}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t.themes.deleteConfirmDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.themes.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t.themes.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
