import { phonemes, getHint } from "@/lib/phonemes";

export default function Keypad({
  onPick,
  keyStates,
  showLetters
}) {
  return (
    <div className="keypad">
      {phonemes.map((phoneme) => {
        let className = "key";

        if (keyStates[phoneme.symbol]) {
          className = "key " + keyStates[phoneme.symbol];
        }

        return (
          <button
            key={phoneme.symbol}
            className={className}
            onClick={() => onPick(phoneme.symbol)}
          >
            {phoneme.symbol}

            {showLetters && (
              <span className="small">
                {phoneme.letters}
              </span>
            )}

            <span className="tip">
              {getHint(phoneme.symbol)}
            </span>
          </button>
        );
      })}
    </div>
  );
}