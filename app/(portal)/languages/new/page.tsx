"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Globe, Loader2 } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { Checkbox } from "@/components/ui/checkbox";
import { createLanguageAction } from "@/features/languages/action";
import type { CreateLanguagePayload } from "@/features/languages/types";

export default function NewLanguagePage() {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form key to force-clear any cached DOM input fields upon remount or reset
  const [formKey, setFormKey] = useState<number>(() => Date.now());

  const [language, setLanguage] = useState("");
  const [languageCode, setLanguageCode] = useState("");
  const [nativeName, setNativeName] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const resetForm = () => {
    setLanguage("");
    setLanguageCode("");
    setNativeName("");
    setIsDefault(false);
    setIsActive(true);
    setError(null);
    setFormKey(Date.now());
  };

  // Always reset fields when opening or unmounting the New Language page
  useEffect(() => {
    resetForm();
    return () => {
      resetForm();
    };
  }, []);

  const handleCancel = () => {
    resetForm();
    router.push("/languages");
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!language.trim()) {
      setError("Language name is required.");
      return;
    }

    const payload: CreateLanguagePayload = {
      language: language.trim(),
      languageCode: languageCode.trim() || null,
      nativeName: nativeName.trim() || null,
      isDefault,
      isActive,
    };

    startTransition(async () => {
      const res = await createLanguageAction(payload);
      if (res.success) {
        success("Language created successfully");
        resetForm();
        router.push("/languages");
      } else {
        const msg = res.error || "Failed to create language. Please try again.";
        setError(msg);
        toastError(msg);
      }
    });
  };

  return (
    <div className="w-full space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          className="gap-1.5 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Languages
        </Button>
      </div>

      <PageHeader
        title="Add New Language"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Languages", href: "/languages" },
          { label: "New Language" },
        ]}
      />

      <form key={formKey} onSubmit={handleSubmit} autoComplete="off" className="w-full space-y-6">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <Card className="w-full shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Language Details</CardTitle>
                <CardDescription>
                  Enter the language name, ISO code, and native name.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="language">
                  Language Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="language"
                  autoComplete="off"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  placeholder="e.g. English, Hindi, Bengali"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="languageCode">Language Code</Label>
                <Input
                  id="languageCode"
                  autoComplete="off"
                  value={languageCode}
                  onChange={(e) => setLanguageCode(e.target.value)}
                  placeholder="e.g. en, hi, bn"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="nativeName">Native Name</Label>
                <Input
                  id="nativeName"
                  autoComplete="off"
                  value={nativeName}
                  onChange={(e) => setNativeName(e.target.value)}
                  placeholder="e.g. English, हिन्दी, বাংলা"
                />
              </div>
            </div>

            <div className="pt-2 space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isDefault"
                  checked={isDefault}
                  onCheckedChange={(checked) => setIsDefault(Boolean(checked))}
                />
                <Label htmlFor="isDefault" className="text-sm font-medium text-slate-700 cursor-pointer">
                  Set as Default Language
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={(checked) => setIsActive(Boolean(checked))}
                />
                <Label htmlFor="isActive" className="text-sm font-medium text-slate-700 cursor-pointer">
                  Active
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={handleCancel}
          >
            Cancel
          </Button>

          <Button type="submit" disabled={isPending} className="bg-blue-600 text-white hover:bg-blue-700">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Language
          </Button>
        </div>
      </form>
    </div>
  );
}

