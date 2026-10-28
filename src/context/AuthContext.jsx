import { createContext, useContext, useState } from "react";
import { getToken, removeToken, saveToken } from "../lib/api";

const AuthContext = createContext(null);
const USER_KEY = "inkflow_user";

const readSavedUser = () => {
  try {
    const savedUser = localStorage.getItem(USER_KEY);
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => (getToken() ? readSavedUser() : null));

  const startSession = ({ token, user: accountUser }) => {
    saveToken(token);
    localStorage.setItem(USER_KEY, JSON.stringify(accountUser));
    setUser(accountUser);
  };

  const endSession = () => {
    removeToken();
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, startSession, endSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
