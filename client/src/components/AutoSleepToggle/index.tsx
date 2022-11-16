import React, { useEffect } from 'react'
import NoSleep from 'nosleep.js'
import { isMobile } from '@/utils'
import { Toggle } from "@/components";
import './style.scss'

const AutoSleepToggle = ({ noSleepEnabled, setNoSleepEnabled }: { noSleepEnabled: boolean, setNoSleepEnabled: (arg0: boolean) => void }): JSX.Element => {
  const noSleep = new NoSleep()

  useEffect(() => {
    if (isMobile) {
      noSleepEnabled ? noSleep.enable() : noSleep.disable()
    }
  }, [noSleepEnabled])

  return isMobile ? (
    <div className='autosleep-toggle'>
      <p>Disable auto sleep</p>
      <Toggle selected={noSleepEnabled} setSelected={setNoSleepEnabled} />
    </div>) : <></>
}

export default AutoSleepToggle
