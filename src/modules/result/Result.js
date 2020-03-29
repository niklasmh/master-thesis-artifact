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

function Result({ ...props }) {
  const canvas = useRef(null)
  const dispatch = useDispatch()
  const { resultCanvasSize } = useSelector(state => state.task)

  useEffect(() => {
    if (canvas.current !== null) {
      dispatch({
        type: 'setResultCanvasContext',
        context: canvas.current.getContext('2d'),
      })
    }
  }, [canvas, dispatch])

  return (
    <StyledModule
      title="Resultat"
      height={resultCanvasSize.h + 'px'}
      width={resultCanvasSize.w + 'px'}
      {...props}
      content={
        <>
          <canvas
            ref={canvas}
            width={resultCanvasSize.w}
            height={resultCanvasSize.h}
          />
          <StyledTimeline style={{ top: resultCanvasSize.h + 24 + 'px' }} />
        </>
      }
    />
  )
}

export default Result
