import { useState } from 'react'
import { NFL_DIVISIONS, getAllTeams, getDivisionForTeam } from '../nflData'
import TeamCard from './TeamCard'

const shuffleArray = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export default function AssignMode({ onBack }) {
  const [assignments, setAssignments] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  // Order divisions as: AFC (North, East, South, West), then NFC (North, East, South, West)
  const divisions = ['AFC North', 'AFC East', 'AFC South', 'AFC West', 'NFC North', 'NFC East', 'NFC South', 'NFC West']

  const handleDragStart = (e, team) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', JSON.stringify(team))
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDropOnDivision = (e, division) => {
    e.preventDefault()
    const team = JSON.parse(e.dataTransfer.getData('text/plain'))

    // Check if division already has 4 teams
    const teamsInDivision = Object.values(assignments).filter(d => d === division).length
    if (teamsInDivision >= 4) {
      return
    }

    setAssignments({
      ...assignments,
      [team.name]: division
    })
  }

  const handleDropOnPool = (e) => {
    e.preventDefault()
    const team = JSON.parse(e.dataTransfer.getData('text/plain'))
    const newAssignments = { ...assignments }
    delete newAssignments[team.name]
    setAssignments(newAssignments)
  }

  const handleSubmit = () => {
    const allTeams = getAllTeams()
    let correctCount = 0

    allTeams.forEach(team => {
      const assignedDivision = assignments[team.name]
      const correctDivision = getDivisionForTeam(team.name)
      if (assignedDivision === correctDivision) {
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
  }

  const unassignedTeams = shuffleArray(
    getAllTeams().filter(team => !assignments[team.name])
  )

  const teamsByDivision = {}
  divisions.forEach(division => {
    teamsByDivision[division] = getAllTeams().filter(
      team => assignments[team.name] === division
    )
  })

  const allTeams = getAllTeams()

  return (
    <div className="assign-mode">
      <div className="mode-header">
        <button className="icon-back-button" onClick={onBack} title="Back to Menu">←</button>
        <h2>Division Picker</h2>
      </div>

      <div className="assign-container">
        {submitted ? (
          <div className="results-panel">
            <h3>Results</h3>
            <div className="final-score">
              Score: {score} / 32 ({Math.round((score / 32) * 100)}%)
            </div>

            <div className="results-grid">
              {divisions.map(division => (
                <div key={division} className="division-result">
                  <h4>{division}</h4>
                  <div className="team-results">
                    {allTeams
                      .filter(team => assignments[team.name] === division)
                      .map(team => {
                        const correct = getDivisionForTeam(team.name) === division
                        return (
                          <div
                            key={team.name}
                            className={`result-team ${correct ? 'correct' : 'incorrect'}`}
                          >
                            {team.name}
                            {!correct && (
                              <span className="correct-answer">
                                (belongs in {getDivisionForTeam(team.name)})
                              </span>
                            )}
                          </div>
                        )
                      })}
                    {allTeams
                      .filter(
                        team =>
                          !assignments[team.name] &&
                          getDivisionForTeam(team.name) === division
                      )
                      .map(team => (
                        <div
                          key={team.name}
                          className="result-team missing"
                        >
                          {team.name} (not assigned)
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>

            <button className="try-again-button" onClick={handleTryAgain}>
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="divisions-container">
              {divisions.map(division => (
                <div
                  key={division}
                  className="division-zone"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDropOnDivision(e, division)}
                >
                  <h3>{division}</h3>
                  <div className="assigned-teams">
                    {teamsByDivision[division].map(team => (
                      <TeamCard
                        key={team.name}
                        team={team}
                        draggable={true}
                        onDragStart={handleDragStart}
                        compact={true}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="team-pool" onDragOver={handleDragOver} onDrop={handleDropOnPool}>
              <h3>Team Pool</h3>
              <div className="teams-list">
                {unassignedTeams.map(team => (
                  <TeamCard
                    key={team.name}
                    team={team}
                    draggable={true}
                    onDragStart={handleDragStart}
                    compact={true}
                  />
                ))}
              </div>
            </div>

            <div className="submit-section">
              <p className="assignment-count">
                Assigned: {Object.keys(assignments).length} / 32
              </p>
              <button
                className="submit-button"
                onClick={handleSubmit}
                disabled={Object.keys(assignments).length < 32}
              >
                Submit Answers
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
