import { configureStore, createSlice } from "@reduxjs/toolkit";

type HeartGameState = {
  cheated: boolean;
  gameOver: boolean;
  score: number;
};

const initialState: HeartGameState = {
  cheated: false,
  gameOver: false,
  score: 0,
};

const heartGameSlice = createSlice({
  name: "heartGame",
  initialState,
  reducers: {
    markCheated(state) {
      state.cheated = true;
      state.gameOver = false;
      state.score = 0;
    },
    recordFakeHeartClick(state) {
      state.cheated = false;
      state.gameOver = true;
      state.score = 0;
    },
    recordHeartClick(state) {
      state.cheated = false;
      state.gameOver = false;
      state.score += 1;
    },
  },
});

export const { markCheated, recordFakeHeartClick, recordHeartClick } =
  heartGameSlice.actions;

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
