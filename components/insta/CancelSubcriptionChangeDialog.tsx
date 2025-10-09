"use client";

import { PricingPlan } from "@/types/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

interface ConfirmSubscriptionChangeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentPlan: PricingPlan | null;
  newPlan: PricingPlan | null;
  isLoading?: boolean;
}

export function ConfirmSubscriptionChangeDialog({
  isOpen,
  onClose,
  onConfirm,
  currentPlan,
  newPlan,
  isLoading = false,
}: ConfirmSubscriptionChangeDialogProps) {
  const { theme } = useTheme();

  // Theme-based styles
  const dialogBg = theme === "dark" ? "bg-[#0a0a0a]/95" : "bg-white/95";
  const dialogBorder = theme === "dark" ? "border-white/10" : "border-gray-200";
  const textPrimary = theme === "dark" ? "text-white" : "text-gray-900";
  const textSecondary = theme === "dark" ? "text-gray-300" : "text-gray-600";
  const textMuted = theme === "dark" ? "text-gray-400" : "text-gray-500";
  const buttonOutlineBorder =
    theme === "dark" ? "border-white/20" : "border-gray-300";
  const buttonOutlineText =
    theme === "dark" ? "text-gray-300" : "text-gray-700";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`${dialogBg} backdrop-blur-lg border ${dialogBorder} rounded-xl`}
      >
        <DialogHeader>
          <DialogTitle className={textPrimary}>
            Confirm Subscription Change
          </DialogTitle>
          <DialogDescription className={`${textSecondary} font-montserrat`}>
            Are you sure you want to change your subscription from{" "}
            {currentPlan?.name} to {newPlan?.name}?
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className={`text-sm ${textSecondary} font-montserrat`}>
            Your current subscription will be cancelled immediately and you will
            be charged for the new plan.
          </p>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className={`${buttonOutlineBorder} ${buttonOutlineText}`}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-gradient-to-r from-[#00F0FF] to-[#B026FF] text-white"
          >
            {isLoading ? "Processing..." : "Confirm Change"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
