"use client";

import React, { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, PackageCheck } from "lucide-react";

type Result = {
  success: boolean;
  message: string;
};

const MarkDeliveredButton = ({
  id,
  action,
  disabled,
}: {
  id: string;
  action: (id: string) => Promise<Result>;
  disabled?: boolean;
}) => {
  const [isPending, startTransition] = useTransition();

  const handleMarkAsDelivered = () => {
    startTransition(async () => {
      const res = await action(id);
      console.log("mark delivered:", res);
    });
  };

  return (
    <Button
      type="button"
      className="mt-2 w-full gap-2"
      onClick={handleMarkAsDelivered}
      disabled={disabled === true || isPending}
    >
      {isPending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Updating…
        </>
      ) : (
        <>
          <PackageCheck className="h-4 w-4" />
          Mark as delivered
        </>
      )}
    </Button>
  );
};

export default MarkDeliveredButton;
