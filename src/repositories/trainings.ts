import {TrainingSet, Training} from "../domain/training";
import type { Unsubscribe } from "./types";
import {collection, deleteDoc, doc, onSnapshot, orderBy, query, setDoc} from "firebase/firestore";
import {db} from "../firebase";

export function subscribeTrainings(userId: string, cb: (trainings: {
    id: string;
    data: Training
}[], hasPendingWrites: boolean) => void, onError?: (e: unknown) => void): Unsubscribe {
  const trainingsColRef = collection(db, "users", userId, "trainings");
  return onSnapshot(
    trainingsColRef,
    {includeMetadataChanges: true},
    (snap) => {
      const arr = snap.docs.map(d => ({id: d.id, data: d.data() as Training}));
      cb(arr, snap.metadata.hasPendingWrites);
    },
    (error) => onError?.(error)
  );
}

export function newTrainingId(userId: string): string {
  const newRef = doc(collection(db, "users", userId, "trainings"));
  return newRef.id;
}

export async function saveTraining(userId: string, trainingId: string, data: Partial<Training>): Promise<void> {
  const ref = doc(db, "users", userId, "trainings", trainingId);
  console.log("Saving training", data);
  await setDoc(ref, data, { merge: true });
  console.log("Saved training", data);
}

export async function deleteTraining(userId: string, trainingId: string): Promise<void> {
  const ref = doc(db, "users", userId, "trainings", trainingId);
  await deleteDoc(ref);
}

export function subscribeTrainingSets(
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

export async function addSet(userId: string, trainingId: string, data: TrainingSet): Promise<{ id: string; data: TrainingSet }> {
  const setsCol = collection(db, "users", userId, "trainings", trainingId, "sets");
  const newRef = doc(setsCol);
  await setDoc(newRef, data);
  return { id: newRef.id, data };
}

export async function updateSet(userId: string, trainingId: string, setId: string, data: Partial<TrainingSet>): Promise<void> {
  const ref = doc(db, "users", userId, "trainings", trainingId, "sets", setId);
  await setDoc(ref, data, { merge: true });
}

export async function deleteSet(userId: string, trainingId: string, setId: string): Promise<void> {
  const ref = doc(db, "users", userId, "trainings", trainingId, "sets", setId);
  await deleteDoc(ref);
}
