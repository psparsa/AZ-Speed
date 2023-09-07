import { Howl } from 'howler';

export const SFX = {
  click: new Howl({ src: ['/sfx/click.wav'], html5: true }),
  wrong: new Howl({ src: ['/sfx/wrong.wav'], html5: true }),
  backspace: new Howl({
    src: ['/sfx/backspace.wav'],
    html5: true,
  }),
  restart: new Howl({
    src: ['/sfx/restart.wav'],
    html5: true,
  }),
};
