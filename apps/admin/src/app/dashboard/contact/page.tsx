"use client";

import { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Mail, MailOpen, Trash2, Loader2, Eye, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  useContactMessages,
  useContactMessage,
  useMarkContactAsUnread,
  useDeleteContactMessage,
} from "@/api/hooks";
import { ContactMessage } from "@/services/api";

export default function ContactPage() {
  const { t } = useLocale();
  const { data: messages = [], isLoading, refetch } = useContactMessages();
  const markUnreadMutation = useMarkContactAsUnread();
  const deleteMutation = useDeleteContactMessage();

  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(
    null,
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [messageIdToView, setMessageIdToView] = useState<string | null>(null);

  // Auto-mark as read when viewing
  useContactMessage(messageIdToView || "");

  const handleViewMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    setDialogOpen(true);

    // Mark as read by triggering the query
    if (message.status === "UNREAD") {
      setMessageIdToView(message.id);
      refetch(); // Refresh to get updated status
    }
  };

  const handleMarkUnread = async (id: string) => {
    try {
      await markUnreadMutation.mutateAsync(id);
      toast.success(t.contact?.markedAsUnread || "Marked as unread");
    } catch {
      toast.error("Error");
    }
  };

  const handleDelete = async () => {
    if (!messageToDelete) return;
    try {
      await deleteMutation.mutateAsync(messageToDelete);
      toast.success(t.contact?.deleted || "Message deleted");
    } catch {
      toast.error(t.contact?.deleteError || "Error deleting message");
    } finally {
      setDeleteDialogOpen(false);
      setMessageToDelete(null);
    }
  };

  const unreadCount = messages.filter((m) => m.status === "UNREAD").length;

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
            {t.contact?.title || "Contact Messages"}
          </h1>
          <p className="text-muted-foreground">
            {t.contact?.subtitle || "Manage contact messages from users"}
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} {t.contact?.unread || "unread"}
              </Badge>
            )}
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          {t.common?.loading ? "Refresh" : "Refresh"}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>{t.contact?.from || "Name"}</TableHead>
                <TableHead>{"Email"}</TableHead>
                <TableHead>{t.contact?.subject || "Subject"}</TableHead>
                <TableHead>{t.contact?.date || "Date"}</TableHead>
                <TableHead className="text-right">
                  {t.common?.actions || "Actions"}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.map((message) => (
                <TableRow
                  key={message.id}
                  className={
                    message.status === "UNREAD" ? "bg-muted/50 font-medium" : ""
                  }
                >
                  <TableCell>
                    {message.status === "UNREAD" ? (
                      <Mail className="h-4 w-4 text-primary" />
                    ) : (
                      <MailOpen className="h-4 w-4 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell>{message.name}</TableCell>
                  <TableCell>{message.email}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {message.subject}
                  </TableCell>
                  <TableCell>
                    {new Date(message.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewMessage(message)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {message.status === "READ" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleMarkUnread(message.id)}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setMessageToDelete(message.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {messages.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {t.contact?.noMessages || "No messages yet"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Message Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedMessage?.subject}</DialogTitle>
            <DialogDescription>
              {t.contact?.from || "From"}: {selectedMessage?.name} (
              {selectedMessage?.email})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              {selectedMessage &&
                new Date(selectedMessage.createdAt).toLocaleString()}
            </div>
            <div className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg max-h-[300px] overflow-y-auto">
              {selectedMessage?.message}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {t.common?.close || "Close"}
              </Button>
              {selectedMessage?.status === "READ" && (
                <Button
                  variant="outline"
                  onClick={() => {
                    handleMarkUnread(selectedMessage.id);
                    setDialogOpen(false);
                  }}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {t.contact?.markAsUnread || "Mark as unread"}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t.contact?.deleteTitle || "Delete Message"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t.contact?.deleteConfirm ||
                "Are you sure you want to delete this message?"}
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
