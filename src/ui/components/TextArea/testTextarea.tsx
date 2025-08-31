import { Box, render } from "ink";
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
   return <Box>
      <TextArea value={value} onChange={setValue} />
   </Box>
}

render(<TestApp />);