'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: any;
  confirmText?: string;
  cancelText?: string;
  confirmButtonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  confirmButtonClassName?: string;
  isConfirming?: boolean;
}

export const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonVariant = 'default',
  confirmButtonClassName,
  isConfirming = false,
}: ConfirmationDialogProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white rounded-lg shadow-xl">
        <DialogHeader className="pt-6 px-6">
          <DialogTitle className="text-xl font-semibold text-gray-900 text-center sm:text-left">{title}</DialogTitle>
          {description && (
            <DialogDescription className="mt-2 text-sm text-gray-600 text-center sm:text-left">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        
        <DialogFooter className="px-6 py-4 mt-4 sm:mt-2 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto mb-2 sm:mb-0">
              {cancelText}
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant={confirmButtonVariant}
            className={confirmButtonClassName}
            onClick={onConfirm}
            disabled={isConfirming}
          >
            {isConfirming ? 'Processing...' : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 