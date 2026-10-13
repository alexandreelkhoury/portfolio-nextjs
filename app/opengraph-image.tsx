import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Alexandre El-Khoury, Software & Blockchain Engineer';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0A0A0A 0%, #111111 50%, #1a1a1a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '60px 80px',
          position: 'relative',
        }}
      >
        {/* Subtle gradient accents */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15), transparent)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            left: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.12), transparent)',
            display: 'flex',
          }}
        />

        {/* Top label */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#10B981',
              display: 'flex',
            }}
          />
          <span
            style={{
              color: '#737373',
              fontSize: '18px',
              fontWeight: 400,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            Portfolio
          </span>
        </div>

        {/* Name */}
        <h1
          style={{
            fontSize: '72px',
            fontWeight: 900,
            background: 'linear-gradient(to bottom right, #fafafa, #a3a3a3)',
            backgroundClip: 'text',
            color: 'transparent',
            lineHeight: 1.1,
            textAlign: 'center',
            margin: '0 0 16px 0',
          }}
        >
          Alexandre El-Khoury
        </h1>

        {/* Title */}
        <p
          style={{
            fontSize: '28px',
            color: '#a3a3a3',
            fontWeight: 500,
            margin: '0 0 40px 0',
          }}
        >
          Software & Blockchain Engineer
        </p>

        {/* Tech badges */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
          }}
        >
          {['Solidity', 'React', 'Node.js', 'DeFi', 'Web3'].map((tech) => (
            <div
              key={tech}
              style={{
                padding: '8px 20px',
                borderRadius: '999px',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.05)',
                color: '#d4d4d4',
                fontSize: '16px',
                display: 'flex',
              }}
            >
              {tech}
            </div>
          ))}
        </div>

        {/* Bottom line */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ color: '#525252', fontSize: '16px' }}>Beirut, Lebanon</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
