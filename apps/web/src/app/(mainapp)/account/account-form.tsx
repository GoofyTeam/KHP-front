"use client";

import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Loader2Icon, SaveIcon } from "lucide-react";

export function AccountForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "John Doe",
    email: "john@example.com",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          placeholder="Your name"
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          placeholder="your@email.com"
          disabled={isLoading}
        />
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-4">
          <h3 className="text-sm font-medium mb-2">Security</h3>
          <p className="text-sm text-muted-foreground mb-3">
            To change your password, contact the administrator.
          </p>
          <Button type="button" variant="outline" size="sm" disabled>
            Change Password
          </Button>
        </CardContent>
      </Card>

      <div className="flex gap-2 pt-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <Loader2Icon className="h-4 w-4 animate-spin" />
          ) : (
            <SaveIcon className="h-4 w-4" />
          )}
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>

        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          onClick={() =>
            setFormData({ name: "John Doe", email: "john@example.com" })
          }
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
