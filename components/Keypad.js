import { hintFor } from "@/lib/hint";

// The phoneme buttons. The list now arrives as a prop, because it is loaded
// from the database rather than read from a file.
export default function Keypad({ phonemes, onPick, keyStates, showLetters }) {
  if (!phonemes || phonemes.length === 0) {
    return <p>Loading the sounds...</p>;
  }

  return (
    <div className="keypad">
      {phonemes.map((p) => {
        // keyStates remembers the colour this phoneme got in an earlier guess.
        let className = "key";
        if (keyStates && keyStates[p.symbol]) {
          className = "key " + keyStates[p.symbol];
        }

        return (
          <button
            key={p.symbol}
            className={className}
            onClick={() => onPick(p.symbol)}
          >
            {p.symbol}
            {showLetters && <span className="small">{p.letters}</span>}
            {/* the hint box, hidden by CSS until you hover or tab onto the key */}
            <span className="tip">{hintFor(p)}</span>
          </button>
        );
      })}
    </div>
  );
}
