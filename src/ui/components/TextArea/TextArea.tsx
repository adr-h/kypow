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
import { useState } from "react";
import { TextBuffer } from "./TextBuffer";

type Props = {
   value: string;
   onChange: (s: string) => void;
}

export function TextArea({ value, onChange }: Props) {
   const [renderedText, setRenderedText ] = useState<string>(value);
   const [textBuffer] = useState<TextBuffer>(
      new TextBuffer({
         initialValue: value,
         onChange: ({ renderedValue, value }) => {
            setRenderedText(renderedValue);
            onChange(value);
         }
      })
   );

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

      if (input) {
         return textBuffer.insertAtCursor(input);
      }
   });

   return <Text>{renderedText}</Text>
}
