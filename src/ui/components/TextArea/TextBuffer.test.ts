import { TextBuffer } from './TextBuffer';
import { describe, it, expect } from 'vitest'

describe('TextBuffer', () => {
  describe('constructor', () => {
    it('should initialize with a given value', () => {
      const buffer = new TextBuffer({ initialValue: 'hello\nworld' });
      expect(buffer.lines).toEqual(['hello', 'world']);
    });

    it('should initialize cursor at 0,0 by default', () => {
      const buffer = new TextBuffer({ initialValue: 'hello' });
      expect(buffer.cursor).toEqual({ row: 0, col: 0 });
    });

    it('should initialize with a given cursor position', () => {
      const buffer = new TextBuffer({
        initialValue: 'hello',
        initialCursor: { row: 0, col: 2 },
      });
      expect(buffer.cursor).toEqual({ row: 0, col: 2 });
    });

    it('should throw if given out-of-bounds cursor', () => {
      expect(() => new TextBuffer({
        initialValue: 'hello',
        initialCursor: { row: -10, col: 20 },
      })).toThrowError('Destination is out of bounds!')
    });
  });

  describe('moveCursorLeft', () => {
    it('should move cursor left on the same line', () => {
      const buffer = new TextBuffer({
        initialValue: 'hello',
        initialCursor: { row: 0, col: 2 },
      });
      buffer.moveCursorLeft();
      expect(buffer.cursor).toEqual({ row: 0, col: 1 });
    });

    it('should not move cursor if at the beginning of the first line', () => {
      const buffer = new TextBuffer({
        initialValue: 'hello',
        initialCursor: { row: 0, col: 0 },
      });
      buffer.moveCursorLeft();
      expect(buffer.cursor).toEqual({ row: 0, col: 0 });
    });

    it('should wrap to the end of the previous line', () => {
      const buffer = new TextBuffer({
        initialValue: 'first\nsecond',
        initialCursor: { row: 1, col: 0 },
      });

      buffer.moveCursorLeft();
      expect(buffer.cursor).toEqual({ row: 0, col: 5 });
    });
  });

  describe('moveCursorRight', () => {
    const initialValue = 'ab\ncd';
    it('should move cursor right on the same line', () => {
      const buffer = new TextBuffer({
        initialValue,
        initialCursor: { row: 0, col: 0 },
      });
      buffer.moveCursorRight();
      expect(buffer.cursor).toEqual({ row: 0, col: 1 });
    });

    it('should move cursor to the beginning of the next line', () => {
      const buffer = new TextBuffer({
        initialValue,
        initialCursor: { row: 0, col: 2 }, // at the end of 'ab'
      });
      buffer.moveCursorRight();
      expect(buffer.cursor).toEqual({ row: 1, col: 0 });
    });

    it('should not move cursor if at the end of the buffer', () => {
        const buffer = new TextBuffer({
            initialValue: 'ab\ncd',
            initialCursor: { row: 1, col: 2 },
        });

        buffer.moveCursorRight();
        expect(buffer.cursor).toEqual({ row: 1, col: 2 });
    });
  });

  describe('moveCursorUp', () => {
    const initialValue = 'long line\nshort';

    it('should move cursor up to the previous line, same column', () => {
      const buffer = new TextBuffer({
        initialValue,
        initialCursor: { row: 1, col: 2 },
      });

      buffer.moveCursorUp();
      expect(buffer.cursor).toEqual({ row: 0, col: 2 });
    });

    it('should move cursor up, clamping column to end of shorter line', () => {
      const buffer = new TextBuffer({
        initialValue: 'short\nlong line',
        initialCursor: { row: 1, col: 7 },
      });

      buffer.moveCursorUp();
      expect(buffer.cursor).toEqual({ row: 0, col: 5 });
    });

    it('should move to column 0 if on the first row', () => {
      const buffer = new TextBuffer({
        initialValue,
        initialCursor: { row: 0, col: 5 },
      });

      buffer.moveCursorUp();
      expect(buffer.cursor).toEqual({ row: 0, col: 0 });
    });
  });

  describe('moveCursorDown', () => {
    const initialValue = 'short\nlong line';

    it('should move cursor down to the next line, same column', () => {
      const buffer = new TextBuffer({
        initialValue,
        initialCursor: { row: 0, col: 2 },
      });

      buffer.moveCursorDown();
      expect(buffer.cursor).toEqual({ row: 1, col: 2 });
    });

    it('should move cursor down, clamping column to end of shorter line', () => {
      const buffer = new TextBuffer({
        initialValue: 'long line\nshort',
        initialCursor: { row: 0, col: 7 },
      });

      buffer.moveCursorDown();
      expect(buffer.cursor).toEqual({ row: 1, col: 5 });
    });

    it('should move to the end of the line if on the last line', () => {
        const buffer = new TextBuffer({
            initialValue: 'short\nlong line',
            initialCursor: { row: 1, col: 2 },
        });

        buffer.moveCursorDown();
        expect(buffer.cursor).toEqual({ row: 1, col: 9 });
    });
  });

  describe('insertAtCursor', () => {
    it('should be able to insert multi-line input at the beginning, and move cursor accordingly', () => {
      const buffer = new TextBuffer({
        initialValue: 'first line\nsecond line\nthird line',
        initialCursor: { row: 0, col: 10 },
      });

      buffer.insertAtCursor('_this should\nslot between\ndalines_')

      expect(buffer.lines.join('\n')).toEqual(
        `first line_this should\nslot between\ndalines_\nsecond line\nthird line`
      )

      expect(buffer.cursor).toEqual({
        col: 8,
        row: 2
      })
    })

    it('should be able to insert single-line input at the beginning and move cursor accordingly', () => {
      const buffer = new TextBuffer({
        initialValue: 'first line\nsecond line\nthird line',
        initialCursor: { row: 0, col: 10 },
      });

      buffer.insertAtCursor('_this should be on the first line_')
      expect(buffer.lines.join('\n')).toEqual(
        `first line_this should be on the first line_\nsecond line\nthird line`
      )

      expect(buffer.cursor).toEqual({
        row: 0,
        col: 44
      })
    })

    it('should be able to insert multi-line input at the middle and move cursor accordingly', () => {
      const buffer = new TextBuffer({
        initialValue: 'first line\nsecond line\nthird line',
        initialCursor: { row: 0, col: 5 },
      });

      buffer.insertAtCursor('_this should\nslot between\ndalines_')
      expect(buffer.lines.join('\n')).toEqual(
        `first_this should\nslot between\ndalines_ line\nsecond line\nthird line`
      )

      expect(buffer.cursor).toEqual({
        row: 2,
        col: 8
      })
    });

    it('should be able to insert single-line input at the end and move cursor accordingly', () => {
      const buffer = new TextBuffer({
        initialValue: 'first line\nsecond line\nthird line',
        initialCursor: { row: 2, col: 10 },
      });

      buffer.insertAtCursor('_this should_stay_')
      expect(buffer.lines.join('\n')).toEqual(
        'first line\nsecond line\nthird line_this should_stay_'
      )

      expect(buffer.cursor).toEqual({
        row: 2,
        col: 28
      })
    });

    it('should be able to insert multi-line input at the end and move cursor accordingly', () => {
      const buffer = new TextBuffer({
        initialValue: 'first line\nsecond line\nthird line',
        initialCursor: { row: 2, col: 10 },
      });

      buffer.insertAtCursor('_this should\nslot between\ndalines_')
      expect(buffer.lines.join('\n')).toEqual(
        'first line\nsecond line\nthird line_this should\nslot between\ndalines_'
      )

      expect(buffer.cursor).toEqual({
        row: 4,
        col: 8
      })
    });

  });

  describe('removeAtCursor', () => {

    it('should remove when at the middle of a line, and move cursor accordingly', () => {
      const buffer = new TextBuffer({
        initialValue: 'first line\nsecond line\nthird line',
        initialCursor: { row: 1, col: 6 },
      });

      buffer.removeAtCursor();

      expect(buffer.lines.join('\n')).toEqual(
        `first line\nsecon line\nthird line`
      )

      expect(buffer.cursor).toEqual({
        col: 5,
        row: 1
      })
    })

    it('should concatenate the current and preceeding lines when at the beginning of a line, and move cursor accordingly', () => {
      const buffer = new TextBuffer({
        initialValue: 'first line\nsecond line\nthird line',
        initialCursor: { row: 1, col: 0 },
      });

      buffer.removeAtCursor();

      expect(buffer.lines.join('\n')).toEqual(
        `first linesecond line\nthird line`
      )

      expect(buffer.cursor).toEqual({
        col: 21,
        row: 0
      })
    });

    it('should abort when at beginning of the first line, and not move cursor', () => {
      const buffer = new TextBuffer({
        initialValue: 'first line\nsecond line\nthird line',
        initialCursor: { row: 0, col: 0 },
      });

      buffer.removeAtCursor();

      expect(buffer.lines.join('\n')).toEqual(
        'first line\nsecond line\nthird line'
      )

      expect(buffer.cursor).toEqual({
        col: 0,
        row: 0
      })
    });

  });

  describe('Grapheme cluster support', () => {
    it('should treat multi-byte characters as a single unit when moving left', () => {
      const buffer = new TextBuffer({
        initialValue: 'a👍c',
        initialCursor: { row: 0, col: 2 },
      });
      buffer.moveCursorLeft();
      expect(buffer.cursor).toEqual({ row: 0, col: 1 });
      buffer.moveCursorLeft();
      expect(buffer.cursor).toEqual({ row: 0, col: 0 });
    });

    it('should treat multi-byte characters as a single unit when moving right', () => {
      const buffer = new TextBuffer({
        initialValue: 'a👍c',
        initialCursor: { row: 0, col: 0 },
      });
      buffer.moveCursorRight();
      expect(buffer.cursor).toEqual({ row: 0, col: 1 });
      buffer.moveCursorRight();
      expect(buffer.cursor).toEqual({ row: 0, col: 2 });
    });

    it('should handle complex emoji graphemes when moving left', () => {
      const buffer = new TextBuffer({
        initialValue: '👨‍👩‍👧‍👦',
        initialCursor: { row: 0, col: 1 },
      });
      buffer.moveCursorLeft();
      expect(buffer.cursor).toEqual({ row: 0, col: 0 });
    });

    it('should handle complex emoji graphemes when moving right', () => {
      const buffer = new TextBuffer({
        initialValue: '👨‍👩‍👧‍👦',
        initialCursor: { row: 0, col: 0 },
      });
      buffer.moveCursorRight();
      expect(buffer.cursor).toEqual({ row: 0, col: 1 });
    });

    it('should wrap to previous line correctly with multi-byte chars', () => {
      const buffer = new TextBuffer({
        initialValue: 'abc👍\ndef',
        initialCursor: { row: 1, col: 0 },
      });
      buffer.moveCursorLeft();
      expect(buffer.cursor).toEqual({ row: 0, col: 4 });
    });

    it('should wrap to next line correctly with multi-byte chars', () => {
      const buffer = new TextBuffer({
        initialValue: 'abc👍\ndef',
        initialCursor: { row: 0, col: 4 },
      });
      buffer.moveCursorRight();
      expect(buffer.cursor).toEqual({ row: 1, col: 0 });
    });
  });
});