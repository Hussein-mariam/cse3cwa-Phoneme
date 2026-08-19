import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Theme from "@/components/Theme";

export const metadata = {
  title: "Phoneme Wordle Builder",
  description: "Build phoneme Wordle activities",
};

// for every page, so the header, nav and footer only get written once
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* puts the saved theme back on every page load */}
        <Theme />
        <div className="header">
          <h1>Assessment 1 - Phoneme Wordle Builder</h1>
        </div>
        <Nav />
        {/* children is whatever page the user is on */}
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}