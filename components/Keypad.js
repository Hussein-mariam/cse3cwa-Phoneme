import { phonemes, getHint } from "@/lib/phonemes";

// The phoneme buttons , students have to tap these because there is no key on a normal keyboard for symbols
export default function Keypad({ onPick, keyStates, showLetters }) {
  return (
    <div className="keypad">
      {phonemes.map((p) => {
        let className = "key";
        if (keyStates[p.symbol]) {
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
            <span className="tip">{getHint(p.symbol)}</span>
          </button>
        );
      })}
    </div>
  );
}