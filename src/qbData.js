import qbDataJson from './data/qbData.json';

// Get the QB data
export const QB_DATA = qbDataJson.qbs;
export const LAST_UPDATED = qbDataJson.lastUpdated;

// Get ESPN headshot URL for a QB
export const getQBHeadshotUrl = (athleteId) => {
  return `https://a.espncdn.com/i/headshots/nfl/players/full/${athleteId}.png`;
};

// Get the correct team abbreviation for a QB
export const getTeamForQB = (qbName) => {
  const qb = QB_DATA.find(q => q.name === qbName);
  return qb?.teamAbbr || null;
};

// Get all QBs (returns a new shuffled array each time)
export const getAllQBs = () => {
  const qbs = [...QB_DATA];
  // Fisher-Yates shuffle
  for (let i = qbs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [qbs[i], qbs[j]] = [qbs[j], qbs[i]];
  }
  return qbs;
};

// Get a QB by name
export const getQBByName = (name) => {
  return QB_DATA.find(q => q.name === name) || null;
};

// Get a QB by team abbreviation
export const getQBByTeam = (teamAbbr) => {
  return QB_DATA.find(q => q.teamAbbr === teamAbbr) || null;
};
