import { useState, useMemo } from 'react'
import { getAllTeams, getDivisionForTeam, AFC_DIVISIONS, NFC_DIVISIONS, ALL_DIVISIONS, TEAMS_PER_DIVISION, TOTAL_TEAMS } from '../nflData'
import { shuffleArray } from '../utils'
import TeamCard from './TeamCard'

// Get all teams once at module level to avoid recalculating
const ALL_TEAMS = getAllTeams();

export default function AssignMode({ onBack }) {
  const [assignments, setAssignments] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [selectedTeam, setSelectedTeam] = useState(null) // For tap-to-select on mobile
  // Shuffle teams once on mount, keep stable order
  const [shuffledTeams] = useState(() => shuffleArray(ALL_TEAMS))

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

    // Check if division already has max teams
    const teamsInDivision = Object.values(assignments).filter(d => d === division).length
    if (teamsInDivision >= TEAMS_PER_DIVISION) {
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

    // Check if division already has max teams
    const teamsInDivision = Object.values(assignments).filter(d => d === division).length
    if (teamsInDivision >= TEAMS_PER_DIVISION) return

    setAssignments({
      ...assignments,
      [selectedTeam.name]: division
    })
    setSelectedTeam(null)
  }

  const handleDivisionKeyDown = (e, division) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleDivisionTap(division)
    }
  }

  const handleAssignedTeamTap = (team) => {
    // Remove team from division and select it
    const newAssignments = { ...assignments }
    delete newAssignments[team.name]
    setAssignments(newAssignments)
    setSelectedTeam(team)
  }

  const handleSubmit = () => {
    let correctCount = 0

    ALL_TEAMS.forEach(team => {
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

  // Memoize teams by division to avoid recalculating on every render
  const teamsByDivision = useMemo(() => {
    const result = {}
    ALL_DIVISIONS.forEach(division => {
      result[division] = ALL_TEAMS.filter(
        team => assignments[team.name] === division
      )
    })
    return result
  }, [assignments])

  return (
    <div className="assign-mode">
      <div className="mode-header">
        <button className="icon-back-button" onClick={onBack} title="Back to Menu" aria-label="Back to Menu">←</button>
        <h2>Division Picker</h2>
      </div>

      <div className="assign-container">
        {submitted ? (
          <div className="results-panel">
            <h3>Results</h3>
            <div className="final-score">
              Score: {score} / {TOTAL_TEAMS} ({Math.round((score / TOTAL_TEAMS) * 100)}%)
            </div>

            <div className="results-grid">
              {ALL_DIVISIONS.map(division => (
                <div key={division} className="division-result">
                  <h4>{division}</h4>
                  <div className="team-results">
                    {ALL_TEAMS
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
                    {ALL_TEAMS
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
                {AFC_DIVISIONS.map(division => {
                  const teamsInDivision = teamsByDivision[division].length
                  const directionName = division.replace('AFC ', '')
                  const isFull = teamsInDivision >= TEAMS_PER_DIVISION
                  return (
                    <div
                      key={division}
                      className={`division-zone ${selectedTeam ? 'droppable' : ''} ${isFull ? 'full' : ''}`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDropOnDivision(e, division)}
                      onClick={() => handleDivisionTap(division)}
                      onKeyDown={(e) => handleDivisionKeyDown(e, division)}
                      role="button"
                      tabIndex={0}
                      aria-label={`${division}, ${teamsInDivision} of ${TEAMS_PER_DIVISION} teams assigned${isFull ? ', full' : ''}`}
                      aria-disabled={isFull}
                    >
                      <div className="division-header">
                        <span className="division-name">{directionName}</span>
                        <span className="division-count">{teamsInDivision}/{TEAMS_PER_DIVISION}</span>
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
                {NFC_DIVISIONS.map(division => {
                  const teamsInDivision = teamsByDivision[division].length
                  const directionName = division.replace('NFC ', '')
                  const isFull = teamsInDivision >= TEAMS_PER_DIVISION
                  return (
                    <div
                      key={division}
                      className={`division-zone ${selectedTeam ? 'droppable' : ''} ${isFull ? 'full' : ''}`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDropOnDivision(e, division)}
                      onClick={() => handleDivisionTap(division)}
                      onKeyDown={(e) => handleDivisionKeyDown(e, division)}
                      role="button"
                      tabIndex={0}
                      aria-label={`${division}, ${teamsInDivision} of ${TEAMS_PER_DIVISION} teams assigned${isFull ? ', full' : ''}`}
                      aria-disabled={isFull}
                    >
                      <div className="division-header">
                        <span className="division-name">{directionName}</span>
                        <span className="division-count">{teamsInDivision}/{TEAMS_PER_DIVISION}</span>
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

            <div
              className="team-pool"
              onDragOver={handleDragOver}
              onDrop={handleDropOnPool}
              role="region"
              aria-label={`Team pool, ${unassignedTeams.length} teams remaining`}
            >
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
                Assigned: {Object.keys(assignments).length} / {TOTAL_TEAMS}
              </p>
              <button
                className="submit-button"
                onClick={handleSubmit}
                disabled={Object.keys(assignments).length < TOTAL_TEAMS}
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
