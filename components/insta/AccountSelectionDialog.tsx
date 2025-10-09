"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

import { PricingPlan } from "@/types/types";

interface AccountSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedAccountIds: string[]) => void;
  accounts: any[];
  newPlan: PricingPlan | null;
  isLoading?: boolean;
}

export function AccountSelectionDialog({
  isOpen,
  onClose,
  onConfirm,
  accounts,
  newPlan,
  isLoading = false,
}: AccountSelectionDialogProps) {
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
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

  const getAccountLimit = (plan: PricingPlan | null) => {
    if (!plan) return 1;
    switch (plan.id) {
      case "Insta-Automation-Free":
        return 1;
      case "Insta-Automation-Starter":
        return 1;
      case "Insta-Automation-Growth":
        return 3;
      case "Insta-Automation-Professional":
        return 5;
      default:
        return 1;
    }
  };

  const accountLimit = getAccountLimit(newPlan);
  const accountsToDelete = Math.max(0, accounts.length - accountLimit);

  const handleAccountSelection = (username: string, checked: boolean) => {
    if (checked) {
      setSelectedAccounts([...selectedAccounts, username]);
    } else {
      setSelectedAccounts(selectedAccounts.filter((id) => id !== username));
    }
  };

  const handleConfirm = () => {
    if (selectedAccounts.length >= accountsToDelete) {
      onConfirm(selectedAccounts);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`${dialogBg} backdrop-blur-lg border ${dialogBorder} rounded-xl max-w-md`}
      >
        <DialogHeader>
          <DialogTitle className={textPrimary}>
            Account Limit Exceeded
          </DialogTitle>
          <DialogDescription className={`${textSecondary} font-montserrat`}>
            The {newPlan?.name} plan allows only {accountLimit} Instagram
            account(s). Please select {accountsToDelete} account(s) to delete.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 max-h-60 overflow-y-auto">
          <div className="space-y-3">
            {accounts.map((account) => (
              <div
                key={account.username}
                className="flex items-center space-x-2"
              >
                <Checkbox
                  id={account.username}
                  checked={selectedAccounts.includes(account.username)}
                  onCheckedChange={(checked) =>
                    handleAccountSelection(account.username, checked as boolean)
                  }
                  disabled={
                    selectedAccounts.length >= accountsToDelete &&
                    !selectedAccounts.includes(account.username)
                  }
                />
                <Label
                  htmlFor={account.username}
                  className={`${textPrimary} cursor-pointer`}
                >
                  {account.username}
                </Label>
              </div>
            ))}
          </div>
          {selectedAccounts.length < accountsToDelete && (
            <p className={`text-sm text-red-400 mt-3 font-montserrat`}>
              Please select {accountsToDelete - selectedAccounts.length} more
              account(s)
            </p>
          )}
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
            onClick={handleConfirm}
            disabled={isLoading || selectedAccounts.length < accountsToDelete}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading
              ? "Processing..."
              : `Delete Selected Accounts (${selectedAccounts.length}/${accountsToDelete})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
