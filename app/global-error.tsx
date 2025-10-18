"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Error | Jo-AIMS</title>
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
            max-width: 500px;
          }
          .title {
            font-size: 2rem;
            font-weight: bold;
            color: #dc2626;
            margin-bottom: 1rem;
          }
          .message {
            color: #6b7280;
            margin-bottom: 2rem;
          }
          .button {
            display: inline-block;
            background-color: #2563eb;
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 0.375rem;
            border: none;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          .button:hover {
            background-color: #1d4ed8;
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <h2 className="title">Something went wrong!</h2>
          <p className="message">{error.message || "An unexpected error occurred"}</p>
          <button className="button" onClick={() => reset()}>
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
