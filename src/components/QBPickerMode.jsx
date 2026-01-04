import { useState, useMemo } from 'react'
import { NFL_DIVISIONS, AFC_DIVISIONS, NFC_DIVISIONS, getLogoUrl, TOTAL_TEAMS } from '../nflData'
import { getAllQBs, getQBHeadshotUrl, getTeamForQB } from '../qbData'

export default function QBPickerMode({ onBack }) {
  const [assignments, setAssignments] = useState({}) // { qbName: teamAbbr }
  const [selectedQB, setSelectedQB] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  // Shuffle QBs once on mount
  const [shuffledQBs] = useState(() => getAllQBs())

  // Get all teams flat
  const allTeams = useMemo(() => Object.values(NFL_DIVISIONS).flat(), [])

  // Handle QB selection
  const handleQBTap = (qb) => {
    if (selectedQB?.name === qb.name) {
      setSelectedQB(null)
    } else {
      setSelectedQB(qb)
    }
  }

  // Handle team tap to assign QB
  const handleTeamTap = (team) => {
    if (!selectedQB) return

    // Check if team already has a QB assigned
    const existingQB = Object.entries(assignments).find(([, abbr]) => abbr === team.abbr)
    if (existingQB) return // Team already has QB

    setAssignments({
      ...assignments,
      [selectedQB.name]: team.abbr
    })
    setSelectedQB(null)
  }

  // Handle unassign - tap on assigned QB
  const handleAssignedQBTap = (qbName, e) => {
    e.stopPropagation()
    const qb = shuffledQBs.find(q => q.name === qbName)
    const newAssignments = { ...assignments }
    delete newAssignments[qbName]
    setAssignments(newAssignments)
    setSelectedQB(qb)
  }

  const handleSubmit = () => {
    let correctCount = 0
    shuffledQBs.forEach(qb => {
      const assignedTeam = assignments[qb.name]
      const correctTeam = getTeamForQB(qb.name)
      if (assignedTeam === correctTeam) {
        correctCount++
      }
    })
    setScore(correctCount)
    setSubmitted(true)
  }

  const handleTryAgain = () => {
    setAssignments({})
    setSubmitted(false)
    setScore(0)
    setSelectedQB(null)
  }

  const generateShareableResults = () => {
    const percentage = Math.round((score / TOTAL_TEAMS) * 100)
    let result = `NFL QB Picker: ${score}/${TOTAL_TEAMS} (${percentage}%)\n\n`

    // 4x8 grid representing 32 teams
    const teamOrder = [...AFC_DIVISIONS, ...NFC_DIVISIONS].flatMap(div =>
      NFL_DIVISIONS[div].map(t => t.abbr)
    )

    teamOrder.forEach((abbr, idx) => {
      const qbForTeam = Object.entries(assignments).find(([, a]) => a === abbr)
      if (qbForTeam) {
        const [qbName] = qbForTeam
        const correct = getTeamForQB(qbName) === abbr
        result += correct ? '🟩' : '🟥'
      } else {
        result += '⬜'
      }
      if ((idx + 1) % 8 === 0) result += '\n'
    })

    return result
  }

  const handleShare = async () => {
    const shareText = generateShareableResults()
    if (navigator.share) {
      try {
        await navigator.share({
          text: shareText,
          title: 'NFL QB Picker Results'
        })
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err)
        }
      }
    }
  }

  // Get assigned QB for a team
  const getAssignedQB = (teamAbbr) => {
    const entry = Object.entries(assignments).find(([, abbr]) => abbr === teamAbbr)
    if (!entry) return null
    const [qbName] = entry
    return shuffledQBs.find(q => q.name === qbName)
  }

  const renderTeamTarget = (team) => {
    const assignedQB = getAssignedQB(team.abbr)
    const isDroppable = selectedQB && !assignedQB

    return (
      <div
        key={team.abbr}
        className={`qb-team-target ${isDroppable ? 'droppable' : ''} ${assignedQB ? 'filled' : ''}`}
        onClick={() => handleTeamTap(team)}
        role="button"
        tabIndex={0}
        aria-label={`${team.name}${assignedQB ? `, assigned: ${assignedQB.name}` : ''}`}
      >
        <img
          src={getLogoUrl(team.abbr)}
          alt={team.name}
          className="qb-team-logo"
        />
        {assignedQB && (
          <div
            className="qb-assigned-overlay"
            onClick={(e) => handleAssignedQBTap(assignedQB.name, e)}
          >
            <img
              src={getQBHeadshotUrl(assignedQB.athleteId)}
              alt={assignedQB.name}
              className="qb-assigned-headshot"
            />
          </div>
        )}
      </div>
    )
  }

  const renderDivisionRow = (division) => {
    const teams = NFL_DIVISIONS[division]
    const directionName = division.replace(/^(AFC|NFC) /, '')

    return (
      <div key={division} className="qb-division-row">
        <span className="qb-division-label">{directionName}</span>
        <div className="qb-division-teams">
          {teams.map(team => renderTeamTarget(team))}
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="qb-picker-mode">
        <div className="mode-header">
          <button className="icon-back-button" onClick={onBack} title="Back to Menu" aria-label="Back to Menu">←</button>
          <h2>QB Picker</h2>
        </div>
        <div className="results-panel">
          <h3>Results</h3>
          <div className="final-score">
            Score: {score} / {TOTAL_TEAMS} ({Math.round((score / TOTAL_TEAMS) * 100)}%)
          </div>
          <button className="share-button" onClick={handleShare}>
            Share Results
          </button>

          <div className="qb-results-grid">
            {allTeams.map(team => {
              const assignedQB = getAssignedQB(team.abbr)
              const correctQB = shuffledQBs.find(q => q.teamAbbr === team.abbr)
              const isCorrect = assignedQB && assignedQB.teamAbbr === team.abbr

              return (
                <div key={team.abbr} className={`qb-result-item ${isCorrect ? 'correct' : assignedQB ? 'incorrect' : 'missing'}`}>
                  <img src={getLogoUrl(team.abbr)} alt={team.name} className="qb-result-logo" />
                  <div className="qb-result-info">
                    {assignedQB ? (
                      <>
                        <span className="qb-result-name">{assignedQB.name}</span>
                        {!isCorrect && correctQB && (
                          <span className="qb-result-correct">Should be: {correctQB.name}</span>
                        )}
                      </>
                    ) : (
                      <span className="qb-result-missing">{correctQB?.name || 'N/A'}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <button className="try-again-button" onClick={handleTryAgain}>
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="qb-picker-mode">
      <div className="qb-picker-header">
        <button className="icon-back-button" onClick={onBack} title="Back to Menu" aria-label="Back to Menu">←</button>
        <h2>QB Picker</h2>
        <span className="qb-picker-count">{Object.keys(assignments).length}/{TOTAL_TEAMS}</span>
      </div>

      <div className="qb-picker-container">
        <div className="qb-teams-grid">
          <div className="qb-conference-column">
            <span className="qb-conference-label">AFC</span>
            {AFC_DIVISIONS.map(div => renderDivisionRow(div))}
          </div>
          <div className="qb-conference-column">
            <span className="qb-conference-label">NFC</span>
            {NFC_DIVISIONS.map(div => renderDivisionRow(div))}
          </div>
        </div>

        <div className="qb-pool">
          {selectedQB && <div className="qb-pool-hint">Tap a team to assign {selectedQB.name}</div>}
          <div className="qb-pool-grid">
            {shuffledQBs.map(qb => {
              const isAssigned = assignments[qb.name]
              const isSelected = selectedQB?.name === qb.name

              return (
                <div
                  key={qb.name}
                  className={`qb-card ${isSelected ? 'selected' : ''} ${isAssigned ? 'assigned' : ''}`}
                  onClick={() => !isAssigned && handleQBTap(qb)}
                  role="button"
                  tabIndex={isAssigned ? -1 : 0}
                  aria-label={`${qb.name}${isSelected ? ', selected' : ''}${isAssigned ? ', assigned' : ''}`}
                  aria-disabled={isAssigned}
                >
                  <img
                    src={getQBHeadshotUrl(qb.athleteId)}
                    alt={qb.name}
                    className="qb-headshot"
                  />
                  <span className="qb-name">{qb.name}</span>
                </div>
              )
            })}
          </div>
        </div>

        <button
          className="submit-button qb-submit"
          onClick={handleSubmit}
          disabled={Object.keys(assignments).length < TOTAL_TEAMS}
        >
          Submit ({Object.keys(assignments).length}/{TOTAL_TEAMS})
        </button>
      </div>
    </div>
  )
}
