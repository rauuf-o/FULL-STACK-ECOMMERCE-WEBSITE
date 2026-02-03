"use client";

import React, { useState, useTransition } from "react";
import { Button } from "../button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../dialog";
import { Trash2, Loader2, CheckCircle2 } from "lucide-react";

type DeleteResult = { success: boolean; message: string };

const DeleteDialog = ({
  id,
  action,
  title = "Delete order",
  description = "This action can’t be undone. This will permanently delete the order from your system.",
}: {
  id: string;
  action: (id: string) => Promise<DeleteResult>;
  title?: string;
  description?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [resultMsg, setResultMsg] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const handleOpenChange = (v: boolean) => {
    // reset UI when opening fresh
    if (v) {
      setDone(false);
      setResultMsg("");
    }
    setOpen(v);
  };

  const handleDelete = () => {
    startTransition(async () => {
      const res = await action(id);

      setResultMsg(res.message || "");
      if (res.success) {
        setDone(true);
        // small delay so user sees the success state
        setTimeout(() => setOpen(false), 900);
      }
    });
  };

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <Trash2 className="h-4 w-4" />
        Delete
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[480px]">
          {!done ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg">{title}</DialogTitle>
                <DialogDescription className="leading-relaxed">
                  {description}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-2 rounded-xl border bg-muted/40 p-3 text-sm">
                <div className="font-medium">Order ID</div>
                <div className="mt-1 font-mono text-xs opacity-80">{id}</div>
              </div>

              {resultMsg ? (
                <p className="text-sm text-muted-foreground">{resultMsg}</p>
              ) : null}

              <DialogFooter className="mt-2 gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isPending}
                  className="gap-2"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Deleting…
                    </>
                  ) : (
                    "Yes, delete"
                  )}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <CheckCircle2 className="h-10 w-10" />
              <h3 className="mt-3 text-lg font-semibold">Order deleted</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {resultMsg || "The order was removed successfully."}
              </p>
              <div className="mt-5">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DeleteDialog;
