"use client";

import { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
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
  Users,
  Calendar,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  useSubscriptionPlans,
  useSubscriptions,
  useCreateSubscriptionPlan,
  useUpdateSubscriptionPlan,
  useDeleteSubscriptionPlan,
} from "@/api/hooks";
import { SubscriptionPlan } from "@/services/api";

export default function SubscriptionsPage() {
  const { t } = useLocale();

  // React Query hooks
  const { data: plans = [], isLoading: plansLoading } = useSubscriptionPlans();
  const { data: subscriptions = [], isLoading: subscriptionsLoading } =
    useSubscriptions();
  const createPlanMutation = useCreateSubscriptionPlan();
  const updatePlanMutation = useUpdateSubscriptionPlan();
  const deletePlanMutation = useDeleteSubscriptionPlan();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);
  const [planForm, setPlanForm] = useState({
    name: "",
    description: "",
    price: 0,
    durationMonths: 1,
    isActive: true,
  });

  const isLoading = plansLoading || subscriptionsLoading;

  const resetForm = () => {
    setPlanForm({
      name: "",
      description: "",
      price: 0,
      durationMonths: 1,
      isActive: true,
    });
    setEditingPlan(null);
  };

  const openPlanSheet = (plan?: SubscriptionPlan) => {
    if (plan) {
      setEditingPlan(plan);
      setPlanForm({
        name: plan.name,
        description: plan.description || "",
        price: plan.price,
        durationMonths: plan.durationMonths || 1,
        isActive: plan.isActive,
      });
    } else {
      resetForm();
    }
    setIsSheetOpen(true);
  };

  const savePlan = async () => {
    if (!planForm.name || planForm.price <= 0) {
      toast.error(t.subscriptions?.requiredFields || "Nom et prix requis");
      return;
    }

    const toastId = toast.loading(
      editingPlan
        ? t.subscriptions?.updating || "Mise à jour..."
        : t.subscriptions?.creating || "Création...",
    );

    try {
      if (editingPlan) {
        await updatePlanMutation.mutateAsync({
          id: editingPlan.id,
          data: planForm,
        });
        toast.success(t.subscriptions?.planUpdated || "Plan mis à jour !", {
          id: toastId,
        });
      } else {
        await createPlanMutation.mutateAsync(planForm);
        toast.success(t.subscriptions?.planCreated || "Plan créé !", {
          id: toastId,
        });
      }
      setIsSheetOpen(false);
      resetForm();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Erreur", { id: toastId });
    }
  };

  const deletePlan = async () => {
    if (!planToDelete) return;

    const toastId = toast.loading(
      t.subscriptions?.deleting || "Suppression...",
    );
    try {
      await deletePlanMutation.mutateAsync(planToDelete);
      toast.success(t.subscriptions?.planDeleted || "Plan supprimé !", {
        id: toastId,
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Erreur", { id: toastId });
    } finally {
      setDeleteDialogOpen(false);
      setPlanToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
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
              {t.subscriptions?.title || "Abonnements"}
            </h1>
            <p className="text-muted-foreground">
              {t.subscriptions?.description ||
                "Gérer les plans et voir les abonnements"}
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="plans" className="space-y-4">
        <TabsList>
          <TabsTrigger value="plans" className="gap-2">
            <CreditCard className="w-4 h-4" />
            Plans
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="gap-2">
            <Users className="w-4 h-4" />
            Abonnements ({subscriptions.length})
          </TabsTrigger>
        </TabsList>

        {/* Plans Tab */}
        <TabsContent value="plans">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t.subscriptions?.plans || "Plans"}</CardTitle>
                <CardDescription>
                  {t.subscriptions?.plansDescription ||
                    "Plans displayed to users on the mobile app"}
                </CardDescription>
              </div>
              <Button onClick={() => openPlanSheet()} className="gap-2">
                <Plus className="w-4 h-4" />
                Nouveau plan
              </Button>
            </CardHeader>
            <CardContent>
              {plans.length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucun plan</h3>
                  <p className="text-muted-foreground mb-4">
                    {t.subscriptions?.createFirstPlan ||
                      "Start by creating your first subscription plan"}
                  </p>
                  <Button onClick={() => openPlanSheet()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nouveau plan
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Prix</TableHead>
                      <TableHead>Durée</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
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
                        <TableCell className="font-semibold">
                          €{Number(plan.price).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {plan.durationMonths} mois
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {plan.isActive ? (
                            <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                              <Check className="w-3 h-3 mr-1" />
                              Actif
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <X className="w-3 h-3 mr-1" />
                              Inactif
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
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions">
          <Card>
            <CardHeader>
              <CardTitle>Abonnements actifs</CardTitle>
              <CardDescription>
                Liste des utilisateurs abonnés et leurs plans
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subscriptions.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Aucun abonnement
                  </h3>
                  <p className="text-muted-foreground">
                    Les abonnements apparaîtront ici après les premiers
                    paiements
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Période</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell>
                          <span className="font-medium">
                            {sub.user?.email || sub.userId}
                          </span>
                        </TableCell>
                        <TableCell>{sub.plan?.name || "-"}</TableCell>
                        <TableCell className="font-semibold">
                          €{Number(sub.amountPaid).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {sub.status === "ACTIVE" ? (
                            <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                              <Check className="w-3 h-3 mr-1" />
                              Actif
                            </Badge>
                          ) : sub.status === "EXPIRED" ? (
                            <Badge variant="secondary">Expiré</Badge>
                          ) : (
                            <Badge variant="destructive">Annulé</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {formatDate(sub.startDate)} -{" "}
                            {formatDate(sub.endDate)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Sheet for create/edit plan */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingPlan ? "Modifier le plan" : "Nouveau plan"}
            </SheetTitle>
            <SheetDescription>
              {editingPlan
                ? "Modifiez les informations du plan"
                : "Créez un nouveau plan d'abonnement"}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nom *</Label>
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
              <Label htmlFor="description">Description</Label>
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
                <Label htmlFor="price">Prix (€) *</Label>
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

              <div className="space-y-2">
                <Label htmlFor="duration">Durée (mois)</Label>
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

            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <Label htmlFor="isActive">Actif</Label>
                <p className="text-sm text-muted-foreground">
                  Les plans actifs sont visibles sur l&apos;app mobile
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
              disabled={
                createPlanMutation.isPending || updatePlanMutation.isPending
              }
            >
              {(createPlanMutation.isPending ||
                updatePlanMutation.isPending) && (
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
