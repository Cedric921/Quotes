"use client";

import { useState } from "react";
import { TopicsSkeleton } from "@/components/skeletons/TopicsSkeleton";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Tag,
  AlertTriangle,
  Sparkles,
  Palette,
  Crown,
} from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { IconPicker } from "@/components/ui/icon-picker";
import { getLucideIcon } from "@/lib/icon-helper";
import {
  useTopics,
  useCreateTopic,
  useUpdateTopic,
  useDeleteTopic,
} from "@/api/hooks";
import { Topic } from "@/services/api";
import { useLocale } from "@/contexts/LocaleContext";

export default function TopicsPage() {
  const { t } = useLocale();
  const { data: topics = [], isLoading, error } = useTopics();
  const createTopicMutation = useCreateTopic();
  const updateTopicMutation = useUpdateTopic();
  const deleteTopicMutation = useDeleteTopic();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    title: "",
    icon: "",
    color: "",
    isPremium: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const toastId = toast.loading(
      editingTopic ? t.topics.updating : t.topics.creating,
    );

    try {
      if (editingTopic) {
        await updateTopicMutation.mutateAsync({
          id: editingTopic.id,
          data: formData,
        });
        toast.success(t.topics.updated, { id: toastId });
      } else {
        await createTopicMutation.mutateAsync(formData);
        toast.success(t.topics.created, { id: toastId });
      }

      setFormData({
        name: "",
        description: "",
        title: "",
        icon: "",
        color: "",
        isPremium: false,
      });
      setIsSheetOpen(false);
      setEditingTopic(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : editingTopic
            ? t.topics.updateFailed
            : t.topics.createFailed;
      toast.error(message, { id: toastId });
    }
  };

  const handleEdit = (topic: Topic) => {
    setEditingTopic(topic);
    setFormData({
      name: topic.name,
      description: topic.description || "",
      title: topic.title || "",
      icon: topic.icon || "",
      color: topic.color || "",
      isPremium: topic.isPremium || false,
    });
    setIsSheetOpen(true);
  };

  const handleAddNew = () => {
    setEditingTopic(null);
    setFormData({
      name: "",
      description: "",
      title: "",
      icon: "",
      color: "",
      isPremium: false,
    });
    setIsSheetOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setTopicToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!topicToDelete) return;

    const toastId = toast.loading(t.topics.deleting);

    try {
      await deleteTopicMutation.mutateAsync(topicToDelete);
      toast.success(t.topics.deleted, { id: toastId });
      setDeleteDialogOpen(false);
      setTopicToDelete(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : t.topics.deleteFailed;
      toast.error(message, { id: toastId });
    }
  };

  if (isLoading) {
    return <TopicsSkeleton />;
  }

  if (error) {
    return (
      <div className="p-4 text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
        {error instanceof Error ? error.message : "Failed to fetch topics"}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {t.topics.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t.topics.subtitle}
            </p>
          </div>
          <Button
            onClick={handleAddNew}
            size="lg"
            className="gap-2 shadow-lg hover:shadow-xl transition-shadow"
          >
            <Plus className="w-4 h-4" />
            {t.topics.addTopic}
          </Button>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic) => (
            <Card
              key={topic.id}
              className="group hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 hover:border-primary/30 relative overflow-hidden bg-gradient-to-br from-card to-card/50"
            >
              {/* Decorative gradient */}
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl" />

              <CardHeader className="relative">
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
                    style={{
                      background: topic.color
                        ? `linear-gradient(135deg, ${topic.color}, ${topic.color}99)`
                        : "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.6))",
                    }}
                  >
                    {getLucideIcon(topic.icon, {
                      className: "w-6 h-6 text-primary-foreground",
                    })}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">
                        {topic.title || topic.name}
                      </CardTitle>
                      {topic.isPremium && (
                        <Crown className="w-4 h-4 text-yellow-500 shrink-0" />
                      )}
                    </div>
                    <CardDescription className="line-clamp-3 text-sm">
                      {topic.description || "No description provided"}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(topic)}
                    className="flex-1 hover:bg-primary hover:text-primary-foreground hover:scale-105 transition-all shadow-md"
                  >
                    <Pencil className="w-3 h-3 mr-1" />
                    {t.common.edit}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClick(topic.id)}
                    className="flex-1 hover:bg-destructive hover:text-destructive-foreground hover:scale-105 transition-all shadow-md"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    {t.common.delete}
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {topics.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
              <Tag className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-2">{t.topics.noTopics}</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              {t.topics.startAdding}
            </p>
            <Button
              onClick={handleAddNew}
              size="lg"
              className="gap-2 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              {t.topics.addTopic}
            </Button>
          </div>
        )}
      </div>

      {/* Right Drawer Modal */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto bg-gradient-to-br from-background to-muted/20">
          <SheetHeader className="space-y-3 pb-6 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-gradient-to-br from-primary to-primary/60 shadow-lg">
                <Tag className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <SheetTitle className="text-2xl">
                  {editingTopic ? t.topics.editTopic : t.topics.addTopic}
                </SheetTitle>
                <SheetDescription className="text-base">
                  {t.topics.subtitle}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            <div className="space-y-3">
              <Label
                htmlFor="name"
                className="text-base font-semibold flex items-center gap-2"
              >
                <Tag className="w-4 h-4 text-primary" />
                {t.topics.name} *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Motivation, Success, Wisdom..."
                className="border-2 focus:border-primary transition-colors"
                required
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="description" className="text-base font-semibold">
                {t.topics.description}
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe what this topic is about..."
                className="min-h-[120px] resize-none border-2 focus:border-primary transition-colors"
              />
              <p className="text-xs text-muted-foreground">
                {formData.description.length} characters
              </p>
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="title"
                className="text-base font-semibold flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-primary" />
                {t.topics.displayTitle}
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., Motivation, Success..."
                className="border-2 focus:border-primary transition-colors"
              />
              <p className="text-xs text-muted-foreground">
                Title shown in the mobile app (defaults to name if empty)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label
                  htmlFor="icon"
                  className="text-base font-semibold flex items-center gap-2"
                >
                  <Tag className="w-4 h-4 text-primary" />
                  {t.topics.icon}
                </Label>
                <IconPicker
                  value={formData.icon}
                  onChange={(iconName) =>
                    setFormData({ ...formData, icon: iconName })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Choose an icon from Lucide Icons
                </p>
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="color"
                  className="text-base font-semibold flex items-center gap-2"
                >
                  <Palette className="w-4 h-4 text-primary" />
                  {t.topics.color}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={formData.color || "#667eea"}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    className="w-16 h-10 p-1 border-2 focus:border-primary transition-colors"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    placeholder="#667eea"
                    className="flex-1 border-2 focus:border-primary transition-colors"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Gradient color for the topic card
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border-2 rounded-lg">
              <div className="space-y-1">
                <Label
                  htmlFor="isPremium"
                  className="text-base font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <Crown className="w-4 h-4 text-yellow-500" />
                  {t.topics.premium}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t.topics.premiumOnly}
                </p>
              </div>
              <Switch
                id="isPremium"
                checked={formData.isPremium}
                onCheckedChange={(checked: boolean) =>
                  setFormData({ ...formData, isPremium: checked })
                }
              />
            </div>

            <div className="flex gap-3 pt-6 border-t">
              <Button
                type="submit"
                className="flex-1 gap-2 shadow-lg hover:shadow-xl transition-shadow"
              >
                {editingTopic ? (
                  <>
                    <Pencil className="w-4 h-4" />
                    {t.topics.editTopic}
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    {t.topics.addTopic}
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsSheetOpen(false)}
                className="flex-1 border-2"
              >
                {t.common.cancel}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="border-2 border-destructive/20">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <AlertDialogTitle className="text-xl">
                {t.topics.deleteTitle}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base">
              {t.topics.deleteConfirm}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-2">
              {t.common.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {t.topics.deleteTopic}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
