"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Topic {
  id: number;
  name: string;
  description: string;
}

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
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
    try {
      if (editingTopic) {
        await apiClient.patch(`/topics/${editingTopic.id}`, formData);
      } else {
        await apiClient.post("/topics", formData);
      }
      setFormData({ name: "", description: "" });
      setIsEditing(false);
      setEditingTopic(null);
      fetchTopics();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save topic");
    }
  };

  const handleEdit = (topic: Topic) => {
    setEditingTopic(topic);
    setFormData({ name: topic.name, description: topic.description });
    setIsEditing(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this topic?")) return;
    try {
      await apiClient.delete(`/topics/${id}`);
      fetchTopics();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete topic");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingTopic(null);
    setFormData({ name: "", description: "" });
  };

  if (isLoading) {
    return <div>Loading topics...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Sticky Header */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b bg-muted/40 sticky top-0 z-10">
        <h1 className="text-3xl font-bold">Topics Management</h1>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Topic
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
              <CardTitle>{editingTopic ? "Edit Topic" : "Add New Topic"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Name
                  </label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description
                  </label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">
                    {editingTopic ? "Update" : "Create"}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.map((topic) => (
            <Card key={topic.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle>{topic.name}</CardTitle>
                    <CardDescription>{topic.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(topic)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(topic.id)}
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
