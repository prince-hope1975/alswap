"use client";
import NiceModal from "@ebay/nice-modal-react";

import React, { ReactNode } from "react";

const ModalProvider = ({ children }: { children: ReactNode }) => {
  return <NiceModal.Provider>{children}</NiceModal.Provider>;
};

export default ModalProvider;
