import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Phoneme Wordle Builder",
  description: "Build phoneme Wordle",
};

// for everypage, so the header, nav and footer only get written once.
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="header">
          <h1>Assessment 1 - Phoneme Wordle Builder</h1>
        </div>
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}