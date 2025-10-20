import { useState, useEffect } from "react";

export interface XPLevel {
  level: number;
  currentXP: number;
  xpForNextLevel: number;
  totalXP: number;
  progress: number;
}

// Fórmula: XP necessário = 100 * level^1.5
const calculateXPForLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(level, 1.5));
};

export const useXP = (initialXP: number = 0) => {
  const [xpData, setXPData] = useState<XPLevel>({
    level: 1,
    currentXP: 0,
    xpForNextLevel: 100,
    totalXP: initialXP,
    progress: 0,
  });

  useEffect(() => {
    calculateLevel(initialXP);
  }, [initialXP]);

  const calculateLevel = (totalXP: number) => {
    let level = 1;
    let remainingXP = totalXP;
    let xpForCurrentLevel = calculateXPForLevel(level);

    // Calcular o nível atual
    while (remainingXP >= xpForCurrentLevel) {
      remainingXP -= xpForCurrentLevel;
      level++;
      xpForCurrentLevel = calculateXPForLevel(level);
    }

    const progress = (remainingXP / xpForCurrentLevel) * 100;

    setXPData({
      level,
      currentXP: remainingXP,
      xpForNextLevel: xpForCurrentLevel,
      totalXP,
      progress,
    });
  };

  const addXP = (amount: number) => {
    const newTotalXP = xpData.totalXP + amount;
    calculateLevel(newTotalXP);
    return newTotalXP;
  };

  const getLevelFromXP = (xp: number): number => {
    let level = 1;
    let remainingXP = xp;
    let xpForCurrentLevel = calculateXPForLevel(level);

    while (remainingXP >= xpForCurrentLevel) {
      remainingXP -= xpForCurrentLevel;
      level++;
      xpForCurrentLevel = calculateXPForLevel(level);
    }

    return level;
  };

  return { xpData, addXP, getLevelFromXP };
};
