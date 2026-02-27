"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { apiClient } from "@/lib/auth";
import { toast } from "sonner";
import {
  CreditCard,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface Plan {
  id: string;
  name: string;
  description: string;
  type: "MONTHLY" | "YEARLY";
  price: number;
  discountPercentage: number;
  isActive: boolean;
  stripePriceId?: string;
  durationMonths: number;
}

export default function SubscriptionsPage() {
  const { t } = useLocale();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [planForm, setPlanForm] = useState({
    name: "",
    description: "",
    type: "MONTHLY" as "MONTHLY" | "YEARLY",
    price: 0,
    discountPercentage: 0,
    isActive: true,
    stripePriceId: "",
    durationMonths: 1,
  });

  const fetchPlans = useCallback(async () => {
    try {
      const response = await apiClient.get("/subscriptions/plans");
      setPlans(response.data);
    } catch (error) {
      console.error("Failed to fetch plans:", error);
      toast.error(t.subscriptions?.loadError || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }, [t.subscriptions?.loadError]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const resetForm = () => {
    setPlanForm({
      name: "",
      description: "",
      type: "MONTHLY",
      price: 0,
      discountPercentage: 0,
      isActive: true,
      stripePriceId: "",
      durationMonths: 1,
    });
    setEditingPlan(null);
  };

  const openPlanSheet = (plan?: Plan) => {
    if (plan) {
      setEditingPlan(plan);
      setPlanForm({
        name: plan.name,
        description: plan.description,
        type: plan.type,
        price: plan.price,
        discountPercentage: plan.discountPercentage,
        isActive: plan.isActive,
        stripePriceId: plan.stripePriceId || "",
        durationMonths:
          plan.durationMonths || (plan.type === "YEARLY" ? 12 : 1),
      });
    } else {
      resetForm();
    }
    setIsSheetOpen(true);
  };

  const savePlan = async () => {
    if (!planForm.name || !planForm.stripePriceId) {
      toast.error(
        t.subscriptions?.requiredFields || "Nom et Stripe Price ID requis",
      );
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading(
      editingPlan
        ? t.subscriptions?.updating || "Mise à jour..."
        : t.subscriptions?.creating || "Création...",
    );

    try {
      if (editingPlan) {
        await apiClient.put(`/subscriptions/plans/${editingPlan.id}`, planForm);
        toast.success(t.subscriptions?.planUpdated || "Plan mis à jour !", {
          id: toastId,
        });
      } else {
        await apiClient.post("/subscriptions/plans", planForm);
        toast.success(t.subscriptions?.planCreated || "Plan créé !", {
          id: toastId,
        });
      }
      setIsSheetOpen(false);
      resetForm();
      fetchPlans();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Erreur", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const deletePlan = async () => {
    if (!planToDelete) return;

    const toastId = toast.loading(
      t.subscriptions?.deleting || "Suppression...",
    );
    try {
      await apiClient.delete(`/subscriptions/plans/${planToDelete}`);
      toast.success(t.subscriptions?.planDeleted || "Plan supprimé !", {
        id: toastId,
      });
      fetchPlans();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Erreur", { id: toastId });
    } finally {
      setDeleteDialogOpen(false);
      setPlanToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              {t.subscriptions?.title || "Plans d'abonnement"}
            </h1>
            <p className="text-muted-foreground">
              {t.subscriptions?.description ||
                "Gérer les plans disponibles pour les utilisateurs"}
            </p>
          </div>
        </div>
        <Button onClick={() => openPlanSheet()} className="gap-2">
          <Plus className="w-4 h-4" />
          {t.subscriptions?.addPlan || "Nouveau plan"}
        </Button>
      </div>

      {/* Plans Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t.subscriptions?.plans || "Plans"}</CardTitle>
          <CardDescription>
            {t.subscriptions?.plansDescription ||
              "Ces plans seront affichés aux utilisateurs sur l'application mobile"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {plans.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {t.subscriptions?.noPlans || "Aucun plan"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {t.subscriptions?.startAddingPlans ||
                  "Commencez par créer votre premier plan d'abonnement"}
              </p>
              <Button onClick={() => openPlanSheet()}>
                <Plus className="w-4 h-4 mr-2" />
                {t.subscriptions?.addPlan || "Nouveau plan"}
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.subscriptions?.planName || "Nom"}</TableHead>
                  <TableHead>{t.subscriptions?.planType || "Type"}</TableHead>
                  <TableHead>{t.subscriptions?.planPrice || "Prix"}</TableHead>
                  <TableHead>
                    {t.subscriptions?.planDiscount || "Réduction"}
                  </TableHead>
                  <TableHead>Stripe Price ID</TableHead>
                  <TableHead>
                    {t.subscriptions?.planActive || "Statut"}
                  </TableHead>
                  <TableHead className="text-right">
                    {t.common?.actions || "Actions"}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{plan.name}</p>
                        {plan.description && (
                          <p className="text-sm text-muted-foreground">
                            {plan.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {plan.type === "MONTHLY"
                          ? t.subscriptions?.monthly || "Mensuel"
                          : t.subscriptions?.yearly || "Annuel"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      €{plan.price.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {plan.discountPercentage > 0 ? (
                        <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                          -{plan.discountPercentage}%
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {plan.stripePriceId || "-"}
                      </code>
                    </TableCell>
                    <TableCell>
                      {plan.isActive ? (
                        <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                          <Check className="w-3 h-3 mr-1" />
                          {t.subscriptions?.active || "Actif"}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <X className="w-3 h-3 mr-1" />
                          {t.subscriptions?.inactive || "Inactif"}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openPlanSheet(plan)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setPlanToDelete(plan.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
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

      {/* Sheet for create/edit plan */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingPlan
                ? t.subscriptions?.editPlan || "Modifier le plan"
                : t.subscriptions?.addPlan || "Nouveau plan"}
            </SheetTitle>
            <SheetDescription>
              {editingPlan
                ? t.subscriptions?.editPlanDescription ||
                  "Modifiez les informations du plan"
                : t.subscriptions?.addPlanDescription ||
                  "Créez un nouveau plan d'abonnement"}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            <div className="space-y-2">
              <Label htmlFor="name">
                {t.subscriptions?.planName || "Nom"} *
              </Label>
              <Input
                id="name"
                value={planForm.name}
                onChange={(e) =>
                  setPlanForm({ ...planForm, name: e.target.value })
                }
                placeholder="Ex: Plan Premium Mensuel"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                {t.subscriptions?.planDescription || "Description"}
              </Label>
              <Textarea
                id="description"
                value={planForm.description}
                onChange={(e) =>
                  setPlanForm({ ...planForm, description: e.target.value })
                }
                placeholder="Description du plan..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.subscriptions?.planType || "Type"}</Label>
                <Select
                  value={planForm.type}
                  onValueChange={(value: "MONTHLY" | "YEARLY") =>
                    setPlanForm({
                      ...planForm,
                      type: value,
                      durationMonths: value === "YEARLY" ? 12 : 1,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">
                      {t.subscriptions?.monthly || "Mensuel"}
                    </SelectItem>
                    <SelectItem value="YEARLY">
                      {t.subscriptions?.yearly || "Annuel"}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">
                  {t.subscriptions?.planPrice || "Prix (€)"} *
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={planForm.price}
                  onChange={(e) =>
                    setPlanForm({
                      ...planForm,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discount">
                  {t.subscriptions?.planDiscount || "Réduction (%)"}
                </Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  value={planForm.discountPercentage}
                  onChange={(e) =>
                    setPlanForm({
                      ...planForm,
                      discountPercentage: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">
                  {t.subscriptions?.durationMonths || "Durée (mois)"}
                </Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={planForm.durationMonths}
                  onChange={(e) =>
                    setPlanForm({
                      ...planForm,
                      durationMonths: parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stripePriceId">Stripe Price ID *</Label>
              <Input
                id="stripePriceId"
                value={planForm.stripePriceId}
                onChange={(e) =>
                  setPlanForm({ ...planForm, stripePriceId: e.target.value })
                }
                placeholder="price_1234567890..."
              />
              <p className="text-xs text-muted-foreground">
                {t.subscriptions?.stripePriceIdHint ||
                  "Récupérez ce ID depuis votre Dashboard Stripe > Products > Price ID"}
              </p>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <Label htmlFor="isActive">
                  {t.subscriptions?.planActive || "Actif"}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t.subscriptions?.activeHint ||
                    "Les plans actifs sont visibles sur l'app mobile"}
                </p>
              </div>
              <Switch
                id="isActive"
                checked={planForm.isActive}
                onCheckedChange={(checked) =>
                  setPlanForm({ ...planForm, isActive: checked })
                }
              />
            </div>

            <Button
              onClick={savePlan}
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editingPlan
                ? t.subscriptions?.updatePlan || "Mettre à jour"
                : t.subscriptions?.createPlan || "Créer le plan"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {t.subscriptions?.deletePlanTitle || "Supprimer le plan ?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t.subscriptions?.deletePlanDescription ||
                "Cette action est irréversible. Les utilisateurs ne pourront plus souscrire à ce plan."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t.common?.cancel || "Annuler"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={deletePlan}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t.common?.delete || "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
