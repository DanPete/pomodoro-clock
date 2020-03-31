import React, { useState, useEffect, useRef } from 'react';
import './App.scss';

const convertTimer = (duration) => {
  let minutes = parseInt(duration / 60, 10)
  let seconds = parseInt(duration % 60, 10)

  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;

  return `${minutes}:${seconds}`
}

function App() {
  const [breakDuration, setBreakDuration] = useState(5)
  const [sessionDuration, setSessionDuration] = useState(25)
  const [timerActive, setTimerActive] = useState(false)
  const [timerDisplay, setTimerDisplay] = useState(convertTimer(sessionDuration * 60))
  const [currentTimer, setCurrentTimer] = useState(sessionDuration * 60)
  const [isBreak, setIsBreak] = useState(false)

  const updateSessionDuration = minutes => {
    if (sessionDuration <= 1 || sessionDuration >= 60 ) return false;
    setSessionDuration(minutes)
    if(timerActive) return false;
    setTimerDisplay(convertTimer(minutes * 60))
    setCurrentTimer(minutes * 60)
  }

  const updateBreakDuration = minutes => {
    if (breakDuration <= 1 || breakDuration >= 60) return false;
    setBreakDuration(minutes)
  }

  const togglePlay = () => {
    setTimerActive(!timerActive)
  }

  const timerAudio = useRef()

  const reset = () => {
    setBreakDuration(5)
    setSessionDuration(25)
    setTimerActive(false)
    setCurrentTimer(25 * 60)
    setTimerDisplay(convertTimer(25 * 60))
    setIsBreak(false)
    timerAudio.current.pause()
    timerAudio.current.currentTime = 0
  }

  useEffect(() => {
    let timerInterval = null
    if(timerActive && currentTimer >= 0) {
      let startTime = Date.now()
      timerInterval = setInterval(() => {
        let elapseTime = Math.floor((Date.now() - startTime)/ 1000) ;
        setTimerDisplay(convertTimer(currentTimer))
      
        setCurrentTimer( currentTimer => currentTimer - elapseTime)
        if (currentTimer <= 0) {
          setIsBreak(!isBreak)
          isBreak ? setCurrentTimer(sessionDuration * 60) : setCurrentTimer(breakDuration * 60)
          timerAudio.current.play()
        }
      }, 100)
    } else if (!timerActive) {
      clearInterval(timerInterval)
    }
    return () => clearInterval(timerInterval)
  }, [timerActive, timerDisplay, sessionDuration, currentTimer, breakDuration, isBreak])

  return (
    <div className="App">
      <div className="pomodoro-clock">
        <Settings 
          breakDuration={breakDuration} 
          sessionDuration={sessionDuration} 
          updateSessionDuration={updateSessionDuration} updateBreakDuration={updateBreakDuration}
        />
        <Timer 
          timerActive={timerActive}
          togglePlay={togglePlay}
          timerDisplay={timerDisplay}
          isBreak={isBreak}
          reset={reset}
        />
        <audio id="beep" preload="auto"
          src="https://goo.gl/65cBl1"
          ref={timerAudio}
       />
      </div>
    </div>
  );
}

function Settings({ breakDuration, sessionDuration, updateSessionDuration, updateBreakDuration }) {
  return (
    <div className="settings">
      <DurationControl type="break" duration={breakDuration} updateTimer={updateBreakDuration}  />
      <DurationControl type="session" duration={sessionDuration} updateTimer={updateSessionDuration} />
    </div>
  );
}

function Timer({timerActive, togglePlay, timerDisplay, isBreak, reset}) {
  return (
    <div className="timer">
      <div id="timer-label">{ isBreak ? 'Break' : 'Session' }</div>
      <div id="time-left">{ timerDisplay }</div>
      <div className="timer-control">
        <button id="start_stop" onClick={() => togglePlay()}>{ timerActive ? 'Pause' : 'Play'}</button>
        <button id="reset" onClick={() => reset()}>Reset</button>
      </div>
    </div>
  )
}

function DurationControl({ type, duration, updateTimer }) {
  
  return (
    <div className={`${type} duration`}>
      <div id={`${type}-label`} className="label">{type} Length</div>
      <div className="duration-control">
        <button id={`${type}-decrement`} onClick={() => updateTimer(duration - 1)}>-</button>
        <div id={`${type}-length`}>{duration}</div>
        <button id={`${type}-increment`} onClick={() => updateTimer(duration + 1)}>+</button>
      </div>
    </div>
  )
}

export default App;
