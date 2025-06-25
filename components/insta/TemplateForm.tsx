"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface TemplateFormProps {
  accountId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function TemplateForm({
  accountId,
  onSuccess,
  onCancel,
}: TemplateFormProps) {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [triggerInput, setTriggerInput] = useState("");
  const [triggers, setTriggers] = useState<string[]>([]);
  const [priority, setPriority] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addTrigger = () => {
    if (
      triggerInput.trim() &&
      !triggers.includes(triggerInput.trim().toLowerCase())
    ) {
      setTriggers([...triggers, triggerInput.trim().toLowerCase()]);
      setTriggerInput("");
    }
  };

  const removeTrigger = (trigger: string) => {
    setTriggers(triggers.filter((t) => t !== trigger));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTrigger();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess?.();
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Template Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Welcome Message, Product Inquiry"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Reply Content</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your automated reply message..."
          className="min-h-[100px]"
          required
        />
        <p className="text-xs text-muted-foreground">
          {content.length}/500 characters
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="triggers">Trigger Keywords</Label>
        <div className="flex gap-2">
          <Input
            id="triggers"
            value={triggerInput}
            onChange={(e) => setTriggerInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add a keyword that triggers this reply"
          />
          <Button type="button" onClick={addTrigger} variant="outline">
            Add
          </Button>
        </div>

        {triggers.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {triggers.map((trigger, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {trigger}
                <button
                  type="button"
                  onClick={() => removeTrigger(trigger)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          When someone comments with these keywords, this template will be used
          for the reply
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="priority">Priority</Label>
        <Input
          id="priority"
          type="number"
          min="1"
          max="10"
          value={priority}
          onChange={(e) => setPriority(parseInt(e.target.value))}
        />
        <p className="text-xs text-muted-foreground">
          Higher priority templates (1-10) are checked first
        </p>
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? "Creating..." : "Create Template"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
