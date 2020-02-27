import React, { useRef, useEffect } from 'react'
import styled from 'styled-components'
import Module from '../../components/Module'
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

function Goal({ ...props }) {
  const canvas = useRef(null)
  const dispatch = useDispatch()
  const { goalCanvasSize } = useSelector(state => state)

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
      title="Mål"
      {...props}
      content={
        <canvas
          ref={canvas}
          width={goalCanvasSize.w}
          height={goalCanvasSize.h}
        />
      }
    />
  )
}

export default Goal
