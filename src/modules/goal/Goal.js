import React from 'react'
import styled from 'styled-components'
import Module from '../../components/Module'

const StyledModule = styled(Module)`
  align-self: flex-start;

  .module-content {
    background: #ddd;

    canvas {
      border-radius: 6px;
    }
  }
`

function Goal({ size = {}, ...props }) {
  return (
    <StyledModule
      title="Mål"
      {...props}
      content={<canvas width={size.w} height={size.h} />}
    />
  )
}

export default Goal
