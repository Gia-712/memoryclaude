export function renderHtml(content: string) {
  return `
    <!DOCTYPE html>
    <html lang="it">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>ZAK → Notion</title>
        <link rel="stylesheet" type="text/css" href="https://static.integrations.cloudflare.com/styles.css">
      </head>
      <body>
        <header>
          <h1>🔗 Ponte ZAK → Notion</h1>
        </header>
        <main>
          <pre><code>${content}</code></pre>
        </main>
      </body>
    </html>
`;
}
