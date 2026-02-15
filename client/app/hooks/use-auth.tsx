import { createContext, type ReactNode, useContext } from "react";
import type { User } from "~/lib/auth";

interface AuthContextType {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	login: (email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
	children: ReactNode;
	user: User | null;
}

export function AuthProvider({ children, user }: AuthProviderProps) {
	const value: AuthContextType = {
		user,
		isAuthenticated: user !== null,
		isLoading: false,
		login: async () => {
			throw new Error("Login must be handled by the login page");
		},
		logout: async () => {
			throw new Error("Logout must be handled by the logout route");
		},
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
