import React from 'react';
import { Box, Text } from "ink";
import { Banner } from "../../components/Banner";

export function Home() {
   return <Box flexDirection="column">
      <Banner />
      <Text>- Navigate the sidepanel on the left to select a module</Text>
      <Text>- Press [tab] to toggle focus </Text>
   </Box>
}