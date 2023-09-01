import React from 'react';
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

const initialState: LetterItem[] = letters.map((char) => ({
  value: char,
  status: 'idle',
}));

function App() {
  const [items, setItems] = React.useState(initialState);
  const [step, setStep] = React.useState(0);
  const [activeLetter, setActiveLetter] =
    React.useState('a');
  const [mistakes, setMistakes] = React.useState(0);
  const [status, setStatus] = React.useState<
    'idle' | 'typing' | 'finished'
  >('idle');

  const {
    start,
    pause,
    reset,
    isRunning,
    seconds,
    minutes,
  } = useStopwatch();

  const formattedTime = `${
    minutes < 10 ? `0${minutes}` : minutes
  }:${seconds < 10 ? `0${seconds}` : seconds} `;

  const restart = () => {
    setStatus('idle');
    reset(undefined, false);
    setItems(initialState);
    setStep(0);
    setActiveLetter('a');
    setMistakes(0);
  };

  React.useEffect(() => {
    const begin = () => {
      setStatus('typing');
      if (!isRunning) start();
    };

    const finish = () => {
      setStatus('finished');
      pause();
    };

    const handleKeyboard = (event: KeyboardEvent) => {
      if (status === 'finished') return;

      const pressedKey = event.key.toLowerCase();

      if (isLetter(event)) {
        begin();
        if (pressedKey === activeLetter) {
          setItems((p) =>
            p.map((value) =>
              value.value === pressedKey
                ? {
                    ...value,
                    status: 'correct',
                  }
                : value
            )
          );

          if (pressedKey === 'z') {
            finish();
          } else {
            setStep((p) => p + 1);
            setActiveLetter((p) =>
              String.fromCharCode(p.charCodeAt(0) + 1)
            );
          }
        } else {
          setMistakes((p) => p + 1);
          setItems((p) =>
            p.map((value) =>
              value.value === activeLetter
                ? {
                    ...value,
                    status: 'error',
                  }
                : value
            )
          );
        }
      }
    };

    const handleBackspace = (event: KeyboardEvent) => {
      if (status === 'finished') return;
      if (activeLetter === 'a') return;

      if (isBackspace(event)) {
        setStep((p) => p - 1);
        setItems((p) =>
          p.map((value) =>
            value.value === activeLetter
              ? {
                  ...value,
                  status: 'idle',
                }
              : value
          )
        );
        setActiveLetter((p) =>
          String.fromCharCode(p.charCodeAt(0) - 1)
        );
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
  }, [activeLetter, isRunning, status, start, pause]);

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
      {status === 'finished' ? (
        <div className={styles.Result}>{formattedTime}</div>
      ) : (
        <div className={styles.LettersOuterContainer}>
          <div
            className={styles.LettersInnerContainer}
            style={{
              transform: `translate(calc(50vw - 4rem - ${
                step * 9
              }rem))`,
            }}
          >
            {items.map((letterItem) => (
              <Letter
                key={letterItem.value}
                letter={letterItem.value}
                active={letterItem.value === activeLetter}
                correct={letterItem.status === 'correct'}
                error={letterItem.status === 'error'}
              />
            ))}
          </div>
        </div>
      )}

      {status === 'finished' ? (
        <div className={styles.Mistakes}>
          {mistakes === 0 ? (
            <p className={styles.Perfect}>Perfect</p>
          ) : (
            <p>Mistakes: {mistakes}</p>
          )}

          {actionButtons.reset}
        </div>
      ) : (
        <div className={styles.Timer}>
          <p>{formattedTime}</p>
          {status === 'idle' && actionButtons.play}
          {status === 'typing' && actionButtons.reset}
        </div>
      )}
    </main>
  );
}

export default App;
