import React, { useEffect, useRef } from 'react'
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

function Result({ ...props }) {
  const canvas = useRef(null)
  const dispatch = useDispatch()
  const { resultCanvasSize } = useSelector(state => state)

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
      {...props}
      content={
        <canvas
          ref={canvas}
          width={resultCanvasSize.w}
          height={resultCanvasSize.h}
        />
      }
    />
  )
}

export default Result