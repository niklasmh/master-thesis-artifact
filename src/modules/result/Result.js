import React, { useEffect, useRef, useContext } from 'react'
import Module from '../../components/Module'
import { CanvasContext } from '../../App'

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
    <Module
      title="Resultat"
      {...props}
      content={<canvas ref={canvas} width={size.w} height={size.h} />}
    />
  )
}

export default Result
