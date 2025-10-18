export default function NotFound() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>404 - Page Not Found | Jo-AIMS</title>
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f9fafb;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .container {
            text-align: center;
            padding: 2rem;
          }
          .title {
            font-size: 4rem;
            font-weight: bold;
            color: #111827;
            margin-bottom: 1rem;
          }
          .subtitle {
            font-size: 1.5rem;
            font-weight: 600;
            color: #374151;
            margin-bottom: 0.5rem;
          }
          .description {
            color: #6b7280;
            margin-bottom: 2rem;
          }
          .button {
            display: inline-block;
            background-color: #2563eb;
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 0.375rem;
            text-decoration: none;
            font-weight: 500;
            transition: background-color 0.2s;
          }
          .button:hover {
            background-color: #1d4ed8;
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <h1 className="title">404</h1>
          <h2 className="subtitle">Page Not Found</h2>
          <p className="description">Sorry, we couldn't find the page you're looking for.</p>
          <a href="/" className="button">
            Go back home
          </a>
        </div>
      </body>
    </html>
  )
}
