import type { NutritionGoals } from "../domain/nutrition";
import type { Unsubscribe } from "./types";
import {doc, onSnapshot, setDoc} from "firebase/firestore";
import {db} from "../firebase";

export function subscribeNutritionGoals(userId: string, cb: (goals: NutritionGoals[] | null, hasPendingWrites: boolean) => void, onError?: (e: unknown) => void): Unsubscribe {
    const profileDocRef = doc(db, "users", userId, "profile", "userProfile");
    return onSnapshot(
        profileDocRef,
        {includeMetadataChanges: true},
        (docSnap) => {
            const goals = (docSnap.exists() ? (docSnap.data().nutritionGoals as NutritionGoals[] | null) : null) ?? null;
            cb(goals, docSnap.metadata.hasPendingWrites);
        },
        (error) => onError?.(error)
    );
}

export async function saveNutritionGoals(userId: string, goals: NutritionGoals[]): Promise<void> {
    const userDocRef = doc(db, "users", userId, "profile", "userProfile");
    await setDoc(userDocRef, {nutritionGoals: goals}, {merge: true});
}
