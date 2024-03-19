// LoadingContext.js
import { createContext, useContext } from "react";

export type GlobalLoading = {
  loading: boolean;
  setLoading: (c: boolean) => void;
};

export const LoadingContext = createContext<GlobalLoading>({
  loading: false, // set a default value
  setLoading: () => {},
});

export function useLoadingContext() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within LoadingProvider");
  }
  return context;
}
