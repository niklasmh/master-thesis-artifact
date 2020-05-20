import React, { useState, useEffect, useRef, useMemo } from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'

import { wrapLoopCode } from '../modules'

const TimelineContainer = styled.div`
  color: #ddd;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 1.2em;
  box-sizing: border-box;
  font-size: 0.8em;
`

const TimelineLine = styled.div`
  flex: 1 0 auto;
  height: 4px;
  border-radius: 2px;
  background-color: #0008;
  position: relative;
`

const ProgressBar = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  background-color: #0008;
  border-radius: 2px;
`

const PlayControl = styled.div`
  margin-right: 0.8em;
  cursor: pointer;
`

const DisplayTime = styled.div`
  margin-left: 0.8em;
`

function Timeline({ solution = false, ...props }) {
  const [timePrecision, setTimePrecision] = useState(2)
  const [solutionTimePrecision, setSolutionTimePrecision] = useState(2)
  const dispatch = useDispatch()
  const {
    time,
    deltaTime,
    totalTime,
    solutionDeltaTime,
    solutionTotalTime,
    isPlaying,
    isEngineReady,
    codeEditorRun,
    runCode,
  } = useSelector((state) => state.task)
  const [localTime, setLocalTime] = useState(0)
  const [hasLoop, setHasLoop] = useState(false)

  const prevLocalTime = useRef(0)
  useEffect(() => {
    if (solution) {
      if (
        prevLocalTime.current + solutionDeltaTime <= time ||
        time >= solutionTotalTime ||
        time === 0 ||
        solutionTotalTime === 0
      ) {
        prevLocalTime.current = time
        setLocalTime(
          solutionTotalTime === 0 ? time : Math.min(time, solutionTotalTime)
        )
      }
    } else {
      if (
        prevLocalTime.current + deltaTime <= time ||
        time >= totalTime ||
        time === 0 ||
        totalTime === 0
      ) {
        prevLocalTime.current = time
        setLocalTime(totalTime === 0 ? time : Math.min(time, totalTime))
      }
    }
  }, [time])

  useEffect(() => {
    if (isEngineReady) {
      if (solution) {
        if (!hasLoop && window.pyodide.globals.__loop__) {
          setHasLoop(true)
        } else if (hasLoop && !window.pyodide.globals.__loop__) {
          setHasLoop(false)
        }
      } else {
        if (!hasLoop && window.pyodide.globals.loop) {
          setHasLoop(true)
        } else if (hasLoop && !window.pyodide.globals.loop) {
          setHasLoop(false)
        }
      }
    }
  }, [time, isPlaying, isEngineReady])

  function timelineSelectHandler(e) {
    //dispatch({ type: 'setTime', time: time + deltaTime })
  }

  async function playControlHandler() {
    let success = false
    if (!isPlaying && totalTime > 0 && time + deltaTime >= totalTime) {
      codeEditorRun()
      dispatch({
        type: 'setTime',
        time: 0,
        deltaTime: 0.02,
        totalTime: 0,
        solutionDeltaTime: 0.02,
        solutionTotalTime: 0,
      })
    } else if (time === 0) {
      codeEditorRun()
    }
    dispatch({
      type: 'setIsPlaying',
      isPlaying: !isPlaying,
    })
  }

  async function replayControlHandler() {
    const error = await codeEditorRun()
    dispatch({
      type: 'setTime',
      time: 0,
      deltaTime: 0.02,
      totalTime: 0,
      solutionDeltaTime: 0.02,
      solutionTotalTime: 0,
    })
    dispatch({
      type: 'setIsPlaying',
      isPlaying: false,
      withError: error,
    })
  }

  useMemo(() => {
    if (!solution) {
      setTimePrecision((1 / deltaTime).toString().length)
    }
  }, [deltaTime])

  useMemo(() => {
    if (solution) {
      setSolutionTimePrecision((1 / solutionDeltaTime).toString().length)
    }
  }, [solutionDeltaTime])

  if (!hasLoop) {
    return <div style={{ display: 'none' }} />
  }

  return (
    <TimelineContainer {...props}>
      <PlayControl onClick={playControlHandler}>
        {isPlaying ? (
          <i className="fas fa-pause" />
        ) : (
          <i className="fas fa-play" />
        )}
      </PlayControl>
      <PlayControl onClick={replayControlHandler}>
        <i className="fas fa-undo" />
      </PlayControl>
      {solution ? (
        <>
          {solutionTotalTime > 0 ? (
            <TimelineLine onClick={timelineSelectHandler}>
              <ProgressBar
                style={{
                  width: Math.min(1, localTime / solutionTotalTime) * 100 + '%',
                }}
              />
            </TimelineLine>
          ) : null}
          <DisplayTime>
            t ={' '}
            {solutionDeltaTime < 0.01
              ? (+localTime.toFixed(solutionTimePrecision)).toExponential()
              : localTime.toFixed(2)}
            s{solutionTotalTime > 0 ? ` / ${solutionTotalTime}s` : ''}
          </DisplayTime>
        </>
      ) : (
        <>
          {totalTime > 0 ? (
            <TimelineLine onClick={timelineSelectHandler}>
              <ProgressBar
                style={{
                  width: Math.min(1, localTime / totalTime) * 100 + '%',
                }}
              />
            </TimelineLine>
          ) : null}
          <DisplayTime>
            t ={' '}
            {deltaTime < 0.01
              ? (+localTime.toFixed(timePrecision)).toExponential()
              : localTime.toFixed(2)}
            s{totalTime > 0 ? ` / ${totalTime}s` : ''}
          </DisplayTime>
        </>
      )}
    </TimelineContainer>
  )
}

export default Timeline
