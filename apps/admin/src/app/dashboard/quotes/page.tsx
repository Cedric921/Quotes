"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/auth";
import { QuotesSkeleton } from "@/components/skeletons/QuotesSkeleton";
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
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Quote as QuoteIcon,
  BookOpen,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

interface Quote {
  id: string;
  text: string;
  author?: string;
  topic?: {
    id: string;
    name: string;
  };
}

interface Topic {
  id: string;
  name: string;
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    text: "",
    author: "",
    topicId: "none",
  });

  const fetchQuotes = async () => {
    try {
      const response = await apiClient.get<Quote[]>("/quotes");
      setQuotes(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch quotes");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTopics = async () => {
    try {
      const response = await apiClient.get<Topic[]>("/topics");
      setTopics(response.data);
    } catch (err: any) {
      console.error("Failed to fetch topics", err);
    }
  };

  useEffect(() => {
    fetchQuotes();
    fetchTopics();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const toastId = toast.loading(
      editingQuote ? "Updating quote..." : "Creating quote...",
    );

    try {
      const payload = {
        text: formData.text,
        author: formData.author,
        ...(formData.topicId &&
          formData.topicId !== "none" && {
            topicId: Number.parseInt(formData.topicId),
          }),
      };

      if (editingQuote) {
        await apiClient.patch(`/quotes/${editingQuote.id}`, payload);
        toast.success("Quote updated successfully!", { id: toastId });
      } else {
        await apiClient.post("/quotes", payload);
        toast.success("Quote created successfully!", { id: toastId });
      }

      setFormData({ text: "", author: "", topicId: "none" });
      setIsSheetOpen(false);
      setEditingQuote(null);
      fetchQuotes();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save quote", {
        id: toastId,
      });
    }
  };

  const handleEdit = (quote: Quote) => {
    setEditingQuote(quote);
    setFormData({
      text: quote.text || "",
      author: quote.author || "",
      topicId: quote.topic?.id || "none",
    });
    setIsSheetOpen(true);
  };

  const handleAddNew = () => {
    setEditingQuote(null);
    setFormData({ text: "", author: "", topicId: "none" });
    setIsSheetOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setQuoteToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!quoteToDelete) return;

    const toastId = toast.loading("Deleting quote...");

    try {
      await apiClient.delete(`/quotes/${quoteToDelete}`);
      toast.success("Quote deleted successfully!", { id: toastId });
      setDeleteDialogOpen(false);
      setQuoteToDelete(null);
      fetchQuotes();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete quote", {
        id: toastId,
      });
    }
  };

  if (isLoading) {
    return <QuotesSkeleton />;
  }

  return (
    <>
      <div className="flex flex-col h-full space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Quotes Management
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your inspirational quotes
            </p>
          </div>
          <Button
            onClick={handleAddNew}
            size="lg"
            className="gap-2 shadow-lg hover:shadow-xl transition-shadow"
          >
            <Plus className="w-4 h-4" />
            Add Quote
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-lg border-2 border-destructive/20 animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        {/* Quotes Grid */}
        <div className="grid gap-6">
          {quotes.map((quote) => (
            <Card
              key={quote.id}
              className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/30 relative overflow-hidden bg-gradient-to-br from-card to-card/50"
            >
              {/* Decorative Elements */}
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary via-primary/50 to-transparent" />
              <div className="absolute -right-12 -top-12 w-40 h-40 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-2xl" />

              <CardHeader className="pb-3 relative">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <QuoteIcon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl leading-relaxed mb-3 font-serif italic">
                      &ldquo;{quote.text}&rdquo;
                    </CardTitle>
                    <div className="flex items-center gap-3 flex-wrap">
                      {quote.author && (
                        <CardDescription className="text-base font-semibold flex items-center gap-1">
                          <span className="text-primary">—</span> {quote.author}
                        </CardDescription>
                      )}
                      {quote.topic && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20 text-purple-700 dark:text-purple-300"
                        >
                          <BookOpen className="w-3 h-3 mr-1" />
                          {quote.topic.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(quote)}
                      className="hover:bg-primary hover:text-primary-foreground hover:scale-110 transition-all shadow-md"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteClick(quote.id)}
                      className="hover:bg-destructive hover:text-destructive-foreground hover:scale-110 transition-all shadow-md"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {quotes.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
              <QuoteIcon className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-2">No quotes yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              Get started by creating your first inspirational quote to share
              with your users
            </p>
            <Button
              onClick={handleAddNew}
              size="lg"
              className="gap-2 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Add Your First Quote
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
                <QuoteIcon className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <SheetTitle className="text-2xl">
                  {editingQuote ? "Edit Quote" : "Add New Quote"}
                </SheetTitle>
                <SheetDescription className="text-base">
                  {editingQuote
                    ? "Make changes to your quote here."
                    : "Fill in the details to create a new quote."}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            <div className="space-y-3">
              <Label
                htmlFor="text"
                className="text-base font-semibold flex items-center gap-2"
              >
                <QuoteIcon className="w-4 h-4 text-primary" />
                Quote Text *
              </Label>
              <Textarea
                id="text"
                value={formData.text}
                onChange={(e) =>
                  setFormData({ ...formData, text: e.target.value })
                }
                placeholder="Enter the inspirational quote..."
                className="min-h-[140px] text-base resize-none border-2 focus:border-primary transition-colors"
                required
              />
              <p className="text-xs text-muted-foreground">
                {formData.text.length} characters
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="author" className="text-base font-semibold">
                Author
              </Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) =>
                  setFormData({ ...formData, author: e.target.value })
                }
                placeholder="e.g., Albert Einstein"
                className="border-2 focus:border-primary transition-colors"
              />
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="topicId"
                className="text-base font-semibold flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-primary" />
                Topic
              </Label>
              <Select
                value={formData.topicId}
                onValueChange={(value) =>
                  setFormData({ ...formData, topicId: value })
                }
              >
                <SelectTrigger className="border-2 focus:border-primary transition-colors">
                  <SelectValue placeholder="Select a topic (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Topic</SelectItem>
                  {topics.map((topic) => (
                    <SelectItem key={topic.id} value={topic.id}>
                      {topic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-6 border-t">
              <Button
                type="submit"
                className="flex-1 gap-2 shadow-lg hover:shadow-xl transition-shadow"
              >
                {editingQuote ? (
                  <>
                    <Pencil className="w-4 h-4" />
                    Update Quote
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create Quote
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
                Delete Quote
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base">
              Are you sure you want to delete this quote? This action cannot be
              undone and the quote will be permanently removed from the
              database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-2">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Delete Quote
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
