import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { Ban, X } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import {} from "lucide-react";
const ErrorModal = NiceModal.create(
  ({ text = "An error Occured" }: { text?: string }) => {
    const modal = useModal();
    return (
      <div
        onClick={() => modal.remove()}
        className="fixed inset-0 grid place-content-center bg-black/20"
      >
        <main onClick={(e) => e.stopPropagation()} className="">
          <div className="relative grid min-h-56 min-w-80 place-content-center gap-3 rounded bg-secondary p-4 text-primary">
            <Button
              className="absolute right-2 top-2"
              onClick={() => {
                modal.remove();
              }}
            >
              <X />
            </Button>
            <p className="text-2xl">{text}</p>
            {}
            <Ban className="size-24 text-8xl text-red-500" />
          </div>
        </main>
      </div>
    );
  },
);
export default ErrorModal;
