import { useState, useEffect, useCallback } from 'react'
import { getRandomTeam, getDivisionForTeam } from '../nflData'
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
    setTotalAttempts(totalAttempts + 1)

    if (isCorrect) {
      setScore(score + 1)
    }

    setUsedTeams(new Set([...usedTeams, currentTeam.name]))
  }

  const handleNextTeam = () => {
    getNewTeam()
  }

  const afcDivisions = ['AFC North', 'AFC East', 'AFC South', 'AFC West']
  const nflDivisions = ['NFC North', 'NFC East', 'NFC South', 'NFC West']

  const renderDivisionButton = (division) => (
    <button
      key={division}
      className={`division-button ${
        isAnswered
          ? feedback.selectedDivision === division
            ? feedback.isCorrect
              ? 'correct'
              : 'incorrect'
            : division === feedback.correctDivision
            ? 'correct-answer'
            : ''
          : ''
      }`}
      onClick={() => handleGuess(division)}
      disabled={isAnswered}
    >
      {division}
    </button>
  )

  return (
    <div className="guess-mode">
      <div className="mode-header">
        <button className="icon-back-button" onClick={onBack} title="Back to Menu">←</button>
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
                {afcDivisions.map(renderDivisionButton)}
              </div>
            </div>
            <div className="nfc-column">
              <h3>NFC</h3>
              <div className="divisions-column">
                {nflDivisions.map(renderDivisionButton)}
              </div>
            </div>
          </div>

          {isAnswered && (
            <div className={`feedback ${feedback.isCorrect ? 'success' : 'error'}`}>
              {feedback.isCorrect ? (
                <p>✓ Correct!</p>
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
