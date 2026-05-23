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
import BadgeModal from "@/components/shared/BadgeModal";

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

  const [badgesToCelebrate, setBadgesToCelebrate] = useState<
    Array<{
      badges_id: string;
      nama_badge: string;
      deskripsi: string;
    }>
  >([]);

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
      const badgesCount = data.stats?.badges_earned;
      const lastSeenLevel = data.user?.last_seen_level ?? 0;
      const lastSeenBadgeCount = data.user?.last_seen_badge_count ?? 0;

      let triggerUpdate = false;
      const updatePayload: Record<string, number> = {};

      if (currentLvl && currentLvl.level_number > lastSeenLevel) {
        setLevelUpData({
          isOpen: true,
          levelNumber: currentLvl.level_number,
          levelName: currentLvl.nama_level,
        });
        triggerUpdate = true;
        updatePayload.seen_level = currentLvl.level_number;
      }

      if (badgesCount !== undefined) {
        const diff = badgesCount - lastSeenBadgeCount;
        if (diff > 0) {
          const newBadges = data.recent_achievements?.slice(0, diff) || [];
          if (newBadges.length > 0) {
            setBadgesToCelebrate((prev) => [...prev, ...newBadges]);
          }
          triggerUpdate = true;
          updatePayload.seen_badge_count = badgesCount;
        }
      }

      if (triggerUpdate) {
        try {
          await fetch(`${API_BASE_URL}/dashboard/seen`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.token}`,
            },
            body: JSON.stringify(updatePayload),
          });
        } catch (e) {
          console.error("Failed to update seen achievements", e);
        }
      }
    } catch (err) {
      console.error("LevelUp check error:", err);
    }
  }, []);

  useEffect(() => {
    const handleAuthChange = () => {
      setTimeout(checkLevelUp, 500);
    };

    window.addEventListener("ecopoint-auth-changed", handleAuthChange);
    const initialCheck = setTimeout(checkLevelUp, 0);

    return () => {
      window.removeEventListener("ecopoint-auth-changed", handleAuthChange);
      clearTimeout(initialCheck);
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
