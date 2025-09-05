import GraphemeSplitter from 'grapheme-splitter';
import type { L } from 'vitest/dist/chunks/reporters.d.BFLkQcL6.js';

type Cursor = {
   col: number;
   row: number;
}

const splitter = new GraphemeSplitter();

export class TextBuffer {
   cursor: Cursor;
   lines: string[];
   onChange?: (renderedValue: string) => void;

   constructor(
      { initialValue, onChange, initialCursor } :
      {
         initialValue: string,
         initialCursor?: Cursor;
         onChange?: (renderedValue: string) => void
      }
   ) {
      this.lines = initialValue.split('\n');
      this.onChange = onChange;
      this.cursor = { col: 0, row: 0 };

      if (initialCursor) {
         this.moveCursorTo(initialCursor);
      }
   }

   private getGraphemeCount(s: string) {
      return splitter.countGraphemes(s);
   }

   private getColumnsForRow(rowIndex: number) {
      return splitter.splitGraphemes(this.lines[rowIndex]);
   }

   private lastColumnPosition(rowIndex: number) {
      // a cursor can be "after the last column", hence why `length` instead of `length - 1`
      // e.g with | as cursor:
      // |abcd => position 0 (typing here adds text BFORE abcd)
      // a|bcd => position 1 (typing here adds text BETWEEN a and b)
      // abc|d => position 2
      // abcd| => position 3 (typing here adds text AFTER abcd)
      // final index ('d') is 3, but the final place a cursor can be is actually 4
      return this.getColumnsForRow(rowIndex).length;
   }

   private lastRowPosition() {
      // a cursor cannot be "after the last row", hence why length - 1
      return this.lines.length - 1;
   }

   private isValidCursor({ col, row }: Cursor) {
      if (row > this.lastRowPosition() || row < 0) {
         return false;
      }

      if (col > this.lastColumnPosition(row) || col < 0) {
         return false;
      }

      return true;
   }

   // TODO: maybe just use class setter?
   private moveCursorTo({ col, row }:{ col: number, row: number }) {
      if (!this.isValidCursor({ col, row })) {
         throw new Error(`Destination is out of bounds!`)
      }
      this.cursor = { col, row };
   }

   moveCursorLeft() {
      const isStartOfRow = this.cursor.col === 0;
      const isFirstRow = this.cursor.row === 0;

      if (isStartOfRow) {
         if (isFirstRow) return; // at 0, 0; nothing to do, just return.

         const newRowIndex = this.cursor.row - 1;
         const newColIndex = this.lastColumnPosition(newRowIndex);

         return this.moveCursorTo({
            row: newRowIndex,
            col: newColIndex
         })
      }

      return this.moveCursorTo({
         col: this.cursor.col - 1,
         row: this.cursor.row
      });
   }

   moveCursorRight() {
      const isEndOfRow = this.cursor.col === this.lastColumnPosition(this.cursor.row);
      const isLastRow = this.cursor.row === this.lastRowPosition();

      if (isEndOfRow) {
         if (isLastRow) return; //at the very last col of the very last row; nowhere else to go

         const newRow = this.cursor.row + 1;
         const newCol = 0;

         return this.moveCursorTo({
            col: newCol,
            row: newRow
         });
      }

      return this.moveCursorTo({
         col: this.cursor.col + 1,
         row: this.cursor.row
      });
   }

   moveCursorDown() {
      const isLastRow = this.cursor.row === this.lastRowPosition();
      if (isLastRow) {
         return this.moveCursorTo({
            row: this.cursor.row,
            col: this.lastColumnPosition(this.cursor.row)
         });
      };

      const newRowIndex = this.cursor.row + 1;
      const newColIndex = Math.min(this.cursor.col, this.lastColumnPosition(newRowIndex));

      return this.moveCursorTo({
         col: newColIndex,
         row: newRowIndex
      });
   }

   moveCursorUp() {
      const isFirstRow = this.cursor.row === 0;
      if (isFirstRow) {
         return this.moveCursorTo({
            col: 0,
            row: this.cursor.row
         });
      };

      const newRowIndex = this.cursor.row - 1;
      const newColIndex = Math.min(this.cursor.col, this.lastColumnPosition(newRowIndex));

      return this.moveCursorTo({
         col: newColIndex,
         row: newRowIndex
      });
   }

   insertAtCursor(input: string) {
      const insertLines = input.split('\n');
      const lastInsertLineLength = this.getGraphemeCount(insertLines[insertLines.length -1]);

      const currentLine = this.getColumnsForRow(this.cursor.row);
      const startOfCurrentLine = currentLine.slice(0, this.cursor.col).join('');
      const restOfCurrentLine = currentLine.slice(this.cursor.col).join('');

      insertLines[0] = startOfCurrentLine + insertLines[0];
      insertLines[insertLines.length - 1] = insertLines[insertLines.length - 1] + restOfCurrentLine;
      this.lines.splice(this.cursor.row, 1, ...insertLines);

      if (insertLines.length > 1) {
         this.moveCursorTo({
            col: lastInsertLineLength,
            row: this.cursor.row + (insertLines.length - 1),
         });
      } else {
         this.moveCursorTo({
            col: this.cursor.col + lastInsertLineLength,
            row: this.cursor.row
         })
      }
   }

   removeAtCursor() {
      const { col, row } = this.cursor;
      const isFirstCol = col === 0;
      const isFirstRow = row === 0

      if (isFirstCol) {
         // first col of first row; nowhere to go. Abort.
         if (isFirstRow) return;

         const currentLine = this.lines[row];
         const preceedingLineIndex = row - 1;
         const preceedingLine = this.lines[preceedingLineIndex];

         // remove both the preceding line + current line; replace them with a concat of the two
         this.lines.splice(preceedingLineIndex, 2, preceedingLine + currentLine)

         this.moveCursorTo({
            col: (preceedingLine + currentLine).length,
            row: preceedingLineIndex
         })
         return;
      }

      this.lines[row] = this.getColumnsForRow(row)
                        .toSpliced(this.cursor.col - 1, 1)
                        .join('');
      this.moveCursorLeft();

      return;
   }

   /**
    * TODO:
    * render
    * renderWithCursor
    * triggerChangeHook
    */
}