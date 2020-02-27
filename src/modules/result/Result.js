import React, { useEffect, useRef, useContext } from 'react'
import styled from 'styled-components'
import Module from '../../components/Module'
import { CanvasContext } from '../../App'

const StyledModule = styled(Module)`
  align-self: flex-start;

  .module-content {
    background: #ddd;

    canvas {
      border-radius: 6px;
    }
  }
`

function Result({ size = {}, ...props }) {
  const canvas = useRef(null)
  const { setCanvasContext } = useContext(CanvasContext)

  useEffect(() => {
    if (canvas.current !== null) {
      setCanvasContext(context => ({
        ...context,
        canvasContext: canvas.current.getContext('2d'),
        setCanvasContext,
      }))
    }
  }, [canvas, setCanvasContext])

  return (
    <StyledModule
      title="Resultat"
      {...props}
      content={<canvas ref={canvas} width={size.w} height={size.h} />}
    />
  )
}

export default Result
