import { Box, render, Text } from "ink";
import { TextArea } from "./TextArea";
import { useState } from "react";

const TestApp = () => {
   const [value, setValue ] = useState(
`Newasdasdasd
dsadsd
line dsadasd
is asd
here asdasdasd
blah blah blah
even more text
lots of text
so much text`
);
   return <Box flexDirection="column">
      <TextArea value={value} onChange={setValue} visibleHeight={3} />
      <Text>
         {'------------------\n'}
         {'Actual value:\n'}
         {value}
      </Text>
   </Box>
}

render(<TestApp />);