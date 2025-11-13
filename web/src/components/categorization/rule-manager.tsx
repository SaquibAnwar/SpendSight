"use client";

import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import type { CategoryRule } from "@/types/models";
import type { CreateRuleInput } from "@/hooks/use-category-rules";

const MATCH_TYPES: CreateRuleInput["matchType"][] = [
  "contains",
  "startsWith",
  "regex",
];

interface RuleManagerProps {
  rules: CategoryRule[];
  onAddRule: (input: CreateRuleInput) => Promise<void>;
  onRemoveRule: (id: string) => Promise<void>;
  onClearRules: () => Promise<void>;
  suggestedRule?: CreateRuleInput | null;
}

export function RuleManager({
  rules,
  onAddRule,
  onRemoveRule,
  onClearRules,
  suggestedRule,
}: RuleManagerProps) {
  const [formState, setFormState] = useState<CreateRuleInput>({
    keyword: "",
    category: "",
    subcategory: "",
    matchType: "contains",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (suggestedRule) {
      setFormState({
        keyword: suggestedRule.keyword ?? "",
        category: suggestedRule.category ?? "",
        subcategory: suggestedRule.subcategory ?? "",
        matchType: suggestedRule.matchType ?? "contains",
      });
    }
  }, [suggestedRule]);

  const isValid = useMemo(
    () => Boolean(formState.keyword && formState.category),
    [formState.keyword, formState.category]
  );

  const handleSubmit = async () => {
    if (!isValid) {
      setError("Keyword and category are required.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await onAddRule(formState);
      setFormState({
        keyword: "",
        category: "",
        subcategory: "",
        matchType: formState.matchType,
      });
    } catch (err) {
      console.error("Failed to add rule", err);
      setError("Unable to save rule. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="h-full w-full">
      <CardHeader>
        <CardTitle>Category rules</CardTitle>
        <CardDescription>
          Keywords map merchants or descriptions to categories. Rules run before
          manual review.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3">
          <label className="text-sm font-medium">Keyword</label>
          <Textarea
            placeholder="e.g. uber, netflix"
            value={formState.keyword}
            onChange={(event) =>
              setFormState((prev) => ({
                ...prev,
                keyword: event.target.value,
              }))
            }
            rows={2}
          />
          <label className="text-sm font-medium">Category</label>
          <Input
            placeholder="Transport"
            value={formState.category}
            onChange={(event) =>
              setFormState((prev) => ({
                ...prev,
                category: event.target.value,
              }))
            }
          />
          <label className="text-sm font-medium">Subcategory (optional)</label>
          <Input
            placeholder="Ride hailing"
            value={formState.subcategory ?? ""}
            onChange={(event) =>
              setFormState((prev) => ({
                ...prev,
                subcategory: event.target.value,
              }))
            }
          />
          <label className="text-sm font-medium">Match type</label>
          <select
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={formState.matchType}
            onChange={(event) =>
              setFormState((prev) => ({
                ...prev,
                matchType: event.target.value as CreateRuleInput["matchType"],
              }))
            }
          >
            {MATCH_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <Button onClick={handleSubmit} disabled={!isValid || isSaving}>
            {isSaving ? "Saving..." : "Save rule"}
          </Button>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Active rules ({rules.length})
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (
                  rules.length > 0 &&
                  window.confirm("Remove all saved rules?")
                ) {
                  void onClearRules();
                }
              }}
            >
              Clear all
            </Button>
          </div>
          <div className="max-h-72 overflow-auto rounded-md border">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Keyword</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Match</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-6 text-center text-sm text-muted-foreground"
                    >
                      No rules saved yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  rules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>
                        <span className="text-sm">{rule.keyword}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium">
                            {rule.category}
                          </span>
                          {rule.subcategory && (
                            <span className="text-xs text-muted-foreground">
                              {rule.subcategory}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{rule.matchType}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void onRemoveRule(rule.id)}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


