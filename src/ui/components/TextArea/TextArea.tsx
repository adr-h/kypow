//TODO: implement a DIY TextArea component
/**
 * - receive a "value" prop that's a string
 * - onChange to inform that the value should be updated
 * - internally split the string by \n to produce an array of strings
 * - map that array to <Text> components to render
 * - internally keep track of a [row, col] tuple for the cursor
 * - whenever the user presses any arrow keys, advance the cursor accordingly
 * - whenever the user presses "backspace", delete the previous character. And also shift the row up if at col 0 (probably happens automatically, given we split by \n ?)
 * - whenever the user presses "enter", insert a newline \n
 */

import { Newline, Text, useInput } from "ink";
import { useState } from "react";
import chalk from 'chalk';

type Props = {
   value: string;
   onChange: (s: string) => void;
}

type Position = [col: number, row: number ];

export function TextArea({ value, onChange }: Props) {
   const [cursor, setCursor] = useState<Position>([0,0]);
   const lines = value.split('\n');

   const [ currentCol, currentRow ] = cursor;

   function maxColForRow (row: number) {
      const maxCol = lines[row].length - 1;
      return maxCol;
   }
   const minRow = 0;
   const minCol = 0;
   const maxRow = lines.length - 1;

   useInput((input, key) => {
      if (key.upArrow) {
         const newRow = Math.max(minRow, currentRow - 1);
         const newCol = Math.min(maxColForRow(newRow), currentCol);
         return setCursor([newCol, newRow]);
      }

      if (key.downArrow) {
         const newRow = Math.min(maxRow, currentRow + 1);
         const newCol = Math.min(maxColForRow(newRow), currentCol);
         return setCursor([newCol, newRow]);
      }

      if (key.leftArrow) {
         if (currentCol === minCol) {
            const newRow = Math.max(minRow, currentRow - 1);
            const newCol = maxColForRow(newRow);
            return setCursor([newCol, newRow]);
         }

         const newCol = Math.max(minCol, currentCol - 1);
         return setCursor([newCol, currentRow]);
      }

      if (key.rightArrow) {
         const maxCol = maxColForRow(currentRow);
         if (currentCol === maxCol) {
            const newRow = Math.min(maxRow, currentRow + 1);
            return setCursor([minCol, newRow]);
         }

         const newCol = Math.min(maxCol, currentCol + 1);
         return setCursor([newCol, currentRow]);
      }
   });

   function getCurrentLineWithCursor() {
      const lineWithCursor = lines[currentRow];
      const maxCol = maxColForRow(currentRow);

      const start = lineWithCursor.slice(0, currentCol);
      const end = (currentCol === maxCol) ? '' : lineWithCursor.slice(currentCol + 1);

      return start + chalk.inverse(lineWithCursor[currentCol]) + end;
   }

   function getRenderableLines() {
      const start = lines.slice(0, currentRow);
      const end = (currentRow === maxRow) ? [] : lines.slice(currentRow + 1);

      return [...start, getCurrentLineWithCursor(), ...end];
   }

   const renderableLines = getRenderableLines();
   return <Text>
      Cursor position: [x: {currentCol}, y: {currentRow}]
      <Newline />
      {renderableLines.join('\n')}
   </Text>

}
