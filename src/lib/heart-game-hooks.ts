"use client";

import { useDispatch, useSelector } from "react-redux";

import type {
  HeartGameDispatch,
  HeartGameStateRoot,
} from "@/lib/heart-game-store";

export const useHeartGameDispatch = useDispatch.withTypes<HeartGameDispatch>();
export const useHeartGameSelector =
  useSelector.withTypes<HeartGameStateRoot>();
