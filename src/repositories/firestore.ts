import {collection, doc, onSnapshot, setDoc, deleteDoc, getDocs, orderBy, query, limit} from "firebase/firestore";
import {db} from "../firebase";
import type {DayData, DayUpdateData, NutritionGoals} from "../domain";
import type {DaysRepository, ProfileRepository, TrainingsRepository, Unsubscribe} from ".";
import type { TrainingSet, ExerciseId, BilateralSet, UnilateralSet } from "../utils/exercises";

export class FirestoreDaysRepository implements DaysRepository {
    subscribeDays(userId: string, cb: (days: DayData[], hasPendingWrites: boolean) => void, onError?: (e: unknown) => void): Unsubscribe {
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

    async saveDay(userId: string, dateIso: string, data: DayUpdateData): Promise<void> {
        const docId = new Date(dateIso).toISOString().split('T')[0];
        const dayDocRef = doc(db, "users", userId, "days", docId);
        await setDoc(dayDocRef, data, {merge: true});
    }
}

export class FirestoreProfileRepository implements ProfileRepository {
    subscribeNutritionGoals(userId: string, cb: (goals: NutritionGoals[] | null, hasPendingWrites: boolean) => void, onError?: (e: unknown) => void): Unsubscribe {
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

    async saveNutritionGoals(userId: string, goals: NutritionGoals[]): Promise<void> {
        const userDocRef = doc(db, "users", userId, "profile", "userProfile");
        await setDoc(userDocRef, {nutritionGoals: goals}, {merge: true});
    }
}

export class FirestoreTrainingsRepository<TTraining> implements TrainingsRepository<TTraining> {
    subscribeTrainings(userId: string, cb: (trainings: {
        id: string;
        data: TTraining
    }[], hasPendingWrites: boolean) => void, onError?: (e: unknown) => void): Unsubscribe {
        const trainingsColRef = collection(db, "users", userId, "trainings");
        return onSnapshot(
            trainingsColRef,
            {includeMetadataChanges: true},
            (snap) => {
                const arr = snap.docs.map(d => ({id: d.id, data: d.data() as TTraining}));
                cb(arr, snap.metadata.hasPendingWrites);
            },
            (error) => onError?.(error)
        );
    }

    newTrainingId(userId: string): string {
        const newRef = doc(collection(db, "users", userId, "trainings"));
        return newRef.id;
    }

    async saveTraining(userId: string, trainingId: string, data: Partial<TTraining>): Promise<void> {
        const ref = doc(db, "users", userId, "trainings", trainingId);
        await setDoc(ref, data as any, { merge: true });
    }

    async deleteTraining(userId: string, trainingId: string): Promise<void> {
        const ref = doc(db, "users", userId, "trainings", trainingId);
        await deleteDoc(ref);
    }

    subscribeTrainingSets(
        userId: string,
        trainingId: string,
        cb: (sets: { id: string; data: TrainingSet }[], hasPendingWrites: boolean) => void,
        onError?: (e: unknown) => void
    ): Unsubscribe {
        const setsCol = collection(db, "users", userId, "trainings", trainingId, "sets");
        return onSnapshot(
            query(setsCol, orderBy("performedAt", "asc")),
            { includeMetadataChanges: true },
            (snap) => {
                const arr = snap.docs.map(d => ({ id: d.id, data: d.data() as TrainingSet }));
                cb(arr, snap.metadata.hasPendingWrites);
            },
            (error) => onError?.(error)
        );
    }

    async addSet(userId: string, trainingId: string, data: TrainingSet): Promise<{ id: string; data: TrainingSet }> {
        const setsCol = collection(db, "users", userId, "trainings", trainingId, "sets");
        const newRef = doc(setsCol);
        await setDoc(newRef, data as any);
        return { id: newRef.id, data };
    }

    async updateSet(userId: string, trainingId: string, setId: string, data: Partial<TrainingSet>): Promise<void> {
        const ref = doc(db, "users", userId, "trainings", trainingId, "sets", setId);
        await setDoc(ref, data as any, { merge: true });
    }

    async deleteSet(userId: string, trainingId: string, setId: string): Promise<void> {
        const ref = doc(db, "users", userId, "trainings", trainingId, "sets", setId);
        await deleteDoc(ref);
    }

    async getRecentExerciseHistoryPoints(
        userId: string,
        exerciseId: ExerciseId,
        trainingsLimit: number
    ): Promise<{ date: string; weight: number }[]> {
        const trainingsCol = collection(db, "users", userId, "trainings");
        const trainingsSnap = await getDocs(query(trainingsCol, orderBy("startedAt", "desc"), limit(trainingsLimit)));
        const points: { date: string; weight: number }[] = [];
        for (const t of trainingsSnap.docs) {
            const setsCol = collection(db, "users", userId, "trainings", t.id, "sets");
            const setsSnap = await getDocs(query(setsCol, orderBy("performedAt", "asc")));
            setsSnap.forEach(sDoc => {
                const s = sDoc.data() as TrainingSet;
                if (s.exerciseId !== exerciseId) return;
                let weight = 0;
                if ((s as BilateralSet).mode === "bilateral") {
                    weight = (s as BilateralSet).weightKg;
                } else {
                    const u = s as UnilateralSet;
                    weight = (u.weightLeftKg + u.weightRightKg) / 2;
                }
                const performedAt: any = (s as any).performedAt;
                const iso = typeof performedAt?.toDate === "function" ? performedAt.toDate().toISOString() : new Date().toISOString();
                points.push({ date: iso, weight });
            });
        }
        points.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        return points;
    }
}
