import { useState, useEffect, useCallback } from 'react'
import { getRandomTeam, getDivisionForTeam, AFC_DIVISIONS, NFC_DIVISIONS } from '../nflData'
import TeamCard from './TeamCard'

export default function GuessMode({ onBack }) {
  const [currentTeam, setCurrentTeam] = useState(null)
  const [score, setScore] = useState(0)
  const [totalAttempts, setTotalAttempts] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [isAnswered, setIsAnswered] = useState(false)
  const [usedTeams, setUsedTeams] = useState(new Set())

  const getNewTeam = useCallback(() => {
    let team = getRandomTeam()
    let attempts = 0
    const maxAttempts = 100

    // Avoid showing the same team twice in a row
    while (usedTeams.has(team.name) && attempts < maxAttempts) {
      team = getRandomTeam()
      attempts++
    }

    setCurrentTeam(team)
    setFeedback('')
    setIsAnswered(false)
  }, [usedTeams])

  useEffect(() => {
    getNewTeam()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleGuess = (selectedDivision) => {
    if (isAnswered) return

    const correctDivision = getDivisionForTeam(currentTeam.name)
    const isCorrect = selectedDivision === correctDivision

    setFeedback({
      isCorrect,
      selectedDivision,
      correctDivision
    })
    setIsAnswered(true)
    setTotalAttempts(prev => prev + 1)

    if (isCorrect) {
      setScore(prev => prev + 1)
    }

    setUsedTeams(prev => new Set([...prev, currentTeam.name]))
  }

  const handleNextTeam = () => {
    getNewTeam()
  }

  const renderDivisionButton = (division) => {
    const isSelected = isAnswered && feedback.selectedDivision === division
    const isCorrectAnswer = isAnswered && division === feedback.correctDivision
    let ariaLabel = division
    if (isAnswered) {
      if (isSelected && feedback.isCorrect) {
        ariaLabel = `${division}, correct answer`
      } else if (isSelected && !feedback.isCorrect) {
        ariaLabel = `${division}, incorrect`
      } else if (isCorrectAnswer) {
        ariaLabel = `${division}, this was the correct answer`
      }
    }

    return (
      <button
        key={division}
        className={`division-button ${
          isAnswered
            ? isSelected
              ? feedback.isCorrect
                ? 'correct'
                : 'incorrect'
              : isCorrectAnswer
              ? 'correct-answer'
              : ''
            : ''
        }`}
        onClick={() => handleGuess(division)}
        disabled={isAnswered}
        aria-label={ariaLabel}
      >
        {division}
      </button>
    )
  }

  return (
    <div className="guess-mode">
      <div className="mode-header">
        <button className="icon-back-button" onClick={onBack} title="Back to Menu" aria-label="Back to Menu">←</button>
        <h2>Division Guesser</h2>
      </div>

      {currentTeam && (
        <>
          <div className="current-team">
            <TeamCard team={currentTeam} />
          </div>

          <div className="divisions-columns">
            <div className="afc-column">
              <h3>AFC</h3>
              <div className="divisions-column">
                {AFC_DIVISIONS.map(renderDivisionButton)}
              </div>
            </div>
            <div className="nfc-column">
              <h3>NFC</h3>
              <div className="divisions-column">
                {NFC_DIVISIONS.map(renderDivisionButton)}
              </div>
            </div>
          </div>

          {isAnswered && (
            <div
              className={`feedback ${feedback.isCorrect ? 'success' : 'error'}`}
              role="status"
              aria-live="polite"
            >
              {feedback.isCorrect ? (
                <p>Correct!</p>
              ) : (
                <p>{currentTeam.name} is in the {feedback.correctDivision}.</p>
              )}
              <button className="next-button" onClick={handleNextTeam}>
                Next Team
              </button>
            </div>
          )}

          <div className="score-display">
            Score: {score} / {totalAttempts}
          </div>
        </>
      )}
    </div>
  )
}
