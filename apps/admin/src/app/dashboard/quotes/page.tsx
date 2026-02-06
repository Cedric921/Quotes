"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Quote {
  id: number;
  text: string;
  author: string;
  topic?: {
    id: number;
    name: string;
  };
}

interface Topic {
  id: number;
  name: string;
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [formData, setFormData] = useState({ text: "", author: "", topicId: "" });

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
    try {
      const payload = {
        text: formData.text,
        author: formData.author,
        ...(formData.topicId && { topicId: parseInt(formData.topicId) }),
      };

      if (editingQuote) {
        await apiClient.patch(`/quotes/${editingQuote.id}`, payload);
      } else {
        await apiClient.post("/quotes", payload);
      }
      setFormData({ text: "", author: "", topicId: "" });
      setIsEditing(false);
      setEditingQuote(null);
      fetchQuotes();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save quote");
    }
  };

  const handleEdit = (quote: Quote) => {
    setEditingQuote(quote);
    setFormData({
      text: quote.text,
      author: quote.author,
      topicId: quote.topic?.id.toString() || "",
    });
    setIsEditing(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this quote?")) return;
    try {
      await apiClient.delete(`/quotes/${id}`);
      fetchQuotes();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete quote");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingQuote(null);
    setFormData({ text: "", author: "", topicId: "" });
  };

  if (isLoading) {
    return <div>Loading quotes...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Sticky Header */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b bg-muted/40 sticky top-0 z-10">
        <h1 className="text-3xl font-bold">Quotes Management</h1>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Quote
          </Button>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {error && (
          <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
            {error}
          </div>
        )}

        {isEditing && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{editingQuote ? "Edit Quote" : "Add New Quote"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="text" className="text-sm font-medium">
                    Quote Text
                  </label>
                  <textarea
                    id="text"
                    value={formData.text}
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="author" className="text-sm font-medium">
                    Author
                  </label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="topicId" className="text-sm font-medium">
                    Topic
                  </label>
                  <select
                    id="topicId"
                    value={formData.topicId}
                    onChange={(e) => setFormData({ ...formData, topicId: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">No Topic</option>
                    {topics.map((topic) => (
                      <option key={topic.id} value={topic.id}>
                        {topic.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">
                    {editingQuote ? "Update" : "Create"}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {quotes.map((quote) => (
            <Card key={quote.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">&ldquo;{quote.text}&rdquo;</CardTitle>
                    <CardDescription>
                      {quote.author && `— ${quote.author}`}
                      {quote.topic && ` • ${quote.topic.name}`}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(quote)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(quote.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
