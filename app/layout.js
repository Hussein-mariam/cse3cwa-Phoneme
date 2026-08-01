import "./globals.css";

export const metadata = {
  title: "Phoneme Wordle Builder",
  description: "Build phoneme Wordle activities",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="header">
          <h1>Assessment 1 - Phoneme Wordle Builder</h1>
        </div>
        <main>{children}</main>
        <footer>
          <p>Mariam - 21582294</p>
        </footer>
      </body>
    </html>
  );
}