"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Ticket, Plus, Eye, Trash2, Calendar, Users } from "lucide-react";
import { toast } from "sonner";
import {
  usePromoCodes,
  useCreatePromoCode,
  useDeletePromoCode,
  usePromoCodeUsers,
} from "@/api/hooks/usePromoCodes";

export default function PromoCodesPage() {
  const { data: promoCodes = [], isLoading } = usePromoCodes();
  const createMutation = useCreatePromoCode();
  const deleteMutation = useDeletePromoCode();

  // Create promo code state
  const [code, setCode] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [durationDays, setDurationDays] = useState("");
  const [description, setDescription] = useState("");

  // View details state
  const [isViewSheetOpen, setIsViewSheetOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState("");
  const { data: codeUsers = [] } = usePromoCodeUsers(selectedCode);

  const handleCreate = async () => {
    if (!code || !expirationDate || !durationDays) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      await createMutation.mutateAsync({
        code,
        expirationDate,
        durationDays: parseInt(durationDays),
        description,
      });
      toast.success("Promo code created successfully!");
      setCode("");
      setExpirationDate("");
      setDurationDays("");
      setDescription("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create promo code");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promo code?")) return;

    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Promo code deleted successfully!");
    } catch (error: any) {
      toast.error("Failed to delete promo code");
    }
  };

  const handleViewDetails = (code: string) => {
    setSelectedCode(code);
    setIsViewSheetOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Promo Codes</h1>
        <p className="text-muted-foreground mt-2">
          Manage promotional codes for user subscriptions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create Promo Code
            </CardTitle>
            <CardDescription>Add a new promotional code</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code *</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="SUMMER2024"
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiration">Expiration Date *</Label>
              <Input
                id="expiration"
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (days) *</Label>
              <Input
                id="duration"
                type="number"
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                placeholder="30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Summer promotion..."
              />
            </div>
            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Promo Code
            </Button>
          </CardContent>
        </Card>

        {/* Promo Codes List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="w-5 h-5" />
              Promo Codes List
            </CardTitle>
            <CardDescription>View and manage all promo codes</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">Loading...</div>
            ) : promoCodes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No promo codes yet. Create your first one!
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Expiration</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promoCodes.map((promoCode) => (
                    <TableRow key={promoCode.id}>
                      <TableCell className="font-mono font-bold">
                        {promoCode.code}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4" />
                          {new Date(promoCode.expirationDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>{promoCode.durationDays} days</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {promoCode.usageCount}
                        </div>
                      </TableCell>
                      <TableCell>
                        {promoCode.isActive ? (
                          <Badge className="bg-green-500">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(promoCode.code)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(promoCode.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Details Sheet */}
      <Sheet open={isViewSheetOpen} onOpenChange={setIsViewSheetOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Ticket className="w-5 h-5" />
              Promo Code Details
            </SheetTitle>
            <SheetDescription>
              Users who used code: <span className="font-mono font-bold">{selectedCode}</span>
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {codeUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No users have used this code yet
              </div>
            ) : (
              <div className="space-y-2">
                {codeUsers.map((user) => (
                  <Card key={user.id}>
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{user.email}</p>
                          {user.isSubscribed && (
                            <Badge className="bg-green-500">Premium</Badge>
                          )}
                        </div>
                        {user.name && (
                          <p className="text-sm text-muted-foreground">{user.name}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Joined: {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                        {user.subscriptionEndDate && (
                          <p className="text-xs text-muted-foreground">
                            Premium until: {new Date(user.subscriptionEndDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
