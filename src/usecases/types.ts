export interface SubscribeOptions {
  onPendingWrites: (key: string, hasPendingWrites: boolean) => void;
}
