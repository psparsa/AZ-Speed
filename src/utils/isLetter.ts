import { letters } from '../constants/letters';

export const isLetter = (event: KeyboardEvent) =>
  (letters as unknown as string[]).includes(
    event.key.toLowerCase()
  );
