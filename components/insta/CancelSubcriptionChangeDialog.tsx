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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0a0a0a]/90 backdrop-blur-lg border border-[#333] rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-white">
            Confirm Subscription Change
          </DialogTitle>
          <DialogDescription className="text-gray-400 font-montserrat">
            Are you sure you want to change your subscription from{" "}
            {currentPlan?.name} to {newPlan?.name}?
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-300 font-montserrat">
            Your current subscription will be cancelled immediately and you will
            be charged for the new plan.
          </p>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="border-gray-600 text-white"
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
