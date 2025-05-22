import { useMemo } from "react";
import { levels } from "@/lib/levelsData";

export function useLevelData(levelId: number) {
  const levelData = useMemo(
    () => levels.find((level) => level.id === levelId),
    [levelId]
  );

  const isValid = !!levelData;
  const isComingSoon = levelData?.isComingSoon ?? false;

  const tempo = levelData?.tempo ?? 60;
  const beatDuration = 60 / tempo;

  const rangeOptions = levelData?.ranges
    ? [
        { label: `Female (${levelData.ranges.female})`, value: "female" },
        { label: `Male (${levelData.ranges.male})`, value: "male" },
      ]
    : [
        { label: "Female (C4-C5)", value: "female" },
        { label: "Male (C3-C4)", value: "male" },
      ];

  return {
    levelData,
    isValid,
    isComingSoon,
    tempo,
    beatDuration,
    rangeOptions,
  };
}
