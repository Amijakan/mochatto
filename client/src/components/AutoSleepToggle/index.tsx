import React, { useEffect } from 'react'
import NoSleep from 'nosleep.js'
import { isMobile } from '@/utils'
import { Toggle } from "@/components";
import './style.scss'

const AutoSleepToggle = ({ isAutoSleepDisabled, setAutoSleepDisabled }: { isAutoSleepDisabled: boolean, setAutoSleepDisabled: (arg0: boolean) => void }): JSX.Element => {
  const noSleep = new NoSleep()

  useEffect(() => {
    if (isMobile) {
      isAutoSleepDisabled ? noSleep.enable() : noSleep.disable()
    }
  }, [isAutoSleepDisabled])

  return isMobile ? (
    <div className='autosleep-toggle'>
      <p>Disable auto sleep</p>
      <Toggle selected={isAutoSleepDisabled} setSelected={setAutoSleepDisabled} />
    </div>) : <></>
}

export default AutoSleepToggle
