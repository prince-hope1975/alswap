import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";

import React, { type ReactNode } from "react";

const ModalTemplate = ({
  buttonText,
  children,
  confirmation,
  onClick,
  className,
  ...props
}: {
  children: ReactNode;
  buttonText?: string;
  confirmation?: string;
  onClick: (e: unknown) => unknown;
  className:string;
  [props: string]: unknown;
}) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger className={className}>
        {children ?? buttonText ?? "Open"}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            {confirmation ??
              `This action cannot be undone.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onClick}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ModalTemplate;
