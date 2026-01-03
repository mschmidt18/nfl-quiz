// Constants
export const TEAMS_PER_DIVISION = 4;
export const TOTAL_TEAMS = 32;

// NFL Teams organized by division
export const NFL_DIVISIONS = {
  'AFC East': [
    { name: 'Buffalo Bills', abbr: 'buf' },
    { name: 'Miami Dolphins', abbr: 'mia' },
    { name: 'New England Patriots', abbr: 'ne' },
    { name: 'New York Jets', abbr: 'nyj' }
  ],
  'AFC North': [
    { name: 'Baltimore Ravens', abbr: 'bal' },
    { name: 'Cincinnati Bengals', abbr: 'cin' },
    { name: 'Cleveland Browns', abbr: 'cle' },
    { name: 'Pittsburgh Steelers', abbr: 'pit' }
  ],
  'AFC South': [
    { name: 'Houston Texans', abbr: 'hou' },
    { name: 'Indianapolis Colts', abbr: 'ind' },
    { name: 'Jacksonville Jaguars', abbr: 'jax' },
    { name: 'Tennessee Titans', abbr: 'ten' }
  ],
  'AFC West': [
    { name: 'Denver Broncos', abbr: 'den' },
    { name: 'Kansas City Chiefs', abbr: 'kc' },
    { name: 'Las Vegas Raiders', abbr: 'lv' },
    { name: 'Los Angeles Chargers', abbr: 'lac' }
  ],
  'NFC East': [
    { name: 'Dallas Cowboys', abbr: 'dal' },
    { name: 'New York Giants', abbr: 'nyg' },
    { name: 'Philadelphia Eagles', abbr: 'phi' },
    { name: 'Washington Commanders', abbr: 'wsh' }
  ],
  'NFC North': [
    { name: 'Chicago Bears', abbr: 'chi' },
    { name: 'Detroit Lions', abbr: 'det' },
    { name: 'Green Bay Packers', abbr: 'gb' },
    { name: 'Minnesota Vikings', abbr: 'min' }
  ],
  'NFC South': [
    { name: 'Atlanta Falcons', abbr: 'atl' },
    { name: 'Carolina Panthers', abbr: 'car' },
    { name: 'New Orleans Saints', abbr: 'no' },
    { name: 'Tampa Bay Buccaneers', abbr: 'tb' }
  ],
  'NFC West': [
    { name: 'Arizona Cardinals', abbr: 'ari' },
    { name: 'Los Angeles Rams', abbr: 'la' },
    { name: 'San Francisco 49ers', abbr: 'sf' },
    { name: 'Seattle Seahawks', abbr: 'sea' }
  ]
};

// Get flat array of all teams
export const getAllTeams = () => {
  return Object.values(NFL_DIVISIONS).flat();
};

// Get all division names
export const getDivisions = () => {
  return Object.keys(NFL_DIVISIONS);
};

// Get a random team
export const getRandomTeam = () => {
  const teams = getAllTeams();
  return teams[Math.floor(Math.random() * teams.length)];
};

// Get division for a specific team
export const getDivisionForTeam = (teamName) => {
  for (const [division, teams] of Object.entries(NFL_DIVISIONS)) {
    if (teams.find(t => t.name === teamName)) {
      return division;
    }
  }
  return null;
};

// Get ESPN logo URL for a team
export const getLogoUrl = (abbr) => {
  return `https://a.espncdn.com/i/teamlogos/nfl/500/${abbr}.png`;
};

// Division arrays by conference
export const AFC_DIVISIONS = ['AFC North', 'AFC East', 'AFC South', 'AFC West'];
export const NFC_DIVISIONS = ['NFC North', 'NFC East', 'NFC South', 'NFC West'];
export const ALL_DIVISIONS = [...AFC_DIVISIONS, ...NFC_DIVISIONS];
