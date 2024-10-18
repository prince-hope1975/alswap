import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { X } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import { GridLoader } from "react-spinners";

const LoadingModal = NiceModal.create(() => {
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
          <p className="text-lg">Loading...</p>
          <GridLoader size={20} />
        </div>
      </main>
    </div>
  );
});
export default LoadingModal;
