import {collection, doc, onSnapshot, setDoc} from "firebase/firestore";
import {db} from "../firebase";
import type { DayData, DayUpdateData } from "../domain/nutrition";
import type { Unsubscribe } from "./types";

export function subscribeDays(userId: string, cb: (days: DayData[], hasPendingWrites: boolean) => void, onError?: (e: unknown) => void): Unsubscribe {
    const daysCollectionRef = collection(db, "users", userId, "days");
    return onSnapshot(
        daysCollectionRef,
        {includeMetadataChanges: true},
        (querySnapshot) => {
            const daysFromFirestore: DayData[] = querySnapshot.docs.map(d => ({
                ...(d.data() as Omit<DayData, 'date'>),
                date: new Date(d.id).toISOString(),
            }));
            cb(daysFromFirestore, querySnapshot.metadata.hasPendingWrites);
        },
        (error) => onError?.(error)
    );
}

export async function saveDay(userId: string, dateIso: string, data: DayUpdateData): Promise<void> {
    const docId = new Date(dateIso).toISOString().split('T')[0];
    const dayDocRef = doc(db, "users", userId, "days", docId);
    await setDoc(dayDocRef, data, {merge: true});
}
