export interface SvgLetterIconProps {
  children: string
  bg: string
  fg: string
}

/**
 * Render a letter with given bg and fg colors. Used to create icons for docs.
 */
export function SvgLetterIcon(props: SvgLetterIconProps) {
  return (
    <svg
      width="48px"
      height="48px"
      viewBox="0 0 48 48"
      style={`background-color: ${props.bg}`}
    >
      <style>
        {`.text {
          font: 40px Roboto;
        }`}
      </style>
      <text
        x="50%"
        y="50%"
        class="text"
        fill={props.fg}
        dominant-baseline="central"
        text-anchor="middle"
      >
        {props.children}
      </text>
    </svg>
  )
}
