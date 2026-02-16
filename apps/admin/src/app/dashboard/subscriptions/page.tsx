"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { getToken } from "@/lib/auth";
import { toast } from "sonner";
import { Settings, Save, Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Config {
  FREEMIUM_DURATION_DAYS: string;
  MONTHLY_PRICE: string;
  YEARLY_PRICE: string;
  YEARLY_DISCOUNT_PERCENTAGE: string;
  STRIPE_MONTHLY_PRICE_ID: string;
  STRIPE_YEARLY_PRICE_ID: string;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  type: "MONTHLY" | "YEARLY";
  price: number;
  discountPercentage: number;
  isActive: boolean;
  stripePriceId?: string;
}

export default function SubscriptionsPage() {
  const { t } = useLocale();
  const [config, setConfig] = useState<Config>({
    FREEMIUM_DURATION_DAYS: "30",
    MONTHLY_PRICE: "9.99",
    YEARLY_PRICE: "99.99",
    YEARLY_DISCOUNT_PERCENTAGE: "20",
    STRIPE_MONTHLY_PRICE_ID: "",
    STRIPE_YEARLY_PRICE_ID: "",
  });
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [planForm, setPlanForm] = useState({
    name: "",
    description: "",
    type: "MONTHLY" as "MONTHLY" | "YEARLY",
    price: 0,
    discountPercentage: 0,
    isActive: true,
    stripePriceId: "",
  });

  useEffect(() => {
    fetchConfig();
    fetchPlans();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch(`${API_URL}/subscriptions/config`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      }
    } catch (error) {
      console.error("Failed to fetch config:", error);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await fetch(`${API_URL}/subscriptions/plans`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (response.ok) {
        const data = await response.json();
        setPlans(data);
      }
    } catch (error) {
      console.error("Failed to fetch plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/subscriptions/config`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          freemiumDurationDays: parseInt(config.FREEMIUM_DURATION_DAYS),
          monthlyPrice: parseFloat(config.MONTHLY_PRICE),
          yearlyPrice: parseFloat(config.YEARLY_PRICE),
          yearlyDiscountPercentage: parseInt(config.YEARLY_DISCOUNT_PERCENTAGE),
          stripeMonthlyPriceId: config.STRIPE_MONTHLY_PRICE_ID,
          stripeYearlyPriceId: config.STRIPE_YEARLY_PRICE_ID,
        }),
      });
      if (response.ok) {
        toast.success(t.subscriptions?.configSaved || "Configuration saved!");
      } else {
        toast.error(t.subscriptions?.configSaveFailed || "Failed to save");
      }
    } catch (error) {
      toast.error(t.subscriptions?.configSaveFailed || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const openPlanDialog = (plan?: Plan) => {
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
      });
    } else {
      setEditingPlan(null);
      setPlanForm({
        name: "",
        description: "",
        type: "MONTHLY",
        price: 0,
        discountPercentage: 0,
        isActive: true,
        stripePriceId: "",
      });
    }
    setPlanDialogOpen(true);
  };

  const savePlan = async () => {
    try {
      const url = editingPlan
        ? `${API_URL}/subscriptions/plans/${editingPlan.id}`
        : `${API_URL}/subscriptions/plans`;
      const method = editingPlan ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(planForm),
      });

      if (response.ok) {
        toast.success(
          editingPlan
            ? t.subscriptions?.planUpdated || "Plan updated!"
            : t.subscriptions?.planCreated || "Plan created!",
        );
        setPlanDialogOpen(false);
        fetchPlans();
      }
    } catch (error) {
      toast.error("Failed to save plan");
    }
  };

  const deletePlan = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/subscriptions/plans/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (response.ok) {
        toast.success(t.subscriptions?.planDeleted || "Plan deleted!");
        fetchPlans();
      }
    } catch (error) {
      toast.error("Failed to delete plan");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Settings className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">
            {t.subscriptions?.title || "Subscription Settings"}
          </h1>
          <p className="text-muted-foreground">
            {t.subscriptions?.description || "Manage subscription plans"}
          </p>
        </div>
      </div>

      <Tabs defaultValue="config" className="space-y-4">
        <TabsList>
          <TabsTrigger value="config">
            {t.subscriptions?.config || "Configuration"}
          </TabsTrigger>
          <TabsTrigger value="plans">
            {t.subscriptions?.plans || "Plans"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>
                {t.subscriptions?.config || "Configuration"}
              </CardTitle>
              <CardDescription>
                Configure subscription settings and Stripe integration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    {t.subscriptions?.freemiumDuration || "Free trial (days)"}
                  </Label>
                  <Input
                    type="number"
                    value={config.FREEMIUM_DURATION_DAYS}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        FREEMIUM_DURATION_DAYS: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    {t.subscriptions?.yearlyDiscount || "Yearly discount (%)"}
                  </Label>
                  <Input
                    type="number"
                    value={config.YEARLY_DISCOUNT_PERCENTAGE}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        YEARLY_DISCOUNT_PERCENTAGE: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    {t.subscriptions?.monthlyPrice || "Monthly price (€)"}
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={config.MONTHLY_PRICE}
                    onChange={(e) =>
                      setConfig({ ...config, MONTHLY_PRICE: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    {t.subscriptions?.yearlyPrice || "Yearly price (€)"}
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={config.YEARLY_PRICE}
                    onChange={(e) =>
                      setConfig({ ...config, YEARLY_PRICE: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    {t.subscriptions?.stripeMonthlyPriceId ||
                      "Stripe Monthly Price ID"}
                  </Label>
                  <Input
                    value={config.STRIPE_MONTHLY_PRICE_ID}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        STRIPE_MONTHLY_PRICE_ID: e.target.value,
                      })
                    }
                    placeholder="price_..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    {t.subscriptions?.stripeYearlyPriceId ||
                      "Stripe Yearly Price ID"}
                  </Label>
                  <Input
                    value={config.STRIPE_YEARLY_PRICE_ID}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        STRIPE_YEARLY_PRICE_ID: e.target.value,
                      })
                    }
                    placeholder="price_..."
                  />
                </div>
              </div>
              <Button onClick={saveConfig} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {t.subscriptions?.saveConfig || "Save configuration"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t.subscriptions?.plans || "Plans"}</CardTitle>
                <CardDescription>Manage subscription plans</CardDescription>
              </div>
              <Button onClick={() => openPlanDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                {t.subscriptions?.addPlan || "Add Plan"}
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.subscriptions?.planName || "Name"}</TableHead>
                    <TableHead>{t.subscriptions?.planType || "Type"}</TableHead>
                    <TableHead>
                      {t.subscriptions?.planPrice || "Price"}
                    </TableHead>
                    <TableHead>
                      {t.subscriptions?.planDiscount || "Discount"}
                    </TableHead>
                    <TableHead>
                      {t.subscriptions?.planActive || "Active"}
                    </TableHead>
                    <TableHead>{t.common?.actions || "Actions"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium">{plan.name}</TableCell>
                      <TableCell>
                        {plan.type === "MONTHLY"
                          ? t.subscriptions?.monthly || "Monthly"
                          : t.subscriptions?.yearly || "Yearly"}
                      </TableCell>
                      <TableCell>€{plan.price.toFixed(2)}</TableCell>
                      <TableCell>{plan.discountPercentage}%</TableCell>
                      <TableCell>
                        {plan.isActive ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <X className="w-4 h-4 text-red-500" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openPlanDialog(plan)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deletePlan(plan.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPlan
                ? t.subscriptions?.editPlan || "Edit Plan"
                : t.subscriptions?.addPlan || "Add Plan"}
            </DialogTitle>
            <DialogDescription>
              Configure the subscription plan details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t.subscriptions?.planName || "Name"}</Label>
              <Input
                value={planForm.name}
                onChange={(e) =>
                  setPlanForm({ ...planForm, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t.subscriptions?.planDescription || "Description"}</Label>
              <Input
                value={planForm.description}
                onChange={(e) =>
                  setPlanForm({ ...planForm, description: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.subscriptions?.planType || "Type"}</Label>
                <Select
                  value={planForm.type}
                  onValueChange={(value: "MONTHLY" | "YEARLY") =>
                    setPlanForm({ ...planForm, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">
                      {t.subscriptions?.monthly || "Monthly"}
                    </SelectItem>
                    <SelectItem value="YEARLY">
                      {t.subscriptions?.yearly || "Yearly"}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t.subscriptions?.planPrice || "Price"}</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={planForm.price}
                  onChange={(e) =>
                    setPlanForm({
                      ...planForm,
                      price: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.subscriptions?.planDiscount || "Discount (%)"}</Label>
                <Input
                  type="number"
                  value={planForm.discountPercentage}
                  onChange={(e) =>
                    setPlanForm({
                      ...planForm,
                      discountPercentage: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Stripe Price ID</Label>
                <Input
                  value={planForm.stripePriceId}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, stripePriceId: e.target.value })
                  }
                  placeholder="price_..."
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={planForm.isActive}
                onCheckedChange={(checked) =>
                  setPlanForm({ ...planForm, isActive: checked })
                }
              />
              <Label>{t.subscriptions?.planActive || "Active"}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlanDialogOpen(false)}>
              {t.common?.cancel || "Cancel"}
            </Button>
            <Button onClick={savePlan}>{t.common?.save || "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
