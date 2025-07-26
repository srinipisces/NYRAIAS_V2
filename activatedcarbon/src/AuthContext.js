import { createContext, useContext } from 'react';

export const AuthContext = createContext({
  user: null,           // Full decoded JWT
  userid: null,         // Extracted user ID
  accountid: null,      // Extracted account ID
  access: [],           // Extracted access array
  setUser: () => {},    // Function to update user info (from AuthWrapper)
});

export const useAuth = () => useContext(AuthContext);
