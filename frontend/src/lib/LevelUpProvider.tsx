"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { getBearerToken, getStoredAuth, API_BASE_URL } from "@/lib/auth";
import LevelUpModal from "@/components/shared/LevelUpModal";

interface LevelUpContextType {
  checkLevelUp: () => void;
}

const LevelUpContext = createContext<LevelUpContextType>({
  checkLevelUp: () => {},
});

export function useLevelUp() {
  return useContext(LevelUpContext);
}

export function LevelUpProvider({ children }: { children: React.ReactNode }) {
  const [levelUpData, setLevelUpData] = useState<{
    isOpen: boolean;
    levelNumber: number;
    levelName: string;
  }>({ isOpen: false, levelNumber: 0, levelName: "" });

  const checkLevelUp = useCallback(async () => {
    const auth = getStoredAuth();
    const bearer = getBearerToken();
    if (!auth?.user?.user_id || !bearer) return;

    try {
      const res = await fetch(`${API_BASE_URL}/dashboard`, {
        headers: { Authorization: bearer },
      });
      if (!res.ok) return;
      const data = await res.json();

      const currentLvl = data.level?.current;
      if (!currentLvl) return;

      const storageKey = `ecopoint_last_level_${auth.user.user_id}`;
      const lastSeen = parseInt(
        window.localStorage.getItem(storageKey) || "0",
        10,
      );

      if (lastSeen > 0 && currentLvl.level_number > lastSeen) {
        // Level up detected!
        setLevelUpData({
          isOpen: true,
          levelNumber: currentLvl.level_number,
          levelName: currentLvl.nama_level,
        });
      }

      // Always update the stored level
      window.localStorage.setItem(
        storageKey,
        currentLvl.level_number.toString(),
      );
    } catch (err) {
      console.error("LevelUp check error:", err);
    }
  }, []);

  // Listen for any auth/points changes globally
  useEffect(() => {
    const handleAuthChange = () => {
      // Small delay so that the backend has time to process any point updates
      setTimeout(checkLevelUp, 500);
    };

    window.addEventListener("ecopoint-auth-changed", handleAuthChange);

    // Initial check on mount
    checkLevelUp();

    return () => {
      window.removeEventListener("ecopoint-auth-changed", handleAuthChange);
    };
  }, [checkLevelUp]);

  return (
    <LevelUpContext.Provider value={{ checkLevelUp }}>
      {children}
      <LevelUpModal
        isOpen={levelUpData.isOpen}
        onClose={() => setLevelUpData((prev) => ({ ...prev, isOpen: false }))}
        levelNumber={levelUpData.levelNumber}
        levelName={levelUpData.levelName}
      />
    </LevelUpContext.Provider>
  );
}
