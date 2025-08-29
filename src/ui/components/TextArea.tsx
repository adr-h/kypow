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