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

import { Text, useInput } from "ink";
import { useEffect, useState } from "react";
import { TextBuffer } from "./TextBuffer";

type Props = {
   value: string;
   onChange: (s: string) => void;
   visibleHeight: number;
}

export function TextArea({ value, onChange, visibleHeight }: Props) {
   const [ cursor, setCursor ] = useState<{col: number, row: number}>({ col: 0, row: 0 });
   const [ renderedText, setRenderedText ] = useState<string>(value);

   const [ textBuffer] = useState<TextBuffer>(
      new TextBuffer({
         initialValue: value,
         onChange: ({ renderedValue, value, cursor }) => {
            setRenderedText(renderedValue);
            setCursor(cursor);
            onChange(value);
         }
      })
   );
   const [visibleArea, setVisibleArea] = useState<{start: number, end: number}>({
      start: 0,
      end: Math.min(visibleHeight, renderedText.split('\n').length)
   });

   useEffect(() => {
      if (cursor.row <= visibleArea.start) {
         const start = cursor.row;
         const end = Math.min((start + visibleHeight), renderedText.split('\n').length)
         return setVisibleArea({ start, end });
      }

      if (cursor.row >= visibleArea.end) {
         const start = visibleArea.start + 1;
         const end = Math.min((start + visibleHeight), renderedText.split('\n').length)
         return setVisibleArea({ start, end });
      }
   }, [cursor.row])

   useInput((input, key) => {
      if (key.upArrow) {
         return textBuffer.moveCursorUp();
      }

      if (key.downArrow) {
         return textBuffer.moveCursorDown();
      }

      if (key.leftArrow) {
         return textBuffer.moveCursorLeft();
      }

      if (key.rightArrow) {
         return textBuffer.moveCursorRight();
      }

      // TODO: Ink input seems to think backspace is delete on my laptop? need to investigate/ file bug
      if (key.backspace || key.delete) {
         return textBuffer.removeAtCursor();
      }

      if (key.return) {
         return textBuffer.insertAtCursor('\n');
      }

      if (key.tab) {
         return textBuffer.insertAtCursor('\t');
      }

      if (input) {
         return textBuffer.insertAtCursor(input);
      }
   });

   return <Text>{renderedText.split('\n').slice(visibleArea.start, visibleArea.end).join('\n')}</Text>
}
