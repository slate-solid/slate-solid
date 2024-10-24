export function Test() {
  return (
    <div
      ref={r => {
        console.log('callback ref', r)
      }}
    >
      Test
    </div>
  )
}
