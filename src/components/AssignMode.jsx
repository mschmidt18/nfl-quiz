import { useState } from 'react'
import { getAllTeams, getDivisionForTeam } from '../nflData'
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
  const [selectedTeam, setSelectedTeam] = useState(null) // For tap-to-select on mobile
  // Shuffle teams once on mount, keep stable order
  const [shuffledTeams] = useState(() => shuffleArray(getAllTeams()))
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

  // Tap-to-select handlers for mobile
  const handleTeamTap = (team) => {
    if (selectedTeam?.name === team.name) {
      // Deselect if tapping same team
      setSelectedTeam(null)
    } else {
      setSelectedTeam(team)
    }
  }

  const handleDivisionTap = (division) => {
    if (!selectedTeam) return

    // Check if division already has 4 teams
    const teamsInDivision = Object.values(assignments).filter(d => d === division).length
    if (teamsInDivision >= 4) return

    setAssignments({
      ...assignments,
      [selectedTeam.name]: division
    })
    setSelectedTeam(null)
  }

  const handleAssignedTeamTap = (team) => {
    // Remove team from division and select it
    const newAssignments = { ...assignments }
    delete newAssignments[team.name]
    setAssignments(newAssignments)
    setSelectedTeam(team)
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
    setSelectedTeam(null)
  }

  // Filter from stable shuffled order - teams stay in place
  const unassignedTeams = shuffledTeams.filter(team => !assignments[team.name])

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
              <div className="conference-column">
                <h3 className="conference-header">AFC</h3>
                {['AFC North', 'AFC East', 'AFC South', 'AFC West'].map(division => {
                  const teamsInDivision = teamsByDivision[division].length
                  const directionName = division.replace('AFC ', '')
                  return (
                    <div
                      key={division}
                      className={`division-zone ${selectedTeam ? 'droppable' : ''} ${teamsInDivision >= 4 ? 'full' : ''}`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDropOnDivision(e, division)}
                      onClick={() => handleDivisionTap(division)}
                    >
                      <div className="division-header">
                        <span className="division-name">{directionName}</span>
                        <span className="division-count">{teamsInDivision}/4</span>
                      </div>
                      <div className="assigned-teams">
                        {teamsByDivision[division].map(team => (
                          <TeamCard
                            key={team.name}
                            team={team}
                            draggable={true}
                            onDragStart={handleDragStart}
                            onClick={() => handleAssignedTeamTap(team)}
                            compact={true}
                          />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="conference-column">
                <h3 className="conference-header">NFC</h3>
                {['NFC North', 'NFC East', 'NFC South', 'NFC West'].map(division => {
                  const teamsInDivision = teamsByDivision[division].length
                  const directionName = division.replace('NFC ', '')
                  return (
                    <div
                      key={division}
                      className={`division-zone ${selectedTeam ? 'droppable' : ''} ${teamsInDivision >= 4 ? 'full' : ''}`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDropOnDivision(e, division)}
                      onClick={() => handleDivisionTap(division)}
                    >
                      <div className="division-header">
                        <span className="division-name">{directionName}</span>
                        <span className="division-count">{teamsInDivision}/4</span>
                      </div>
                      <div className="assigned-teams">
                        {teamsByDivision[division].map(team => (
                          <TeamCard
                            key={team.name}
                            team={team}
                            draggable={true}
                            onDragStart={handleDragStart}
                            onClick={() => handleAssignedTeamTap(team)}
                            compact={true}
                          />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="team-pool" onDragOver={handleDragOver} onDrop={handleDropOnPool}>
              <h3>
                Team Pool <span className="pool-count">({unassignedTeams.length} remaining)</span>
                {selectedTeam && <span className="tap-hint"> — Now tap a division</span>}
              </h3>
              <div className="teams-list">
                {unassignedTeams.map(team => (
                  <TeamCard
                    key={team.name}
                    team={team}
                    draggable={true}
                    onDragStart={handleDragStart}
                    onClick={() => handleTeamTap(team)}
                    selected={selectedTeam?.name === team.name}
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
