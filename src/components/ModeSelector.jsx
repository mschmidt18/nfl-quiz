export default function ModeSelector({ onSelectMode }) {
  return (
    <div className="mode-selector">
      <h1>NFL Division Quiz</h1>
      <p className="subtitle">Test your knowledge of NFL divisions</p>

      <div className="mode-buttons">
        <button
          className="mode-button guess-mode"
          onClick={() => onSelectMode('guess')}
        >
          <div className="button-title">Division Guesser</div>
          <div className="button-description">
            See a random team and guess which division it belongs to
          </div>
        </button>

        <button
          className="mode-button assign-mode"
          onClick={() => onSelectMode('assign')}
        >
          <div className="button-title">Division Picker</div>
          <div className="button-description">
            Drag and drop all 32 teams to their correct divisions
          </div>
        </button>

        <button
          className="mode-button"
          onClick={() => onSelectMode('qbPicker')}
        >
          <div className="button-title">QB Picker</div>
          <div className="button-description">
            Match each starting quarterback to their NFL team
          </div>
        </button>
      </div>
    </div>
  );
}
