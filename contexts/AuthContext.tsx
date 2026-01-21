
import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isGuest: boolean;
  stats?: {
    avgReact: number;
    totalGames: number;
    level: number;
  };
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (method: 'google' | 'email') => Promise<void>;
  logout: () => Promise<void>;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    // Initializing as Guest by default for local simulation
    // In a real app, this would check Firebase onAuthStateChanged
    const guestUser: UserProfile = {
      uid: 'guest_123',
      displayName: 'GUEST_01',
      email: null,
      photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest',
      isGuest: true,
      stats: {
        avgReact: 182,
        totalGames: 12,
        level: 1
      }
    };
    
    // Simulate initial loading
    const timer = setTimeout(() => {
      setUser(guestUser);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const login = async (method: 'google' | 'email') => {
    // Simulated Firebase Auth
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    
    const loggedInUser: UserProfile = {
      uid: 'user_456',
      displayName: method === 'google' ? 'Google Player' : 'Email Warrior',
      email: 'player@example.com',
      photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=verified',
      isGuest: false,
      stats: {
        avgReact: 154,
        totalGames: 432,
        level: 42
      }
    };
    
    setUser(loggedInUser);
    setLoading(false);
    setIsAuthModalOpen(false);
  };

  const logout = async () => {
    setUser(null);
    // Reset back to guest
    setUser({
      uid: 'guest_123',
      displayName: 'GUEST_01',
      email: null,
      photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest',
      isGuest: true,
      stats: { avgReact: 0, totalGames: 0, level: 1 }
    });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      isAuthModalOpen, 
      openAuthModal: () => setIsAuthModalOpen(true),
      closeAuthModal: () => setIsAuthModalOpen(false)
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
