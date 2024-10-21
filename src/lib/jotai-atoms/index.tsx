"use client";
import { atom } from "jotai";

export const amountAtom = atom<string>("");
export const dollarAmountAtom = atom<string>("");
export const receipientAtom = atom<string>("");
export const chainAtom = atom<string>("");
export const receiveamountAtom = atom<string>("");
export const nairaReceiveamountAtom = atom<string>("");
export const bankAtom = atom<{name: string; code?: string}>();
export const accountAtom = atom<string>("");
export const receiveMethodtAtom = atom<"wallet" | "blockchain">("wallet");
