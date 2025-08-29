"use client";

import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Separator } from "@workspace/ui/components/separator";
import { CheckCircleIcon, Loader2Icon } from "lucide-react";

export function AccountForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    name: "Adrien",
    email: "adrien@example.com",
    company: "GoofyTeam",
    companyId: "2",
    lastUpdated: "2025-08-21 17:43:01",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSaved(false);

    setTimeout(() => {
      setIsLoading(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1500);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {saved && (
        <div className="flex items-center gap-2 p-3 bg-khp-background-secondary border border-khp-primary rounded-lg">
          <CheckCircleIcon className="h-4 w-4 text-khp-primary" />
          <span className="text-khp-text-primary text-sm font-medium">
            Changes saved successfully
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <Label
            htmlFor="name"
            className="block text-sm font-medium text-khp-text-primary mb-2"
          >
            Full name
          </Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            disabled={isLoading}
            className="w-full !h-14 text-base border-khp-primary focus:bg-khp-primary/5 transition-all px-4 font-medium disabled:bg-khp-background-secondary disabled:text-khp-text-secondary"
            placeholder="Enter your full name"
          />
        </div>

        <div className="md:col-span-2">
          <Label
            htmlFor="email"
            className="block text-sm font-medium text-khp-text-primary mb-2"
          >
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            disabled={isLoading}
            className="w-full !h-14 text-base border-khp-primary focus:bg-khp-primary/5 transition-all px-4 font-medium disabled:bg-khp-background-secondary disabled:text-khp-text-secondary"
            placeholder="Enter your email address"
          />
        </div>

        <Separator className="md:col-span-2" />

        <div className="md:col-span-2 bg-khp-background-secondary rounded-lg p-6 space-y-4">
          <h3 className="text-base font-medium text-khp-text-primary mb-4">
            Company
          </h3>
          <p className="text-xl font-medium text-khp-text-primary">GoofyTeam</p>
        </div>

        <div className="md:col-span-2 bg-khp-primary/5 border border-khp-primary/20 rounded-lg p-4">
          <Label className="block text-sm font-medium text-khp-text-primary mb-2">
            Last updated
          </Label>
          <p className="text-base font-medium text-khp-text-primary">
            {formData.lastUpdated}
          </p>
        </div>
      </div>

      <div className="pt-6">
        <Button
          type="submit"
          disabled={isLoading}
          variant="khp-default"
          size="xl"
          className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Loader2Icon className="animate-spin -ml-1 mr-2 h-4 w-4" />
              Saving changes...
            </div>
          ) : (
            "Save changes"
          )}
        </Button>
      </div>
    </form>
  );
}
