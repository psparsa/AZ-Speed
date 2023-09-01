import React from 'react';
import styles from './App.module.css';
import { Letter } from './components/Letter';
import { isLetter } from './utils/isLetter';
import { letters } from './constants/letters';
import { isBackspace } from './utils/isBackspace';
import { ElementType } from './utils/ElementType';
import { useStopwatch } from 'react-timer-hook';

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

  const { start, pause, isRunning, seconds, minutes } =
    useStopwatch();

  const formattedTime = `${
    minutes < 10 ? `0${minutes}` : minutes
  }:${seconds < 10 ? `0${seconds}` : seconds} `;

  React.useEffect(() => {
    const begin = () => {
      setStatus('typing');
      if (!isRunning) start();
    };

    const handleKeyboard = (event: KeyboardEvent) => {
      const pressedKey = event.key;

      if (isLetter(event)) {
        begin();
        if (pressedKey === activeLetter) {
          setStep((p) => p + 1);
          setActiveLetter((p) =>
            String.fromCharCode(p.charCodeAt(0) + 1)
          );

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
  }, [activeLetter, isRunning, start]);

  return (
    <main className={styles.MainContainer}>
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
      <div className={styles.Timer}>{formattedTime}</div>
    </main>
  );
}

export default App;
