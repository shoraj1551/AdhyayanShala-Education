import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '1rem',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '28rem', margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ 
            fontSize: '3.75rem', 
            fontWeight: 'bold', 
            color: '#111827',
            margin: '0 0 0.5rem 0'
          }}>404</h1>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '600', 
            color: '#374151',
            margin: '0'
          }}>
            Page Not Found
          </h2>
        </div>
        
        <p style={{ 
          color: '#6B7280', 
          fontSize: '1.125rem',
          marginBottom: '1.5rem'
        }}>
          Sorry, the page you are looking for doesn't exist or has been moved.
        </p>
        
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1rem',
          alignItems: 'center'
        }}>
          <Link 
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.5rem 1rem',
              backgroundColor: '#111827',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '0.375rem',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
          >
            Go Home
          </Link>
          
          <Link 
            href="/blog"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.5rem 1rem',
              border: '1px solid #D1D5DB',
              color: '#374151',
              textDecoration: 'none',
              borderRadius: '0.375rem',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
          >
            Browse Blog
          </Link>
        </div>
      </div>
    </div>
  )
}