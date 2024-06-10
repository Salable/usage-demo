export const TickIcon = ({height = 24, width = 24, fill = 'white'}: {height?: number, width?: number, fill?: string}) => {
  return (
 <svg width={`${width}px`} height={`${height}px`} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <polyline fill="none" points="3.7 14.3 9.6 19 20.3 5" stroke={fill} stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
</svg>
  )
}