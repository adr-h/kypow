import { Text } from 'ink';
import React, { useEffect, useState } from 'react';

const frames = [
`   O
  /|\\
  / \\  `,

`   O/
  /|
  / \\  `,

`  \\O
   |\\
  / \\  `,

`   O
  \\|/
  | |  `,

`  \\O/
   |
  / \\  `,

`   O
  /|\\
  / \\  `
];


type Props = {
   interval?: number;
}

export function DancinGuy({ interval = 500 }: Props) {
   const [frame, setFrame] = useState(0);

   useEffect(() => {
      const intervalFunc = setInterval(() => {
         const isLastFrame = frame === frames.length - 1;

         if (isLastFrame) {
            setFrame(0);
         } else {
            setFrame(frame + 1);
         }
      }, interval);

      return () => clearInterval(intervalFunc);
   });

   return <Text>{frames[frame]}</Text>;
}