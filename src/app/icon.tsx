import { ImageResponse } from 'next/og'
 
// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'
 
// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 18,
          fontWeight: '900',
          background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          letterSpacing: '0.5px',
          borderRadius: '4px',
        }}
      >
        JM
      </div>
    ),
    {
      ...size,
    }
  )
}
