import { ImageResponse } from 'next/og';

// Use edge runtime for OG images
export const runtime = 'edge';

// Use default export instead of named export
export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #8B5C9E 0%, #A174B5 100%)',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '33%',
            zIndex: 0,
          }}
        />
        <div
          style={{
            background: 'white',
            borderRadius: '50%',
            padding: 40,
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            margin: '0 0 32px',
          }}
        >
          <svg width="200" height="200" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="14" fill="#8B5C9E" />
            <path d="M15.5 7.5 C 14.4 7.6, 13.3 8, 12.4 8.7 C 11.7 9.2, 11.2 9.8, 10.8 10.6 C 10.6 11, 10.5 11.3, 10.5 12.5 C 10.5 13.5, 10.6 14, 10.7 14.3 C 11 15.2, 11.6 16.1, 12.3 16.8 C 12.7 17.2, 13.6 17.8, 14.2 18.2 C 14.5 18.4, 15.1 18.7, 15.5 18.9 C 15.9 19.1, 16.5 19.4, 16.8 19.6 C 17.1 19.8, 17.6 20.1, 18 20.3 C 20.7 21.9, 21.8 23.2, 21.8 25.5 C 21.8 27, 21.3 28.1, 20.3 29.1 C 19.3 30.1, 17.6 30.7, 15.7 30.7 C 14.2 30.7, 13 30.4, 11.8 29.7 C 10.9 29.2, 10.1 28.5, 9.7 27.7 C 9.4 27.3, 9.4 27.3, 9.2 27.3 C 9 27.3, 8.6 27.5, 8.6 27.8 C 8.6 27.9, 8.7 28.3, 8.9 28.6 C 10.4 32.2, 12.9 33.7, 16.3 34 C 17 34.1, 18.5 34.1, 19.1 34 C 21.9 33.7, 23.9 32.6, 25 30.5 C 25.6 29.3, 26.1 28.2, 26.1 26.6 C 26.1 25.6, 26 25.1, 25.7 24 C 25.2 22.3, 24.3 21, 22.5 19.7 C 21.9 19.3, 21.2 19, 19.8 18.1 C 19.2 17.8, 18.5 17.4, 18.2 17.3 C 17.9 17.2, 17.1 16.8, 16.5 16.4 C 15 15.3, 13.9 14.4, 13.4 13.2 C 13.2 12.7, 13.1 12.5, 13.1 11 C 13.1 9.5, 13.2 9.3, 13.4 8.7 C 14.1 7.1, 16 6.4, 18.5 6.4 C 20.2 6.4, 21.6 6.8, 22.8 7.8 C 23.4 8.2, 24.1 9.1, 24.3 9.6 C 24.4 9.9, 24.5 10, 24.9 10 C 25.4 10.1, 25.8 9.8, 25.8 9.4 C 25.8 9.2, 25.2 8, 24.8 7.4 C 23.5 5.3, 21 4.4, 17.8 4.3 C 16.8 4.3, 15.2 4.4, 15.5 7.5 Z" fill="white" stroke="none"/>
          </svg>
        </div>
        <h1
          style={{
            fontSize: 64,
            color: '#333',
            fontWeight: 'bold',
            textAlign: 'center',
            margin: '0 0 16px',
            zIndex: 1,
          }}
        >
          Sports Orthopedics Institute
        </h1>
        <p
          style={{
            fontSize: 28,
            color: '#666',
            textAlign: 'center',
            maxWidth: '80%',
            margin: 0,
            zIndex: 1,
          }}
        >
          Excellence in Motion - Specialized Orthopedic Care
        </p>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
} 