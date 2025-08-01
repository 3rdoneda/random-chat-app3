
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface PremiumContextType {
  isPremium: boolean;
  premiumExpiry: Date | null;
  setPremium: (premium: boolean, expiry?: Date) => void;
  checkPremiumStatus: () => boolean;
}

const PremiumContext = createContext<PremiumContextType | null>(null);

export const usePremium = () => {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error("usePremium must be used within a PremiumProvider");
  }
  return context;
};

interface PremiumProviderProps {
  children: ReactNode;
}

export const PremiumProvider = ({ children }: PremiumProviderProps) => {
  const [isPremium, setIsPremium] = useState(false);
  const [premiumExpiry, setPremiumExpiry] = useState<Date | null>(null);

  // Check premium status on mount
  useEffect(() => {
    const savedPremium = localStorage.getItem("premium_status");
    const savedExpiry = localStorage.getItem("premium_expiry");
    
    if (savedPremium && savedExpiry) {
      const expiryDate = new Date(savedExpiry);
      if (expiryDate > new Date()) {
        setIsPremium(true);
        setPremiumExpiry(expiryDate);
      } else {
        // Premium expired, clear storage
        localStorage.removeItem("premium_status");
        localStorage.removeItem("premium_expiry");
      }
    }
  }, []);

  const setPremium = (premium: boolean, expiry?: Date) => {
    setIsPremium(premium);
    if (premium && expiry) {
      setPremiumExpiry(expiry);
      localStorage.setItem("premium_status", "true");
      localStorage.setItem("premium_expiry", expiry.toISOString());
    } else {
      setPremiumExpiry(null);
      localStorage.removeItem("premium_status");
      localStorage.removeItem("premium_expiry");
    }
  };

  const checkPremiumStatus = () => {
    if (premiumExpiry && new Date() > premiumExpiry) {
      setPremium(false);
      return false;
    }
    return isPremium;
  };

  return (
    <PremiumContext.Provider
      value={{
        isPremium,
        premiumExpiry,
        setPremium,
        checkPremiumStatus,
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
};
