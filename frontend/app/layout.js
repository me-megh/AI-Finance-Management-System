// app/layout.js

export const metadata = {
    title: "Personal Finance App",
    description: "Track your transactions, income, and expenses",
  };
  
  export default function RootLayout({ children }) {
    return (
      <html lang="en">
        <head>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>{metadata.title}</title>
          <meta name="description" content={metadata.description} />
        </head>
        <body>
          <header>
            {/* <h1>Welcome to the Personal Finance Tracker</h1> */}
          </header>
          <main>{children}</main> {/* This will render the main page */}
          <footer>
            <p>&copy; 2025 Personal Finance App</p>
          </footer>
        </body>
      </html>
    );
  }
  