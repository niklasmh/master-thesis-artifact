import React, { useState, useMemo } from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'

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

function Timeline(props) {
  const [timePrecision, setTimePrecision] = useState(2)
  const dispatch = useDispatch()
  const {
    time,
    deltaTime,
    totalTime,
    isPlaying,
    runCode,
    editor,
  } = useSelector(state => state)

  function timelineSelectHandler(e) {
    //dispatch({ type: 'setTime', time: time + deltaTime })
  }

  function playControlHandler() {
    if (!isPlaying && time + deltaTime >= totalTime) {
      runCode(editor.current())
      dispatch({
        type: 'setTime',
        time: 0,
      })
    }
    if (time === 0) {
      runCode(editor.current())
    }
    dispatch({
      type: 'setIsPlaying',
      isPlaying: !isPlaying,
    })
  }

  function replayControlHandler() {
    runCode(editor.current())
    dispatch({
      type: 'setIsPlaying',
      isPlaying: false,
    })
    dispatch({
      type: 'setTime',
      time: 0,
    })
  }

  useMemo(() => {
    setTimePrecision((1 / deltaTime).toString().length)
  }, [deltaTime])

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
      <TimelineLine onClick={timelineSelectHandler}>
        <ProgressBar style={{ width: (time / totalTime) * 100 + '%' }} />
      </TimelineLine>
      <DisplayTime>
        t ={' '}
        {deltaTime < 0.01
          ? (+time.toFixed(timePrecision)).toExponential()
          : time.toFixed(2)}
        s{totalTime > 0 ? ` / ${totalTime}s` : ''}
      </DisplayTime>
    </TimelineContainer>
  )
}

export default Timeline
