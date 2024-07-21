import { useReducer, useContext, useMemo, createContext } from "react";
import { Navigate, Outlet } from "react-router-dom";

type AuthState = {
  isAuthenticated: boolean;
  userToken: string | null;
};

type AuthAction = { type: "signIn"; payload: string } | { type: "signOut" };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "signIn":
      const token = action.payload;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      sessionStorage.setItem("auth", JSON.stringify({ token, expiry: expiryDate }));
      return { isAuthenticated: true, userToken: token };
    case "signOut":
      sessionStorage.removeItem("auth");
      return { isAuthenticated: false, userToken: null };
    default:
      throw Error("Unknown action");
  }
};

type AuthProviderProps = {
  children: React.ReactNode;
};

type ContextType = {
  userToken: string | null;
  signIn: (token: string | null) => void;
  signOut: () => void;
};

const AuthContext = createContext<ContextType>({
  userToken: null,
  signIn: () => {},
  signOut: () => {},
});

export const useAuth = () => {
  return useContext(AuthContext);
};

const initialState: AuthState = {
  isAuthenticated: sessionStorage.getItem("auth") ? true : false,
  userToken: sessionStorage.getItem("auth") ? JSON.parse(sessionStorage.getItem("auth")!).token : null,
};

export const AuthProvider = (props: AuthProviderProps) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const signIn = (token: string | null) => {
    if (!token) {
      throw new Error("Token is required to sign in and is not provided");
    }
    dispatch({ type: "signIn", payload: token });
  };

  const signOut = () => {
    dispatch({ type: "signOut" });
  };

  // Memoized value of the authentication context
  const contextValue = useMemo(
    () => ({
      userToken: state.userToken,
      signIn,
      signOut,
    }),
    [state]
  );

  // Provide the authentication context to the children components
  return <AuthContext.Provider value={contextValue}>{props.children}</AuthContext.Provider>;
};

export const ProtectedRoute = () => {
  const { userToken } = useAuth();

  // Check if the user is authenticated
  if (!userToken) {
    // If not authenticated, redirect to the login page
    return <Navigate to="/login" />;
  }

  // If authenticated, render the child routes
  return <Outlet />;
};
