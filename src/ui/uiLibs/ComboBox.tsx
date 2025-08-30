import React, { useEffect, useState, type ReactNode } from "react";
import { Box, Newline, Text, useInput } from "ink";
import TextInput from "ink-text-input";

type Props<T> = {
   items: T[];
   initialQuery?: string;
   renderItem: (p: { index: number, item: T, highlighted: boolean }) => ReactNode;
   onSelect?: (arg: T) => void;
   onQueryChange?: (s: string) => void;
   filter?: (arg: T) => boolean;
   maxHeight?: number;
   focus?: boolean;
}

export function ComboBox<T>({ items, initialQuery = "", filter, onQueryChange, onSelect, renderItem, focus = true, maxHeight = 10 }: Props<T>) {
   const [query, setQuery] = useState(initialQuery);
   const [highlightIndex, setHighlightIndex] = useState(-1); // -1 = in the input
   const [scrollOffset, setScrollOffset] = useState(0);

   const filtered = filter ? items.filter(filter) : items;

   useInput((input, key) => {
      if (!focus) return;

      if (key.downArrow) {
         setHighlightIndex((i) => {
            const next = Math.min(i + 1, filtered.length - 1);
            if (next >= 0) {
               // adjust scroll window
               if (next >= scrollOffset + maxHeight) {
                  setScrollOffset(next - maxHeight + 1);
               }
            }
            return next;
         });
      } else if (key.upArrow) {
         setHighlightIndex((i) => {
            const next = Math.max(i - 1, -1);
            if (next >= 0) {
               if (next < scrollOffset) {
                  setScrollOffset(next);
               }
            } else {
               setScrollOffset(0); // back to input
            }
            return next;
         });
      } else if (key.return && highlightIndex >= 0) {
         // only fire when selecting from list
         onSelect?.(filtered[highlightIndex]);
      }
      // Note: printable characters / backspace go straight to TextInput, we don’t handle them here
   });

   useEffect(() => {
      setHighlightIndex(-1);
   }, [filtered]);

   useEffect(() => {
      onQueryChange?.(query)
   }, [query])

   const visibleItems = filtered.slice(scrollOffset, scrollOffset + maxHeight);

   return (
      <Box flexDirection="column" gap={0}>
         <Box flexDirection="row" borderStyle="single">
            <Text>{' 🔎 '}</Text>
            <TextInput
               value={query}
               onChange={setQuery}
               onSubmit={() => { }}
               focus={focus}
               showCursor={highlightIndex === -1}
            />
         </Box>
         <Box flexDirection="column">
            {visibleItems.map((item, i) => {
               const absoluteIndex = scrollOffset + i;
               const highlighted = highlightIndex === absoluteIndex;

               return renderItem({ item, highlighted, index: i })
            })}
         </Box>
      </Box>
   );
}
