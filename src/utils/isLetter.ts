import { letters } from '../constants/letters';

export const isLetter = (key: string) =>
  letters.includes(key.toLowerCase());
