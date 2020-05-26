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

      :first-of-type {
        opacity: 1;
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

function Goal({ ...props }) {
  const canvas = useRef(null)
  const traceCanvas = useRef(null)
  const dispatch = useDispatch()
  const { goalCanvasSize, solutionScale, solutionPosition } = useSelector(
    (state) => state.task
  )
  const [canvasPosition, setCanvasPosition] = useState({ x: -1, y: -1 })
  const [mouseDown, setMouseDown] = useState(false)
  const [mouseDownPosition, setMouseDownPosition] = useState({ x: -1, y: -1 })
  const [mouseUpPosition, setMouseUpPosition] = useState({ x: -1, y: -1 })
  const [mousePosition, setMousePosition] = useState({ x: -1, y: -1 })
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 })

  const prevScale = useRef(5)
  useEffect(() => {
    if (canvas.current !== null) {
      dispatch({
        type: 'setGoalCanvasContext',
        context: canvas.current.getContext('2d'),
      })
      canvas.current.addEventListener('wheel', (e) => {
        e.stopPropagation()
        e.preventDefault()
        prevScale.current -= e.deltaY / 1000
        dispatch({
          type: 'setScale',
          solutionScale: prevScale.current,
        })
      })
    }
  }, [canvas, dispatch])

  useEffect(() => {
    prevScale.current = solutionScale
  }, [solutionScale])

  useEffect(() => {
    if (traceCanvas.current !== null) {
      dispatch({
        type: 'setTraceGoalCanvasContext',
        context: traceCanvas.current.getContext('2d'),
      })
    }
  }, [traceCanvas, dispatch])

  useEffect(() => {
    if (mouseDown) {
      const x = startPosition.x + mousePosition.x - mouseDownPosition.x
      const y = startPosition.y + mousePosition.y - mouseDownPosition.y
      dispatch({
        type: 'setPosition',
        solutionPosition: { x, y },
      })
    }
  }, [mouseDown, mouseDownPosition, mousePosition, startPosition, dispatch])

  return (
    <StyledModule
      title="Fasit"
      height={goalCanvasSize.h + 'px'}
      width={goalCanvasSize.w + 'px'}
      {...props}
      content={
        <>
          <canvas
            ref={traceCanvas}
            width={goalCanvasSize.w}
            height={goalCanvasSize.h}
          />
          <canvas
            ref={canvas}
            width={goalCanvasSize.w}
            height={goalCanvasSize.h}
            onMouseDown={(e) => {
              setMouseDown(true)
              const { left, top } = canvas.current.getBoundingClientRect()
              setCanvasPosition({ x: left, y: top })
              setStartPosition(solutionPosition)
              setMouseDownPosition({ x: e.clientX - left, y: e.clientY - top })
              setMousePosition({
                x: e.clientX - left,
                y: e.clientY - top,
              })
            }}
            onMouseMove={(e) => {
              setMousePosition({
                x: e.clientX - canvasPosition.x,
                y: e.clientY - canvasPosition.y,
              })
            }}
            onMouseUp={(e) => {
              setMouseDown(false)
              setMousePosition({
                x: e.clientX - canvasPosition.x,
                y: e.clientY - canvasPosition.y,
              })
              setMouseUpPosition({
                x: e.clientX - canvasPosition.x,
                y: e.clientY - canvasPosition.y,
              })
            }}
            onMouseOut={(e) => {
              setMouseDown(false)
              setMousePosition({
                x: e.clientX - canvasPosition.x,
                y: e.clientY - canvasPosition.y,
              })
              setMouseUpPosition({
                x: e.clientX - canvasPosition.x,
                y: e.clientY - canvasPosition.y,
              })
            }}
          />
          <StyledTimeline solution={true} style={{ bottom: '12px' }} />
        </>
      }
    />
  )
}

export default Goal
