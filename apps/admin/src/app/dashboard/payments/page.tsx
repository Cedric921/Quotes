"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { apiClient } from "@/lib/auth";
import {
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Payment {
  id: string;
  userId: string;
  user?: { email: string };
  subscriptionId?: string;
  subscription?: {
    plan?: { name: string; type: string };
  };
  amount: number;
  currency: string;
  status: "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED";
  stripePaymentIntentId?: string;
  paidAt?: string;
  createdAt: string;
}

export default function PaymentsPage() {
  const { t } = useLocale();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => {
    fetchPayments();
  }, [page]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/subscriptions/payments`, {
        params: { page, limit },
      });
      setPayments(response.data.payments);
      setTotal(response.data.total);
    } catch (error) {
      console.error("Failed to fetch payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Payment["status"]) => {
    switch (status) {
      case "SUCCEEDED":
        return (
          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            {t.subscriptions?.succeeded || "Succeeded"}
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            <Clock className="w-3 h-3 mr-1" />
            {t.subscriptions?.pending || "Pending"}
          </Badge>
        );
      case "FAILED":
        return (
          <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
            <XCircle className="w-3 h-3 mr-1" />
            {t.subscriptions?.failed || "Failed"}
          </Badge>
        );
      case "REFUNDED":
        return (
          <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
            <RefreshCw className="w-3 h-3 mr-1" />
            {t.subscriptions?.refunded || "Refunded"}
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <CreditCard className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">
            {t.subscriptions?.paymentsTitle || "Payment History"}
          </h1>
          <p className="text-muted-foreground">
            {t.subscriptions?.paymentsDescription || "View all user payments"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.subscriptions?.payments || "Payments"}</CardTitle>
          <CardDescription>
            {total} {t.subscriptions?.payments?.toLowerCase() || "payments"}{" "}
            total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              {t.common?.loading || "Loading..."}
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t.subscriptions?.noPayments || "No payments yet"}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      {t.subscriptions?.paymentUser || "User"}
                    </TableHead>
                    <TableHead>
                      {t.subscriptions?.paymentPlan || "Plan"}
                    </TableHead>
                    <TableHead>
                      {t.subscriptions?.paymentAmount || "Amount"}
                    </TableHead>
                    <TableHead>
                      {t.subscriptions?.paymentStatus || "Status"}
                    </TableHead>
                    <TableHead>
                      {t.subscriptions?.paymentDate || "Date"}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.user?.email || payment.userId}
                      </TableCell>
                      <TableCell>
                        {payment.subscription?.plan?.name || "-"}
                      </TableCell>
                      <TableCell>
                        €{payment.amount.toFixed(2)} {payment.currency}
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell>
                        {formatDate(payment.paidAt || payment.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-3 text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
