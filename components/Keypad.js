import { hintFor } from "@/lib/hint";

export default function Keypad({ phonemes, onPick, keyStates, showLetters }) {
  if (!phonemes || phonemes.length === 0) {
    return <p>Loading the sounds...</p>;
  }

  return (
    <div className="keypad">
      {phonemes.map((p) => {
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
            <span className="tip">{hintFor(p)}</span>
          </button>
        );
      })}
    </div>
  );
}
