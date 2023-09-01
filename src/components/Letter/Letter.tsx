import styles from './Letter.module.css';

export interface ILetterProperties {
  letter: string;
  active: boolean;
  error: boolean;
  correct: boolean;
}

export const Letter = ({
  letter,
  active,
  error,
  correct,
}: ILetterProperties) => {
  return (
    <div
      className={`${styles.Letter} ${
        active ? styles.Letter_Active : ''
      } ${error ? styles.Letter_Error : ''} ${
        correct ? styles.Letter_Correct : ''
      }`}
    >
      {letter.toUpperCase()}
    </div>
  );
};
