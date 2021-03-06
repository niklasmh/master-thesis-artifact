import React, { useEffect, useRef, useState } from 'react'
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
      position: absolute;
      top: 0;
      left: 0;
      touch-action: none;

      :last-of-type {
        opacity: 0.8;
      }
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
  const traceCanvas = useRef(null)
  const dispatch = useDispatch()
  const { resultCanvasSize, scale, position } = useSelector(
    (state) => state.task
  )
  const [canvasPosition, setCanvasPosition] = useState({ x: -1, y: -1 })
  const [mouseDown, setMouseDown] = useState(false)
  const [mouseDownPosition, setMouseDownPosition] = useState({ x: -1, y: -1 })
  const [, setMouseUpPosition] = useState({ x: -1, y: -1 })
  const [mousePosition, setMousePosition] = useState({ x: -1, y: -1 })
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 })

  const prevScale = useRef(5)
  useEffect(() => {
    if (canvas.current !== null) {
      dispatch({
        type: 'setResultCanvasContext',
        context: canvas.current.getContext('2d'),
      })
    }
  }, [canvas, dispatch])

  useEffect(() => {
    prevScale.current = scale
  }, [scale])

  useEffect(() => {
    if (traceCanvas.current !== null) {
      dispatch({
        type: 'setTraceResultCanvasContext',
        context: traceCanvas.current.getContext('2d'),
      })
      traceCanvas.current.addEventListener('wheel', (e) => {
        e.stopPropagation()
        e.preventDefault()
        prevScale.current -= e.deltaY / 1000
        dispatch({
          type: 'setScale',
          scale: prevScale.current,
        })
      })
    }
  }, [traceCanvas, dispatch])

  useEffect(() => {
    if (mouseDown) {
      const x = startPosition.x + mousePosition.x - mouseDownPosition.x
      const y = startPosition.y + mousePosition.y - mouseDownPosition.y
      dispatch({
        type: 'setPosition',
        position: { x, y },
      })
    }
  }, [mouseDown, mouseDownPosition, mousePosition, startPosition, dispatch])

  return (
    <StyledModule
      title="Din løsning"
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
          <canvas
            ref={traceCanvas}
            width={resultCanvasSize.w}
            height={resultCanvasSize.h}
            onMouseDown={(e) => {
              setMouseDown(true)
              const { left, top } = canvas.current.getBoundingClientRect()
              setCanvasPosition({ x: left, y: 0 })
              setStartPosition(position)
              setMouseDownPosition({ x: e.clientX - left, y: -e.clientY })
              setMousePosition({
                x: e.clientX - left,
                y: -e.clientY,
              })
            }}
            onMouseMove={(e) => {
              setMousePosition({
                x: e.clientX - canvasPosition.x,
                y: -e.clientY - canvasPosition.y,
              })
            }}
            onMouseUp={(e) => {
              setMouseDown(false)
              setMousePosition({
                x: e.clientX - canvasPosition.x,
                y: -e.clientY - canvasPosition.y,
              })
              setMouseUpPosition({
                x: e.clientX - canvasPosition.x,
                y: -e.clientY - canvasPosition.y,
              })
            }}
            onMouseOut={(e) => {
              setMouseDown(false)
              setMousePosition({
                x: e.clientX - canvasPosition.x,
                y: -e.clientY - canvasPosition.y,
              })
              setMouseUpPosition({
                x: e.clientX - canvasPosition.x,
                y: -e.clientY - canvasPosition.y,
              })
            }}
          />
          <StyledTimeline style={{ bottom: '12px' }} />
        </>
      }
    />
  )
}

export default Result
