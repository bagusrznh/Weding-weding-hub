export interface LoveReply {
  id: string;
  sender: string;
  message: string;
  createdAt: string;
}

export interface TimeElapsed {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
}
