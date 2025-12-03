export interface MedicationLog {
  doliprane: number | null;
  ibuprofene: number | null;
}

export type MedicationType = 'doliprane' | 'ibuprofene';

export const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
