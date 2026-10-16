import left from '../assets/tutorial-guide/left.webp';
import right from '../assets/tutorial-guide/right.webp';
import wave from '../assets/tutorial-guide/wave.webp';
import thinking from '../assets/tutorial-guide/thinking.webp';
import celebrate from '../assets/tutorial-guide/celebrate.webp';

// Stable poses: revisiting a component shows the same guide.
export const tutorialGuide = {
  AND: wave,
  OR: right,
  NOT: left,
  NAND: thinking,
  NOR: thinking,
  XOR: celebrate,
  XNOR: celebrate,
  CLOCK: wave,
  DFF: right,
  TFF: left,
};
