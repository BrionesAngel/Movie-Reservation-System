export type ShowtimeSeatStatus = 'AVAILABLE' | 'RESERVED' | 'BOOKED' | 'BLOCKED';

export interface ShowtimeSeatSummary {
  id: number;
  row: string;
  number: number;
  status: ShowtimeSeatStatus;
}
