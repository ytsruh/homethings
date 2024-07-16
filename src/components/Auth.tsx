import * as React from "react";
import { Navigate, Outlet } from "react-router-dom";

type Props = {
  children: React.ReactNode;
};

type ContextType = {
  token: string | null;
  updateToken: (newToken: string | null) => void;
};

const AuthContext = React.createContext<ContextType>({
  token: null,
  updateToken: () => {},
});

export const AuthProvider = (props: Props) => {
  // State to hold the authentication token
  const [token, setToken] = React.useState(sessionStorage.getItem("token"));

  // Function to set the authentication token
  const updateToken = (newToken: string | null) => {
    setToken(newToken);
  };

  React.useEffect(() => {
    if (token) {
      //axios.defaults.headers.common["Authorization"] = "Bearer " + token;
      sessionStorage.setItem("token", token);
    } else {
      //delete axios.defaults.headers.common["Authorization"];
      sessionStorage.removeItem("token");
    }
  }, [token]);

  // Memoized value of the authentication context
  const contextValue = React.useMemo(
    () => ({
      token,
      updateToken,
    }),
    [token],
  );

  // Provide the authentication context to the children components
  return (
    <AuthContext.Provider value={contextValue}>
      {props.children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return React.useContext(AuthContext);
};

export const ProtectedRoute = () => {
  const { token } = useAuth();

  // Check if the user is authenticated
  if (!token) {
    // If not authenticated, redirect to the login page
    return <Navigate to="/login" />;
  }

  // If authenticated, render the child routes
  return <Outlet />;
};
