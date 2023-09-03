import { useKeyPress } from 'ahooks';
import { useStopwatch } from 'react-timer-hook';
import styles from './App.module.css';
import { Alphabet, useAppState } from './AppState';
import PlayImage from './assets/play.svg';
import RestartImage from './assets/restart.svg';
import { Letter } from './components/Letter';
import { SFX } from './utils/SFX';
import { isLetter } from './utils/isLetter';
import { letters } from './constants/letters';

function App() {
  const [state, { correct, reset, submit }] = useAppState();
  const activeLetter = letters[state.step];

  const {
    start: startStopwatch,
    pause: pauseStopwatch,
    reset: resetStopwatch,
    isRunning: isStopwatchRunning,
    seconds: stopwatchSeconds,
    minutes: stopwatchMinutes,
  } = useStopwatch();

  const restart = () => {
    SFX.restart.play();
    reset();
    resetStopwatch(undefined, false);
  };

  useKeyPress(
    (event) => isLetter(event.key),
    (event) => {
      if (state.status === 'finished') return;
      if (!isStopwatchRunning) startStopwatch();

      const pressedKey =
        event.key.toLowerCase() as Alphabet;
      const isCorrect = pressedKey === activeLetter;
      const shouldFinish = isCorrect && pressedKey === 'z';
      if (shouldFinish) pauseStopwatch();

      const sfx = isCorrect ? SFX.click : SFX.wrong;
      sfx.play();
      submit(pressedKey);
    }
  );

  useKeyPress(['backspace'], () => {
    SFX.backspace.play();
    correct();
  });

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

  const formattedTime = `${
    stopwatchMinutes < 10
      ? `0${stopwatchMinutes}`
      : stopwatchMinutes
  }:${
    stopwatchSeconds < 10
      ? `0${stopwatchSeconds}`
      : stopwatchSeconds
  } `;

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
                key={letterItem.letter}
                letter={letterItem.letter}
                active={letterItem.letter === activeLetter}
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
