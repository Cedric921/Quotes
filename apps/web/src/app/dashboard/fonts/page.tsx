"use client";

import { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Type,
  Eye,
  EyeOff,
  Loader2,
  Crown,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import {
  useFonts,
  useCreateFont,
  useUpdateFont,
  useDeleteFont,
  useToggleFontActive,
  useSetDefaultFont,
} from "@/api/hooks";
import { Font } from "@/services/api";

export default function FontsPage() {
  const { t } = useLocale();
  const { data: fonts = [], isLoading } = useFonts();
  const createFontMutation = useCreateFont();
  const updateFontMutation = useUpdateFont();
  const deleteFontMutation = useDeleteFont();
  const toggleActiveMutation = useToggleFontActive();
  const setDefaultMutation = useSetDefaultFont();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingFont, setEditingFont] = useState<Font | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fontToDelete, setFontToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    fontFamily: "",
    description: "",
    previewText: "The quick brown fox jumps over the lazy dog",
    isActive: true,
    isPremium: true,
    order: 0,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      fontFamily: "",
      description: "",
      previewText: "The quick brown fox jumps over the lazy dog",
      isActive: true,
      isPremium: true,
      order: 0,
    });
    setEditingFont(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.name || !formData.fontFamily) {
      toast.error(
        t.fonts?.requiredFields || "Name and font family are required",
      );
      return;
    }

    const toastId = toast.loading(
      editingFont
        ? t.fonts?.updating || "Updating..."
        : t.fonts?.creating || "Creating...",
    );

    try {
      if (editingFont) {
        await updateFontMutation.mutateAsync({
          id: editingFont.id,
          data: formData,
        });
        toast.success(t.fonts?.fontUpdated || "Font updated", { id: toastId });
      } else {
        await createFontMutation.mutateAsync(formData);
        toast.success(t.fonts?.fontCreated || "Font created", { id: toastId });
      }
      setIsSheetOpen(false);
      resetForm();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error saving font";
      toast.error(message, { id: toastId });
    }
  };

  const handleEdit = (font: Font) => {
    setEditingFont(font);
    setFormData({
      name: font.name,
      fontFamily: font.fontFamily,
      description: font.description || "",
      previewText:
        font.previewText || "The quick brown fox jumps over the lazy dog",
      isActive: font.isActive,
      isPremium: font.isPremium,
      order: font.order,
    });
    setIsSheetOpen(true);
  };

  const handleDelete = async () => {
    if (!fontToDelete) return;
    const toastId = toast.loading(t.fonts?.deleting || "Deleting...");
    try {
      await deleteFontMutation.mutateAsync(fontToDelete);
      toast.success(t.fonts?.fontDeleted || "Font deleted", { id: toastId });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error deleting font";
      toast.error(message, { id: toastId });
    } finally {
      setDeleteDialogOpen(false);
      setFontToDelete(null);
    }
  };

  const handleSetDefault = async (font: Font) => {
    if (font.isDefault) return;
    const toastId = toast.loading(t.fonts?.updating || "Updating...");
    try {
      await setDefaultMutation.mutateAsync(font.id);
      toast.success(
        t.fonts?.defaultFontSet || `"${font.name}" set as default`,
        { id: toastId },
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error setting default font";
      toast.error(message, { id: toastId });
    }
  };

  const handleToggleActive = async (font: Font) => {
    const toastId = toast.loading(t.fonts?.updating || "Updating...");
    try {
      await toggleActiveMutation.mutateAsync(font.id);
      toast.success(
        font.isActive
          ? t.fonts?.fontDeactivated || "Font deactivated"
          : t.fonts?.fontActivated || "Font activated",
        { id: toastId },
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error toggling font";
      toast.error(message, { id: toastId });
    }
  };

  const activeCount = fonts.filter((f) => f.isActive).length;

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
            {t.fonts?.title || "Fonts Management"}
          </h1>
          <p className="text-muted-foreground">
            {(t.fonts?.description || "{count} active fonts (max 10)").replace(
              "{count}",
              String(activeCount),
            )}
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsSheetOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          {t.fonts?.addFont || "Add Font"}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.fonts?.name || "Name"}</TableHead>
                <TableHead>{t.fonts?.fontFamily || "Font Family"}</TableHead>
                <TableHead>{t.fonts?.preview || "Preview"}</TableHead>
                <TableHead>{t.fonts?.status || "Status"}</TableHead>
                <TableHead>{t.fonts?.premium || "Premium"}</TableHead>
                <TableHead className="text-right">
                  {t.fonts?.actions || "Actions"}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fonts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {t.fonts?.noFonts || "No fonts yet. Add your first font!"}
                  </TableCell>
                </TableRow>
              ) : (
                fonts.map((font) => (
                  <TableRow
                    key={font.id}
                    className={!font.isActive ? "opacity-60" : ""}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {font.name}
                        {font.isDefault && (
                          <Badge className="bg-blue-500/10 text-blue-700 border-blue-500/20">
                            <Star className="h-3 w-3 mr-1 fill-current" />
                            {t.fonts?.default || "Default"}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {font.fontFamily}
                      </code>
                    </TableCell>
                    <TableCell>
                      <span
                        style={{ fontFamily: font.fontFamily }}
                        className="text-sm"
                      >
                        {font.previewText?.substring(0, 30) || "Aa Bb Cc"}...
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={font.isActive ? "default" : "secondary"}
                        className={
                          font.isActive
                            ? "bg-green-500/10 text-green-700 border-green-500/20"
                            : ""
                        }
                      >
                        {font.isActive
                          ? t.fonts?.active || "Active"
                          : t.fonts?.inactive || "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {font.isPremium ? (
                        <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/20">
                          <Crown className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Free</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={!font.isActive || font.isDefault}
                          title={t.fonts?.setAsDefault || "Set as default"}
                          onClick={() => handleSetDefault(font)}
                        >
                          <Star
                            className={`h-4 w-4 ${font.isDefault ? "fill-blue-500 text-blue-500" : ""}`}
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(font)}
                        >
                          {font.isActive ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(font)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setFontToDelete(font.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Sheet for Create/Edit */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              {editingFont
                ? t.fonts?.editFont || "Edit Font"
                : t.fonts?.addFont || "Add Font"}
            </SheetTitle>
            <SheetDescription>
              {editingFont
                ? t.fonts?.sheetDescriptionEdit || "Modify the font details"
                : t.fonts?.sheetDescriptionNew ||
                  "Add a new font for premium users"}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <div className="space-y-2">
              <Label htmlFor="name">{t.fonts?.name || "Name"} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Playfair Display"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fontFamily">
                {t.fonts?.fontFamily || "Font Family"} *
              </Label>
              <Input
                id="fontFamily"
                value={formData.fontFamily}
                onChange={(e) =>
                  setFormData({ ...formData, fontFamily: e.target.value })
                }
                placeholder="Playfair Display, serif"
              />
              <p className="text-xs text-muted-foreground">
                {t.fonts?.fontFamilyHint ||
                  "Use CSS font-family format (e.g., 'Roboto, sans-serif')"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                {t.fonts?.descriptionLabel || "Description"}
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder={
                  t.fonts?.descriptionPlaceholder ||
                  "A classic elegant serif font..."
                }
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="previewText">
                {t.fonts?.previewText || "Preview Text"}
              </Label>
              <Input
                id="previewText"
                value={formData.previewText}
                onChange={(e) =>
                  setFormData({ ...formData, previewText: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">{t.fonts?.order || "Order"}</Label>
              <Input
                id="order"
                type="number"
                min={0}
                max={100}
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
              <Label htmlFor="isActive">{t.fonts?.isActive || "Active"}</Label>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="isPremium">
                  {t.fonts?.isPremium || "Premium Only"}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t.fonts?.premiumHint ||
                    "Only premium users can use this font"}
                </p>
              </div>
              <Switch
                id="isPremium"
                checked={formData.isPremium}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isPremium: checked })
                }
              />
            </div>

            {/* Font Preview */}
            {formData.fontFamily && (
              <div className="p-4 border rounded-lg bg-muted/50">
                <Label className="text-xs text-muted-foreground mb-2 block">
                  {t.fonts?.livePreview || "Live Preview"}
                </Label>
                <p
                  style={{ fontFamily: formData.fontFamily }}
                  className="text-lg"
                >
                  {formData.previewText ||
                    "The quick brown fox jumps over the lazy dog"}
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={
                createFontMutation.isPending || updateFontMutation.isPending
              }
            >
              {(createFontMutation.isPending ||
                updateFontMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editingFont
                ? t.fonts?.updateFont || "Update Font"
                : t.fonts?.createFont || "Create Font"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t.fonts?.deleteTitle || "Delete Font?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t.fonts?.deleteDescription ||
                "This action cannot be undone. This will permanently delete the font."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.fonts?.cancel || "Cancel"}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t.fonts?.delete || "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
