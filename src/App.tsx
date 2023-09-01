import React, { useReducer } from 'react';
import styles from './App.module.css';
import { Letter } from './components/Letter';
import { isLetter } from './utils/isLetter';
import { letters } from './constants/letters';
import { isBackspace } from './utils/isBackspace';
import { ElementType } from './utils/ElementType';
import { useStopwatch } from 'react-timer-hook';
import PlayImage from './assets/play.svg';
import RestartImage from './assets/restart.svg';

type LetterItem = {
  value: ElementType<typeof letters>;
  status: 'correct' | 'error' | 'idle';
};

type State = {
  status: 'idle' | 'typing' | 'finished';
  mistakes: number;
  activeLetter: string;
  step: number;
  items: LetterItem[];
};

type Action =
  | { type: 'reset' }
  | {
      type: 'set-status';
      payload: State['status'];
    }
  | {
      type: 'increase-mistakes';
    }
  | { type: 'next-letter' }
  | { type: 'previous-letter' }
  | {
      type: 'set-letter-status';
      payload: {
        letter: string;
        status: LetterItem['status'];
      };
    };

const reducer = (state: State, action: Action): State => {
  const currentLetterIdx = letters.findIndex(
    (letter) => letter === state.activeLetter
  );

  switch (action.type) {
    case 'reset':
      return initialState;
    case 'set-status':
      return {
        ...state,
        status: action.payload,
      };

    case 'increase-mistakes':
      return {
        ...state,
        mistakes: state.mistakes + 1,
      };

    case 'next-letter':
      return {
        ...state,
        activeLetter: String.fromCharCode(
          state.activeLetter.charCodeAt(0) + 1
        ),
        step: currentLetterIdx + 1,
      };

    case 'previous-letter': {
      return {
        ...state,
        activeLetter: String.fromCharCode(
          state.activeLetter.charCodeAt(0) - 1
        ),
        step: currentLetterIdx - 1,
      };
    }

    case 'set-letter-status':
      return {
        ...state,
        items: state.items.map((value) =>
          value.value === action.payload.letter
            ? {
                ...value,
                status: action.payload.status,
              }
            : value
        ),
      };
  }
};

const initialState: State = {
  status: 'idle',
  mistakes: 0,
  activeLetter: 'a',
  step: 0,
  items: letters.map((char) => ({
    value: char,
    status: 'idle',
  })),
};

function App() {
  const [state, dispatch] = useReducer(
    reducer,
    initialState
  );

  const {
    start: startStopwatch,
    pause: pauseStopwatch,
    reset: resetStopwatch,
    isRunning: isStopwatchRunning,
    seconds: stopwatchSeconds,
    minutes: stopwatchmMinutes,
  } = useStopwatch();

  const formattedTime = `${
    stopwatchmMinutes < 10
      ? `0${stopwatchmMinutes}`
      : stopwatchmMinutes
  }:${
    stopwatchSeconds < 10
      ? `0${stopwatchSeconds}`
      : stopwatchSeconds
  } `;

  const restart = () => {
    dispatch({ type: 'reset' });
    resetStopwatch(undefined, false);
  };

  React.useEffect(() => {
    const begin = () => {
      dispatch({ type: 'set-status', payload: 'typing' });
      if (!isStopwatchRunning) startStopwatch();
    };

    const finish = () => {
      dispatch({ type: 'set-status', payload: 'finished' });
      pauseStopwatch();
    };

    const handleKeyboard = (event: KeyboardEvent) => {
      if (state.status === 'finished') return;

      const pressedKey = event.key.toLowerCase();

      if (isLetter(event)) {
        begin();
        if (pressedKey === state.activeLetter) {
          dispatch({
            type: 'set-letter-status',
            payload: {
              letter: pressedKey,
              status: 'correct',
            },
          });

          if (pressedKey === 'z') finish();
          else dispatch({ type: 'next-letter' });
        } else {
          dispatch({ type: 'increase-mistakes' });
          dispatch({
            type: 'set-letter-status',
            payload: {
              letter: state.activeLetter,
              status: 'error',
            },
          });
        }
      }
    };

    const handleBackspace = (event: KeyboardEvent) => {
      if (state.status === 'finished') return;
      if (state.activeLetter === 'a') return;

      if (isBackspace(event)) {
        dispatch({ type: 'previous-letter' });

        dispatch({
          type: 'set-letter-status',
          payload: {
            letter: state.activeLetter,
            status: 'idle',
          },
        });
      }
    };

    window.addEventListener('keypress', handleKeyboard);
    window.addEventListener('keydown', handleBackspace);

    return () => {
      window.removeEventListener(
        'keypress',
        handleKeyboard
      );

      window.removeEventListener(
        'keydown',
        handleBackspace
      );
    };
  }, [
    state.activeLetter,
    isStopwatchRunning,
    state.status,
    startStopwatch,
    pauseStopwatch,
  ]);

  const actionButtons = {
    reset: (
      <img
        src={RestartImage}
        alt="reset"
        className={`${styles.ActionButton} ${styles.ResetButton}`}
        onClick={restart}
      />
    ),
    play: (
      <img
        src={PlayImage}
        alt="play"
        className={styles.ActionButton}
      />
    ),
  };

  return (
    <main className={styles.MainContainer}>
      {state.status === 'finished' ? (
        <div className={styles.Result}>{formattedTime}</div>
      ) : (
        <div className={styles.LettersOuterContainer}>
          <div
            className={styles.LettersInnerContainer}
            style={{
              transform: `translate(calc(50vw - 4rem - ${
                state.step * 9
              }rem))`,
            }}
          >
            {state.items.map((letterItem) => (
              <Letter
                key={letterItem.value}
                letter={letterItem.value}
                active={
                  letterItem.value === state.activeLetter
                }
                correct={letterItem.status === 'correct'}
                error={letterItem.status === 'error'}
              />
            ))}
          </div>
        </div>
      )}

      {state.status === 'finished' ? (
        <div className={styles.Mistakes}>
          {state.mistakes === 0 ? (
            <p className={styles.Perfect}>Perfect</p>
          ) : (
            <p>Mistakes: {state.mistakes}</p>
          )}

          {actionButtons.reset}
        </div>
      ) : (
        <div className={styles.Timer}>
          <p>{formattedTime}</p>
          {state.status === 'idle' && actionButtons.play}
          {state.status === 'typing' && actionButtons.reset}
        </div>
      )}
    </main>
  );
}

export default App;
