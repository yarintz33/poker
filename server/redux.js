import { configureStore } from "@reduxjs/toolkit";

const rootReducer = (currentState = 0, action) => {
  return currentState;
};

const store = configureStore({
  reducer: rootReducer,
  // Optional: configure middleware, devTools, preloadedState, etc.
});

export default store;
