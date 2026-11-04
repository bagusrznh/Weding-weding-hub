import { TimeElapsed } from '../types';

// Default wedding date set by user: 04 November 2023 (04112023)
export const DEFAULT_WEDDING_DATE = '2023-11-04';

/**
 * Normalizes user input string to clean numeric or standardized representation
 */
export function normalizeDateInput(input: string): string {
  return input.trim().replace(/[\s\/\-\.\,]/g, '');
}

/**
 * Checks if the entered string or date matches the wedding date
 */
export function verifyWeddingDate(input: string, targetDateStr = DEFAULT_WEDDING_DATE): boolean {
  if (!input) return false;
  
  const cleanInput = normalizeDateInput(input);
  
  // Format target: '2023-11-04'
  const [targetYear, targetMonth, targetDay] = targetDateStr.split('-');
  const shortDay = String(parseInt(targetDay, 10)); // '4'
  const shortMonth = String(parseInt(targetMonth, 10)); // '11'
  
  // Possible matches for 04 Nov 2023:
  // '04112023' (DDMMYYYY)
  // '20231104' (YYYYMMDD)
  // '0411'     (DDMM)
  // '041123'   (DDMMYY)
  // '4112023'  (single digit day)
  // '411'      (single digit day + month)
  const ddmmyyyy = `${targetDay}${targetMonth}${targetYear}`;
  const yyyymmdd = `${targetYear}${targetMonth}${targetDay}`;
  const ddmmyy = `${targetDay}${targetMonth}${targetYear.slice(-2)}`;
  const ddmm = `${targetDay}${targetMonth}`;
  const short_ddmmyyyy = `${shortDay}${targetMonth}${targetYear}`;
  const short_ddmm = `${shortDay}${targetMonth}`;

  // If input matches any standard permutation
  if (
    cleanInput === ddmmyyyy ||
    cleanInput === yyyymmdd ||
    cleanInput === ddmmyy ||
    cleanInput === ddmm ||
    cleanInput === short_ddmmyyyy ||
    cleanInput === short_ddmm
  ) {
    return true;
  }

  // Also check if user selected via native date picker formatted as 'YYYY-MM-DD'
  if (input === targetDateStr) {
    return true;
  }

  return false;
}

/**
 * Calculates live time elapsed since the wedding date
 */
export function calculateTimeElapsed(weddingDateStr: string = DEFAULT_WEDDING_DATE): TimeElapsed {
  const weddingDate = new Date(`${weddingDateStr}T09:00:00`);
  const now = new Date();

  let diffMs = now.getTime() - weddingDate.getTime();
  if (diffMs < 0) diffMs = 0;

  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Calendar year / month / day calculation
  let years = now.getFullYear() - weddingDate.getFullYear();
  let months = now.getMonth() - weddingDate.getMonth();
  let days = now.getDate() - weddingDate.getDate();

  if (days < 0) {
    months -= 1;
    // Days in previous month
    const prevMonthLastDay = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    days += prevMonthLastDay;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  return {
    years: Math.max(0, years),
    months: Math.max(0, months),
    days: Math.max(0, days),
    hours,
    minutes,
    seconds,
    totalDays,
  };
}
