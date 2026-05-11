import { configureStore, createSlice } from "@reduxjs/toolkit";

type HeartGameState = {
  cheated: boolean;
  score: number;
};

const initialState: HeartGameState = {
  cheated: false,
  score: 0,
};

const heartGameSlice = createSlice({
  name: "heartGame",
  initialState,
  reducers: {
    markCheated(state) {
      state.cheated = true;
      state.score = 0;
    },
    recordHeartClick(state) {
      state.cheated = false;
      state.score += 1;
    },
  },
});

export const { markCheated, recordHeartClick } = heartGameSlice.actions;

export function makeHeartGameStore() {
  return configureStore({
    reducer: {
      heartGame: heartGameSlice.reducer,
    },
  });
}

export type HeartGameStore = ReturnType<typeof makeHeartGameStore>;
export type HeartGameStateRoot = ReturnType<HeartGameStore["getState"]>;
export type HeartGameDispatch = HeartGameStore["dispatch"];
