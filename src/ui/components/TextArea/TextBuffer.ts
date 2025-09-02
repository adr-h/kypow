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

   private getColumnsForRow(rowIndex: number) {
      return splitter.splitGraphemes(this.lines[rowIndex]);
   }

   private lastColumnIndex(rowIndex: number) {
      return this.getColumnsForRow(rowIndex).length - 1;
   }

   private lastRowIndex(){
      return this.lines.length - 1;
   }

   private isValidCursor({ col, row }: Cursor) {
      if (row > this.lastRowIndex() || row < 0) {
         return false;
      }

      if (col > this.lastColumnIndex(row) || col < 0) {
         return false;
      }

      return true;
   }

   // TODO: maybe just use class setter?
   private moveCursorTo({ col, row }:{ col: number, row: number }) {
      if (!this.isValidCursor({ col, row })) {
         throw new Error(`Destination ${{col, row}} is out of bounds!`)
      }
      this.cursor = { col, row };
   }

   moveCursorLeft() {
      const isStartOfRow = this.cursor.col === 0;
      const isFirstRow = this.cursor.row === 0;

      if (isStartOfRow) {
         if (isFirstRow) return; // at 0, 0; nothing to do, just return.

         const newRowIndex = this.cursor.row - 1;
         const newColIndex = this.lastColumnIndex(newRowIndex);

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
      const isEndOfRow = this.cursor.col === this.lastColumnIndex(this.cursor.row);
      const isLastRow = this.cursor.row === this.lastRowIndex();

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
      const isLastRow = this.cursor.row === this.lastRowIndex();
      if (isLastRow) {
         return this.moveCursorTo({
            row: this.cursor.row,
            col: this.lastColumnIndex(this.cursor.row)
         });
      };

      const newRowIndex = this.cursor.row + 1;
      const newColIndex = Math.min(this.cursor.col, this.lastColumnIndex(newRowIndex));

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
      const newColIndex = Math.min(this.cursor.col, this.lastColumnIndex(newRowIndex));

      return this.moveCursorTo({
         col: newColIndex,
         row: newRowIndex
      });
   }

   /**
    * TODO:
    * insertAtCursor
    * removeAtCursor
    * render
    * renderWithCursor
    * triggerChangeHook
    */
}