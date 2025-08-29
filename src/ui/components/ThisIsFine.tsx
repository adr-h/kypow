import React from 'react';
import { Text } from "ink";

const graphic =
`
   🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
  🔥                                        🔥
 🔥        🎩                               🔥
   🔥      🐶☕                             🔥
     🔥   <)  )╯                             🔥
   🔥      / /                                🔥
  🔥                                        🔥
 🔥                                        🔥
  🔥        "This is fine."                🔥
   🔥                                     🔥
   🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
`

export function ThisIsFine() {
   return <Text>{graphic}</Text>
}