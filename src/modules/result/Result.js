import React from 'react'
import Module from '../../components/Module'

function Result({ size = {}, ...props }) {
  return (
    <Module
      title="Resultat"
      {...props}
      content={<canvas width={size.w} height={size.h} />}
    />
  )
}

export default Result
