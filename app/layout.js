import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Theme from "@/components/Theme";
import PageTimer from "@/components/PageTimer";

export const metadata = {
  title: "Phoneme Wordle Builder",
  description: "Build phoneme activities",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Theme />
        <PageTimer />

        <div className="header">
          <h1>Assessment 3 - Phoneme Activity Builder</h1>
        </div>

        <Nav />

        <main>{children}</main>

        <Footer />
      </body>
    </html>
  );
}