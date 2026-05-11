"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { UserDetailSkeleton } from "@/components/skeletons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  User as UserIcon,
  Mail,
  Shield,
  ShieldCheck,
  DollarSign,
  CreditCard,
  Clock,
  ArrowLeft,
  Edit,
  CheckCircle,
  XCircle,
  Receipt,
} from "lucide-react";
import { toast } from "sonner";
import {
  useUser,
  useUserActiveSubscription,
  useUserPayments,
  useUpdateUser,
  useVerifyPassword,
} from "@/api/hooks";

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  // React Query hooks
  const { data: user, isLoading, error: userError } = useUser(userId);
  const { data: activeSubscription } = useUserActiveSubscription(userId);
  const { data: payments = [] } = useUserPayments(userId);
  const updateUserMutation = useUpdateUser();
  const verifyPasswordMutation = useVerifyPassword();

  // Edit user states
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editIsAdmin, setEditIsAdmin] = useState(false);
  const [hasInitializedForm, setHasInitializedForm] = useState(false);

  // Password confirmation dialog
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Calculate total spent
  const totalSpent = payments
    .filter((p) => p.status === "SUCCEEDED")
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  // Initialize edit form when user data loads (only once)
  if (user && !hasInitializedForm) {
    setEditName(user.name || "");
    setEditIsAdmin(user.isAdmin);
    setHasInitializedForm(true);
  }

  const error = userError
    ? userError instanceof Error
      ? userError.message
      : "Failed to fetch user"
    : "";

  const handleEditClick = () => {
    // Reset form to current user values when opening
    if (user) {
      setEditName(user.name || "");
      setEditIsAdmin(user.isAdmin);
    }
    setIsEditSheetOpen(true);
  };

  const handleSaveClick = () => {
    // Close the edit sheet and open password confirmation dialog
    setIsEditSheetOpen(false);
    setIsPasswordDialogOpen(true);
    setPasswordError("");
    setConfirmPassword("");
  };

  const handleConfirmEdit = async () => {
    if (!confirmPassword) {
      setPasswordError("Password is required");
      return;
    }

    const toastId = toast.loading("Updating user...");

    try {
      // First verify the admin password
      await verifyPasswordMutation.mutateAsync(confirmPassword);

      // Then update the user
      await updateUserMutation.mutateAsync({
        id: userId,
        data: {
          name: editName,
          isAdmin: editIsAdmin,
        },
      });

      toast.success("User updated successfully!", { id: toastId });
      setIsPasswordDialogOpen(false);
      setConfirmPassword("");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update user";
      setPasswordError(errorMessage);
      toast.error(errorMessage, { id: toastId });
    }
  };

  if (isLoading) {
    return <UserDetailSkeleton />;
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-3">
          <XCircle className="w-16 h-16 text-destructive mx-auto" />
          <p className="text-destructive text-lg font-semibold">
            {error || "User not found"}
          </p>
          <Button onClick={() => router.push("/dashboard/users")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Users
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/dashboard/users")}
            className="border-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              User Details
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              View and manage user information
            </p>
          </div>
        </div>
        <Button
          onClick={handleEditClick}
          className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit User
        </Button>
      </div>

      {/* User Identity Card */}
      <Card className="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-card to-muted/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full" />
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
              <UserIcon className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl">
                {user.name || "Unnamed User"}
              </CardTitle>
              <CardDescription className="text-base mt-1">
                User Information & Profile
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-card border">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-card border">
              {user.isAdmin ? (
                <ShieldCheck className="w-5 h-5 text-amber-500" />
              ) : (
                <Shield className="w-5 h-5 text-muted-foreground" />
              )}
              <div>
                <p className="text-xs text-muted-foreground">Role</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium">
                    {user.isAdmin ? "Administrator" : "User"}
                  </p>
                  {user.isAdmin && (
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-xs">
                      Admin
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Overview - Only show if user is subscribed */}
      {user.isSubscribed && (
        <>
          {/* Financial Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Total Spent Card */}
            <Card className="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-green-500/10 to-emerald-500/10 relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-500 opacity-10 rounded-full blur-2xl" />
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-sm font-medium">
                    Total Dépensé
                  </CardDescription>
                  <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="text-3xl font-bold">
                    €{Number(totalSpent || 0).toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Depuis le début
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Current Subscription Card */}
            <Card className="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-500/10 to-pink-500/10 relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 opacity-10 rounded-full blur-2xl" />
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-sm font-medium">
                    Souscription Actuelle
                  </CardDescription>
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Statut
                    </span>
                    <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Début</span>
                    <span className="text-sm font-medium">
                      {activeSubscription?.startDate
                        ? new Date(
                            activeSubscription.startDate,
                          ).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Fin</span>
                    <span className="text-sm font-medium">
                      {activeSubscription?.endDate
                        ? new Date(
                            activeSubscription.endDate,
                          ).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-xs text-muted-foreground">Plan</span>
                    <span className="text-lg font-bold">
                      {activeSubscription?.plan?.name || "N/A"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment History */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500">
                    <Receipt className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      Historique des Paiements
                    </CardTitle>
                    <CardDescription>
                      Liste de toutes les transactions
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun paiement trouvé
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plan</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">
                          {payment.subscription?.plan?.name || "N/A"}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(
                              payment.paidAt || payment.createdAt,
                            ).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          €{(Number(payment?.amount) || 0).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              payment.status === "SUCCEEDED"
                                ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
                                : payment.status === "PENDING"
                                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                                  : payment.status === "REFUNDED"
                                    ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
                                    : "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
                            }
                          >
                            {payment.status === "SUCCEEDED"
                              ? "Réussi"
                              : payment.status === "PENDING"
                                ? "En cours"
                                : payment.status === "REFUNDED"
                                  ? "Remboursé"
                                  : "Échoué"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Edit User Sheet */}
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto bg-gradient-to-br from-background to-muted/20">
          <SheetHeader className="space-y-3 pb-6 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-gradient-to-br from-primary to-primary/60 shadow-lg">
                <Edit className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <SheetTitle className="text-2xl">Edit User</SheetTitle>
                <SheetDescription className="text-base">
                  Modify user information and role
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="space-y-6 py-6">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-sm font-medium">
                Name
              </Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter user name"
                className="border-2 focus:border-primary"
              />
            </div>

            {/* Email Field (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="edit-email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="edit-email"
                value={user.email}
                disabled
                className="border-2 bg-muted cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            {/* Role Toggle */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Role</Label>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant={!editIsAdmin ? "default" : "outline"}
                  className={
                    !editIsAdmin
                      ? "flex-1 border-2"
                      : "flex-1 border-2 hover:border-primary"
                  }
                  onClick={() => setEditIsAdmin(false)}
                >
                  <UserIcon className="w-4 h-4 mr-2" />
                  User
                </Button>
                <Button
                  type="button"
                  variant={editIsAdmin ? "default" : "outline"}
                  className={
                    editIsAdmin
                      ? "flex-1 border-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                      : "flex-1 border-2 hover:border-primary"
                  }
                  onClick={() => setEditIsAdmin(true)}
                >
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              </div>
            </div>

            {/* Warning Message */}
            <div className="p-4 rounded-lg bg-amber-500/10 border-2 border-amber-500/20">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-amber-500 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                    Password Confirmation Required
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-500">
                    You will be asked to confirm your admin password before
                    saving changes.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => setIsEditSheetOpen(false)}
              className="flex-1 border-2"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveClick}
              className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Password Confirmation Dialog */}
      <AlertDialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
      >
        <AlertDialogContent className="border-2 border-primary/20">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-amber-500" />
              </div>
              <AlertDialogTitle className="text-xl">
                Confirm Changes
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base space-y-4">
              <p>
                Please enter your admin password to confirm the changes to this
                user account.
              </p>
              <div className="space-y-2">
                <Label
                  htmlFor="confirm-password"
                  className="text-sm font-medium text-foreground"
                >
                  Admin Password
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setPasswordError("");
                  }}
                  placeholder="Enter your password"
                  className="border-2 focus:border-primary"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleConfirmEdit();
                    }
                  }}
                />
                {passwordError && (
                  <p className="text-sm text-destructive">{passwordError}</p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-2">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmEdit}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
