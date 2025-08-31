import GraphemeSplitter from 'grapheme-splitter';

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
      { initialCursor, initialValue, onChange } :
      {
         initialCursor?: Cursor,
         initialValue: string,
         onChange?: (renderedValue: string) => void
      }
   ) {
      this.cursor = initialCursor || { col: 0, row: 0 };
      this.lines = initialValue.split('\n');
      this.onChange = onChange;
   }

   getColumnsForRow(rowIndex: number) {
      return splitter.splitGraphemes(this.lines[rowIndex]);
   }

   lastColumnIndexOfRow(rowIndex: number) {
      return this.getColumnsForRow(rowIndex).length - 1;
   }

   lastRowIndex(){
      return this.cursor.row - 1;
   }

   moveCursorLeft() {
      const isStartOfRow = this.cursor.col === 0;
      const isFirstRow = this.cursor.row === 0;

      if (isStartOfRow) {
         if (isFirstRow) return; // at 0, 0; nothing to do, just return.

         const newRowIndex = this.cursor.row -1;
         const newColIndex = Math.min(this.cursor.col, this.lastColumnIndexOfRow(newRowIndex))

         this.cursor = {
            row: newRowIndex,
            col: newColIndex
         }

         return;
      }

      this.cursor = {
         col: this.cursor.col - 1,
         row: this.cursor.row
      }
   }

   moveCursorRight() {
      const isEndOfRow = this.cursor.col === this.lastColumnIndexOfRow(this.cursor.row);
      const isLastRow = this.lastRowIndex();

      if (isEndOfRow) {
         if(isLastRow) return;

         const newRow = this.cursor.row + 1;
         const newCol = 0;

         this.cursor = {
            col: newCol,
            row: newRow
         }
         return;
      }

      this.cursor = {
         col: this.cursor.col + 1,
         row: this.cursor.row
      }
   }

   /**
    * TODO:
    * moveCursorUp
    * moveCursorDown
    * insertAtCursor
    * removeAtCursor
    * render
    * renderWithCursor
    * triggerChangeHook
    */
}