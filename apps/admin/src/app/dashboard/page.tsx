"use client";

import { useState } from "react";
import { apiClient } from "@/lib/auth";
import { seedDatabase } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string>("");

  const handleSeed = async () => {
    setIsSeeding(true);
    setSeedResult("");
    
    try {
      const result = await seedDatabase(apiClient);
      if (result.success) {
        setSeedResult("✅ Database seeded successfully! Check the Topics and Quotes pages.");
      } else {
        setSeedResult("❌ Failed to seed database. Check console for errors.");
      }
    } catch (error) {
      setSeedResult("❌ Error during seeding. Check console for details.");
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Welcome to Quotes Admin Panel</CardTitle>
            <CardDescription>
              Manage users, topics, and quotes from the sidebar navigation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Select a section from the sidebar to get started.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Database Seeding</CardTitle>
            <CardDescription>
              Populate the database with test data (users, topics, and quotes)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Click the button below to seed the database with sample data for testing.
              This will create users, topics, and quotes.
            </p>
            <Button onClick={handleSeed} disabled={isSeeding}>
              {isSeeding ? "Seeding..." : "Seed Database"}
            </Button>
            {seedResult && (
              <div className="mt-4 p-3 rounded-md bg-muted">
                <p className="text-sm">{seedResult}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
