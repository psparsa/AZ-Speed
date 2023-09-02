import { useReducer } from 'react';
import { letters } from './constants/letters';

export type Alphabet = (typeof letters)[number];

type LetterItem = {
  letter: Alphabet;
  status: 'correct' | 'error' | 'idle';
};

type AppState = {
  status: 'idle' | 'typing' | 'finished';
  mistakes: number;
  step: number;
  items: LetterItem[];
};

type Action =
  | { type: 'Reset' }
  | { type: 'Correct' }
  | { type: 'SubmitLetter'; payload: Alphabet };

const reducer = (state: AppState, action: Action): AppState => {
  const activeLetter = letters[state.step];

  switch (action.type) {
    case 'Reset':
      return initialState;

    case 'Correct': {
      if (state.status !== 'typing' || state.step === 0)
        return state;
      return { ...state, step: state.step - 1 };
    }

    case 'SubmitLetter': {
      const status =
        activeLetter === action.payload
          ? 'correct'
          : 'error';
      const shouldFinish =
        activeLetter === 'z' && status === 'correct';
      const nextStep = Math.min(letters.length - 1, state.step + 1);

      return {
        ...state,
        step: nextStep,
        status: shouldFinish ? 'finished' : 'typing',
        items: state.items.map((value) =>
          value.letter === activeLetter
            ? { ...value, status }
            : value
        ),
        mistakes:
          status === 'error'
            ? state.mistakes + 1
            : state.mistakes,
      };
    }
  }
};

const initialState: AppState = {
  status: 'idle',
  mistakes: 0,
  step: 0,
  items: letters.map((char) => ({
    letter: char,
    status: 'idle',
  })),
};

export function useAppState() {
  const [state, dispatch] = useReducer(
    reducer,
    initialState
  );

  return [
    state,
    {
      correct: () => dispatch({ type: 'Correct' }),
      reset: () => dispatch({ type: 'Reset' }),
      submit: (letter: Alphabet) =>
        dispatch({ type: 'SubmitLetter', payload: letter }),
    },
  ] as const;
}
