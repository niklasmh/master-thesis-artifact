import React from 'react'
import MaterialIcon from 'material-icons-react'

export default function Icon({
  name = '',
  color = 'inherit',
  size = '1em',
  style = {},
  onClick = () => {},
  ...props
}) {
  let icon = name || 'insert_emoticon'

  if (!name) {
    const propArray = Object.keys(props).filter((e) => e[0] === '_')

    if (propArray.length) {
      delete props[propArray[0]]
      icon = propArray[0].slice(1)
    }
  }

  return (
    <MaterialIcon
      icon={icon}
      onClick={onClick}
      styleOverride={{
        verticalAlign: 'bottom',
        color,
        cursor: !!onClick ? 'pointer' : 'default',
        minWidth: '1em',
        minHeight: '1em',
        fontSize: size,
        ...style,
      }}
      {...props}
    />
  )
}
