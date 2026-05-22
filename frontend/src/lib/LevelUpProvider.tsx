"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getStoredAuth, API_BASE_URL } from "@/lib/auth";
import LevelUpModal from "@/components/shared/LevelUpModal";
import BadgeModal from "@/components/shared/BadgeModal";

interface LevelUpContextType {
  checkLevelUp: () => void;
}

const LevelUpContext = createContext<LevelUpContextType>({ checkLevelUp: () => {} });

export function useLevelUp() {
  return useContext(LevelUpContext);
}

export function LevelUpProvider({ children }: { children: React.ReactNode }) {
  const [levelUpData, setLevelUpData] = useState<{
    isOpen: boolean;
    levelNumber: number;
    levelName: string;
  }>({ isOpen: false, levelNumber: 0, levelName: "" });

  const [badgesToCelebrate, setBadgesToCelebrate] = useState<Array<{
    badges_id: string;
    nama_badge: string;
    deskripsi: string;
  }>>([]);

  const checkLevelUp = useCallback(async () => {
    const auth = getStoredAuth();
    if (!auth?.token || !auth.user?.user_id) return;

    try {
      const res = await fetch(`${API_BASE_URL}/dashboard`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (!res.ok) return;
      const data = await res.json();

      const currentLvl = data.level?.current;
      const badgesCount = data.stats?.badges_earned;
      const recentBadge = data.recent_achievements?.[0];

      if (currentLvl) {
        const storageKey = `ecopoint_last_level_${auth.user.user_id}`;
        const storedLvl = window.localStorage.getItem(storageKey);

        if (storedLvl !== null) {
          const lastSeen = parseInt(storedLvl, 10);
          if (currentLvl.level_number > lastSeen) {
            // Level up detected!
            setLevelUpData({
              isOpen: true,
              levelNumber: currentLvl.level_number,
              levelName: currentLvl.nama_level,
            });
          }
        }
        window.localStorage.setItem(storageKey, currentLvl.level_number.toString());
      }

      if (badgesCount !== undefined) {
        const badgeStorageKey = `ecopoint_last_badge_count_${auth.user.user_id}`;
        const storedVal = window.localStorage.getItem(badgeStorageKey);
        
        if (storedVal !== null) {
          const lastBadgeCount = parseInt(storedVal, 10);
          const diff = badgesCount - lastBadgeCount;
          if (diff > 0) {
            // New badge(s) earned!
            const newBadges = data.recent_achievements?.slice(0, diff) || [];
            if (newBadges.length > 0) {
              setBadgesToCelebrate((prev) => [...prev, ...newBadges]);
            }
          }
        }
        window.localStorage.setItem(badgeStorageKey, badgesCount.toString());
      }
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
      {badgesToCelebrate.map((badge, index) => (
        <BadgeModal
          key={badge.badges_id + index}
          isOpen={true}
          onClose={() => {
            setBadgesToCelebrate((prev) => prev.filter((b) => b !== badge));
          }}
          badgeName={badge.nama_badge}
          badgeDesc={badge.deskripsi}
        />
      ))}
    </LevelUpContext.Provider>
  );
}
