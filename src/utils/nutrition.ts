import {DayData} from "../components/types";

export enum NutritionColor {
    RED = "#f85149",
    YELLOW = "#facc15",
    GREEN = "#3fb950",
}

export interface Level {
    value: number;
    color: NutritionColor;
}

export const getKcalLevels = (): Level[] => [
    {value: 1100, color: NutritionColor.RED},
    {value: 1400, color: NutritionColor.YELLOW},
    {value: 1800, color: NutritionColor.GREEN},
    {value: 2400, color: NutritionColor.YELLOW},
    {value: 3200, color: NutritionColor.RED},
    {value: 3500, color: NutritionColor.RED},
];

export const getProteinLevels = (): Level[] => [
    {value: 80, color: NutritionColor.RED},
    {value: 110, color: NutritionColor.YELLOW},
    {value: 170, color: NutritionColor.GREEN},
    {value: 250, color: NutritionColor.GREEN},
];

export const getFatLevels = (): Level[] => [
    {value: 30, color: NutritionColor.RED},
    {value: 40, color: NutritionColor.YELLOW},
    {value: 50, color: NutritionColor.GREEN},
    {value: 80, color: NutritionColor.YELLOW},
];

export const getOptimalValue = (sortedLevels: Level[]): number => {
    const level = sortedLevels.findIndex(value => value.color == NutritionColor.GREEN)
    if (level === -1) {
        throw new Error("No green level");
    }
    const min = sortedLevels[level].value;
    const max = sortedLevels[level + 1].value;
    return (max - min) / 2 + min;
}

export const getCurrentLevel = (
    currentValue: number | null,
    sortedLevels: Level[],
): Level | undefined => {
    if (!currentValue || !sortedLevels) {
        return undefined;
    }
    let activeIndex = 0;
    for (let i = 0; i < sortedLevels.length; i++) {
        if (currentValue >= sortedLevels[i].value) activeIndex = i;
        else break;
    }
    return sortedLevels[activeIndex];
}

export const getDayColor = (day: DayData): NutritionColor | null => {
    const kcal = getCurrentLevel(day.kcal, getKcalLevels())?.color;
    const protein = getCurrentLevel(day.protein, getProteinLevels())?.color;
    const fat = getCurrentLevel(day.fat, getFatLevels())?.color;
    if (!kcal || !protein || !fat) {
        return null;
    }
    if (kcal === NutritionColor.RED || protein === NutritionColor.RED) {
        return NutritionColor.RED;
    }
    if (kcal === NutritionColor.YELLOW || protein === NutritionColor.YELLOW) {
        return NutritionColor.YELLOW;
    }
    return fat !== NutritionColor.RED ? NutritionColor.GREEN : NutritionColor.YELLOW;
}
