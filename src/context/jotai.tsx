import { Asset, EventLog } from "@/types";
import { atom } from "jotai";

export const assetAtom = atom<Asset[] | null>(null);
export const eventAtom = atom<EventLog[] | null>(null);
