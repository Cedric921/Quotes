"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/auth";
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
import { Plus, Pencil, Trash2, Tag, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface Topic {
  id: number;
  name: string;
  description: string;
}

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  const fetchTopics = async () => {
    try {
      const response = await apiClient.get<Topic[]>("/topics");
      setTopics(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch topics");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const toastId = toast.loading(
      editingTopic ? "Updating topic..." : "Creating topic...",
    );

    try {
      if (editingTopic) {
        await apiClient.patch(`/topics/${editingTopic.id}`, formData);
        toast.success("Topic updated successfully!", { id: toastId });
      } else {
        await apiClient.post("/topics", formData);
        toast.success("Topic created successfully!", { id: toastId });
      }

      setFormData({ name: "", description: "" });
      setIsSheetOpen(false);
      setEditingTopic(null);
      fetchTopics();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save topic", {
        id: toastId,
      });
    }
  };

  const handleEdit = (topic: Topic) => {
    setEditingTopic(topic);
    setFormData({ name: topic.name, description: topic.description });
    setIsSheetOpen(true);
  };

  const handleAddNew = () => {
    setEditingTopic(null);
    setFormData({ name: "", description: "" });
    setIsSheetOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setTopicToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!topicToDelete) return;

    const toastId = toast.loading("Deleting topic...");

    try {
      await apiClient.delete(`/topics/${topicToDelete}`);
      toast.success("Topic deleted successfully!", { id: toastId });
      setDeleteDialogOpen(false);
      setTopicToDelete(null);
      fetchTopics();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete topic", {
        id: toastId,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-muted-foreground">Loading topics...</div>
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
              Topics Management
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Organize your quotes by topics
            </p>
          </div>
          <Button
            onClick={handleAddNew}
            size="lg"
            className="gap-2 shadow-lg hover:shadow-xl transition-shadow"
          >
            <Plus className="w-4 h-4" />
            Add Topic
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-lg border-2 border-destructive/20 animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

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
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Tag className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                      {topic.name}
                    </CardTitle>
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
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClick(topic.id)}
                    className="flex-1 hover:bg-destructive hover:text-destructive-foreground hover:scale-105 transition-all shadow-md"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
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
            <h3 className="text-2xl font-bold mb-2">No topics yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              Create your first topic to organize and categorize your quotes
            </p>
            <Button
              onClick={handleAddNew}
              size="lg"
              className="gap-2 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Add Your First Topic
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
                  {editingTopic ? "Edit Topic" : "Add New Topic"}
                </SheetTitle>
                <SheetDescription className="text-base">
                  {editingTopic
                    ? "Make changes to your topic here."
                    : "Fill in the details to create a new topic."}
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
                Topic Name *
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
                Description
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

            <div className="flex gap-3 pt-6 border-t">
              <Button
                type="submit"
                className="flex-1 gap-2 shadow-lg hover:shadow-xl transition-shadow"
              >
                {editingTopic ? (
                  <>
                    <Pencil className="w-4 h-4" />
                    Update Topic
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create Topic
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsSheetOpen(false)}
                className="flex-1 border-2"
              >
                Cancel
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
                Delete Topic
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base">
              Are you sure you want to delete this topic? This action cannot be
              undone and the topic will be permanently removed from the
              database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-2">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Delete Topic
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
