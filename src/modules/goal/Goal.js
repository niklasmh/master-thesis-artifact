import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'
import Module from '../../components/Module'
import Timeline from '../../components/Timeline'
import { useDispatch, useSelector } from 'react-redux'

const StyledModule = styled(Module)`
  align-self: flex-start;

  .module-content {
    background: #ddd;

    canvas {
      border-radius: 6px;
    }
  }
`

const StyledTimeline = styled(Timeline)`
  position: absolute;
  left: 0;
  right: 0;
  color: #000;
`

function Goal({ ...props }) {
  const canvas = useRef(null)
  const dispatch = useDispatch()
  const { goalCanvasSize } = useSelector((state) => state.task)

  useEffect(() => {
    if (canvas.current !== null) {
      dispatch({
        type: 'setGoalCanvasContext',
        context: canvas.current.getContext('2d'),
      })
    }
  }, [canvas, dispatch])

  return (
    <StyledModule
      title="Løsning"
      height={goalCanvasSize.h + 'px'}
      width={goalCanvasSize.w + 'px'}
      {...props}
      content={
        <>
          <canvas
            ref={canvas}
            width={goalCanvasSize.w}
            height={goalCanvasSize.h}
          />
          <StyledTimeline
            solution={true}
            style={{ top: goalCanvasSize.h + 24 + 'px' }}
          />
        </>
      }
    />
  )
}

export default Goal
