"use client";

import { useState, useRef } from "react";
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
  Upload,
  FileJson,
} from "lucide-react";
import { toast } from "sonner";
import {
  useQuotes,
  useCreateQuote,
  useUpdateQuote,
  useDeleteQuote,
  useTopics,
  useBulkImportQuotes,
} from "@/api/hooks";
import { Quote, QuoteImportItem } from "@/services/api";
import { useLocale } from "@/contexts/LocaleContext";

export default function QuotesPage() {
  const { t } = useLocale();
  const { data: quotes = [], isLoading, error } = useQuotes();
  const { data: topics = [] } = useTopics();
  const createQuoteMutation = useCreateQuote();
  const updateQuoteMutation = useUpdateQuote();
  const deleteQuoteMutation = useDeleteQuote();
  const bulkImportMutation = useBulkImportQuotes();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isImportSheetOpen, setIsImportSheetOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    text: "",
    author: "",
    topicId: "none",
  });
  const [importTopicId, setImportTopicId] = useState<string>("none");
  const [importPreview, setImportPreview] = useState<QuoteImportItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const toastId = toast.loading(
      editingQuote ? t.quotes.updating : t.quotes.creating,
    );

    try {
      const payload = {
        text: formData.text,
        author: formData.author,
        ...(formData.topicId &&
          formData.topicId !== "none" && {
            topicId: formData.topicId,
          }),
      };

      if (editingQuote) {
        await updateQuoteMutation.mutateAsync({
          id: editingQuote.id,
          data: payload,
        });
        toast.success(t.quotes.updated, { id: toastId });
      } else {
        await createQuoteMutation.mutateAsync(payload);
        toast.success(t.quotes.created, { id: toastId });
      }

      setFormData({ text: "", author: "", topicId: "none" });
      setIsSheetOpen(false);
      setEditingQuote(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : editingQuote
            ? t.quotes.updateFailed
            : t.quotes.createFailed;
      toast.error(message, { id: toastId });
    }
  };

  const handleEdit = (quote: Quote) => {
    setEditingQuote(quote);
    setFormData({
      text: quote.text || "",
      author: quote.author || "",
      topicId: quote.topicId || "none",
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

    const toastId = toast.loading(t.quotes.deleting);

    try {
      await deleteQuoteMutation.mutateAsync(quoteToDelete);
      toast.success(t.quotes.deleted, { id: toastId });
      setDeleteDialogOpen(false);
      setQuoteToDelete(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : t.quotes.deleteFailed;
      toast.error(message, { id: toastId });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        let parsedQuotes: QuoteImportItem[] = [];

        if (file.name.endsWith(".json")) {
          const json = JSON.parse(content);
          parsedQuotes = Array.isArray(json) ? json : json.quotes || [];
        } else if (file.name.endsWith(".csv")) {
          const lines = content.split("\n").filter((line) => line.trim());
          const hasHeader =
            lines[0]?.toLowerCase().includes("text") ||
            lines[0]?.toLowerCase().includes("author");
          const startIndex = hasHeader ? 1 : 0;

          parsedQuotes = lines.slice(startIndex).map((line) => {
            const parts = line
              .split(",")
              .map((p) => p.trim().replace(/^"|"$/g, ""));
            return { text: parts[0] || "", author: parts[1] || "" };
          });
        }

        setImportPreview(parsedQuotes.filter((q) => q.text));
        toast.success(
          `${parsedQuotes.filter((q) => q.text).length} citations détectées`,
        );
      } catch {
        toast.error("Erreur lors de la lecture du fichier");
      }
    };
    reader.readAsText(file);
  };

  const handleBulkImport = async () => {
    if (importTopicId === "none" || importPreview.length === 0) {
      toast.error("Sélectionnez un topic et importez un fichier");
      return;
    }

    const toastId = toast.loading(
      `Import de ${importPreview.length} citations...`,
    );

    try {
      const result = await bulkImportMutation.mutateAsync({
        topicId: importTopicId,
        quotes: importPreview,
      });
      toast.success(`${result.count} citations importées avec succès`, {
        id: toastId,
      });
      setIsImportSheetOpen(false);
      setImportPreview([]);
      setImportTopicId("none");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erreur lors de l'import";
      toast.error(message, { id: toastId });
    }
  };

  if (isLoading) {
    return <QuotesSkeleton />;
  }

  if (error) {
    return (
      <div className="p-4 text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
        {error instanceof Error ? error.message : "Failed to fetch quotes"}
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
              {t.quotes.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t.quotes.subtitle}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsImportSheetOpen(true)}
              size="lg"
              variant="outline"
              className="gap-2 shadow-lg hover:shadow-xl transition-shadow"
            >
              <Upload className="w-4 h-4" />
              Import
            </Button>
            <Button
              onClick={handleAddNew}
              size="lg"
              className="gap-2 shadow-lg hover:shadow-xl transition-shadow"
            >
              <Plus className="w-4 h-4" />
              {t.quotes.addQuote}
            </Button>
          </div>
        </div>

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
            <h3 className="text-2xl font-bold mb-2">{t.quotes.noQuotes}</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              {t.quotes.startAdding}
            </p>
            <Button
              onClick={handleAddNew}
              size="lg"
              className="gap-2 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              {t.quotes.addQuote}
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
                  {editingQuote ? t.quotes.editQuote : t.quotes.addQuote}
                </SheetTitle>
                <SheetDescription className="text-base">
                  {t.quotes.description}
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
                {t.quotes.text} *
              </Label>
              <Textarea
                id="text"
                value={formData.text}
                onChange={(e) =>
                  setFormData({ ...formData, text: e.target.value })
                }
                placeholder={t.quotes.quoteText}
                className="min-h-[140px] text-base resize-none border-2 focus:border-primary transition-colors"
                required
              />
              <p className="text-xs text-muted-foreground">
                {formData.text.length} characters
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="author" className="text-base font-semibold">
                {t.quotes.author}
              </Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) =>
                  setFormData({ ...formData, author: e.target.value })
                }
                placeholder={t.quotes.authorName}
                className="border-2 focus:border-primary transition-colors"
              />
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="topicId"
                className="text-base font-semibold flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-primary" />
                {t.quotes.topic}
              </Label>
              <Select
                value={formData.topicId}
                onValueChange={(value) =>
                  setFormData({ ...formData, topicId: value })
                }
              >
                <SelectTrigger className="border-2 focus:border-primary transition-colors">
                  <SelectValue placeholder={t.quotes.selectTopic} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t.quotes.noTopic}</SelectItem>
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
                    {t.quotes.editQuote}
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    {t.quotes.addQuote}
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
                {t.quotes.deleteTitle}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base">
              {t.quotes.deleteConfirm}
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
              {t.quotes.deleteQuote}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Import Sheet */}
      <Sheet open={isImportSheetOpen} onOpenChange={setIsImportSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto bg-gradient-to-br from-background to-muted/20">
          <SheetHeader className="space-y-3 pb-6 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                <FileJson className="w-6 h-6 text-white" />
              </div>
              <div>
                <SheetTitle className="text-2xl">Import en masse</SheetTitle>
                <SheetDescription className="text-base">
                  Importez plusieurs citations depuis un fichier JSON ou CSV
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="space-y-6 mt-8">
            {/* Topic Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                Topic de destination *
              </Label>
              <Select value={importTopicId} onValueChange={setImportTopicId}>
                <SelectTrigger className="border-2 focus:border-primary transition-colors">
                  <SelectValue placeholder="Sélectionner un topic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Sélectionner --</SelectItem>
                  {topics.map((topic) => (
                    <SelectItem key={topic.id} value={topic.id}>
                      {topic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* File Upload */}
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Upload className="w-4 h-4 text-primary" />
                Fichier (JSON ou CSV)
              </Label>
              <Input
                ref={fileInputRef}
                type="file"
                accept=".json,.csv"
                onChange={handleFileSelect}
                className="border-2 focus:border-primary transition-colors cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">
                Format JSON: [{`{"text": "...", "author": "..."}`}] <br />
                Format CSV: text,author (une ligne par citation)
              </p>
            </div>

            {/* Preview */}
            {importPreview.length > 0 && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  Aperçu ({importPreview.length} citations)
                </Label>
                <div className="max-h-64 overflow-y-auto space-y-2 border rounded-lg p-3 bg-muted/30">
                  {importPreview.slice(0, 10).map((quote, i) => (
                    <div
                      key={i}
                      className="p-2 bg-background rounded border text-sm"
                    >
                      <p className="font-medium truncate">
                        &ldquo;{quote.text}&rdquo;
                      </p>
                      {quote.author && (
                        <p className="text-muted-foreground text-xs">
                          — {quote.author}
                        </p>
                      )}
                    </div>
                  ))}
                  {importPreview.length > 10 && (
                    <p className="text-center text-muted-foreground text-sm py-2">
                      + {importPreview.length - 10} autres citations...
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-6 border-t">
              <Button
                onClick={handleBulkImport}
                disabled={
                  importTopicId === "none" ||
                  importPreview.length === 0 ||
                  bulkImportMutation.isPending
                }
                className="flex-1 gap-2 shadow-lg hover:shadow-xl transition-shadow"
              >
                <Upload className="w-4 h-4" />
                Importer{" "}
                {importPreview.length > 0 ? `(${importPreview.length})` : ""}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsImportSheetOpen(false);
                  setImportPreview([]);
                  setImportTopicId("none");
                }}
                className="flex-1 border-2"
              >
                {t.common.cancel}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
