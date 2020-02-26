import React from 'react'
import Module from '../../components/Module'

function Goal({ size = {}, ...props }) {
  return (
    <Module
      title="Mål"
      {...props}
      content={<canvas width={size.w} height={size.h} />}
    />
  )
}

export default Goal
