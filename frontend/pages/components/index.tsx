import { useState, useEffect } from 'react'
import { Wrapper, Stepper, Title, Button } from '../../components/Base'
import Tooltip from '../../components/Tooltip'


const Components = () => {
 
  return <Wrapper>
      <Title>Please connect with Metamask</Title>
      <Stepper>ZK Verification STEP 1/4</Stepper>
      <Button>Connect</Button>
      <Tooltip text="0x123212412123123112312312321"/>
  </Wrapper>
}

export default Components
