export default function AboutPage() {
  return (
    <div>
      <h2>About</h2>

      <div className="box">
        <h3>Student details</h3>

        <p>Name: Mariam</p>
        <p>Student number: 21582294</p>
        <p>Subject: CSE3CWA</p>
      </div>

      <div className="box">
        <h3>What this is</h3>

        <p>
          The Phoneme Activity Builder is a website
          for Speech Pathology teachers. It lets a
          teacher build activities that use phoneme
          symbols instead of normal spelling, and
          download them as HTML files that students
          can play in any browser.
        </p>

        <p>
          The word lists, the sounds and the saved
          activities are stored in a database, so a
          teacher can come back and generate the same
          activity again later.
        </p>
      </div>

      <div className="box">
        <h3>The Wordle tool</h3>

        <p>
          Makes a Wordle game where every tile is a
          phoneme instead of a letter. The teacher
          picks a word from one of their lists and
          chooses how many guesses students get. New
          words are added on the Word Lists page
          using the phoneme keypad. Green means it
          is in the right place, yellow means
          it is in the word but somewhere else, and
          grey means it is not in the word. When the
          student wins, the English spelling is shown
          next to the phonemes.
        </p>
      </div>

      <div className="box">
        <h3>The Word Search tool</h3>

        <p>
          Makes a grid of phonemes with a small list
          of words hidden inside it. Words run across,
          down or diagonally. The empty squares are
          filled with phonemes taken from the chosen
          words. Students click the first phoneme of a word
          and then the last one.
        </p>
      </div>

    </div>
  );
}