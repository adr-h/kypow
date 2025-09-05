import { Box, render, Text } from "ink";
import { TextArea } from "./TextArea";
import { useState } from "react";

const TestApp = () => {
   const [value, setValue ] = useState(
`Newasdasdasd
dsadsd
line dsadasd
is asd
here asdasdasd`
);
   return <Box flexDirection="column">
      <TextArea value={value} onChange={setValue} />
      <Text>
         {'------------------\n'}
         {'Actual value:\n'}
         {value}
      </Text>
   </Box>
}

render(<TestApp />);