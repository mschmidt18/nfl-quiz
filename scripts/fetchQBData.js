#!/usr/bin/env node

/**
 * Fetches starting QB data from ESPN's unofficial API
 * Run with: node scripts/fetchQBData.js
 * Outputs: src/data/qbData.json
 */

import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ESPN team IDs mapped to our abbreviations
const TEAM_IDS = {
  buf: 2, mia: 15, ne: 17, nyj: 20,           // AFC East
  bal: 33, cin: 4, cle: 5, pit: 23,           // AFC North
  hou: 34, ind: 11, jax: 30, ten: 10,         // AFC South
  den: 7, kc: 12, lv: 13, lac: 24,            // AFC West
  dal: 6, nyg: 19, phi: 21, wsh: 28,          // NFC East
  chi: 3, det: 8, gb: 9, min: 16,             // NFC North
  atl: 1, car: 29, no: 18, tb: 27,            // NFC South
  ari: 22, la: 14, sf: 25, sea: 26            // NFC West
};

const CURRENT_YEAR = new Date().getFullYear();

async function fetchDepthChart(teamId) {
  const url = `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/${CURRENT_YEAR}/teams/${teamId}/depthcharts`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch depth chart for team ${teamId}: ${response.status}`);
  }
  return response.json();
}

async function fetchAthleteDetails(athleteRef) {
  const response = await fetch(athleteRef);
  if (!response.ok) {
    throw new Error(`Failed to fetch athlete: ${response.status}`);
  }
  return response.json();
}

async function getStartingQB(teamAbbr, teamId) {
  try {
    const depthChart = await fetchDepthChart(teamId);

    // Find offense formation with QB (usually "3WR 1TE" or similar)
    let qbPosition = null;
    for (const item of depthChart.items || []) {
      if (item.positions?.qb) {
        qbPosition = item.positions.qb;
        break;
      }
    }

    if (!qbPosition?.athletes?.[0]?.athlete?.$ref) {
      console.warn(`No QB found for ${teamAbbr}`);
      return null;
    }

    // Get the starter (rank 1)
    const starter = qbPosition.athletes.find(a => a.rank === 1) || qbPosition.athletes[0];
    const athleteRef = starter.athlete.$ref;
    const athlete = await fetchAthleteDetails(athleteRef);

    return {
      name: athlete.displayName || athlete.fullName,
      athleteId: String(athlete.id),
      teamAbbr
    };
  } catch (error) {
    console.error(`Error fetching QB for ${teamAbbr}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('Fetching starting QB data from ESPN...\n');

  const qbs = [];
  const entries = Object.entries(TEAM_IDS);

  for (const [abbr, teamId] of entries) {
    console.log(`Fetching ${abbr.toUpperCase()}...`);
    const qb = await getStartingQB(abbr, teamId);
    if (qb) {
      qbs.push(qb);
      console.log(`${qb.name} (ID: ${qb.athleteId})`);
    } else {
      console.log('NOT FOUND');
    }
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  const data = {
    lastUpdated: new Date().toISOString().split('T')[0],
    qbs
  };

  // Ensure output directory exists
  const outputDir = join(__dirname, '..', 'src', 'data');
  mkdirSync(outputDir, { recursive: true });

  const outputPath = join(outputDir, 'qbData.json');
  writeFileSync(outputPath, JSON.stringify(data, null, 2));

  console.log(`\nSuccess! Fetched ${qbs.length}/32 QBs`);
  console.log(`Data saved to: ${outputPath}`);
}

main().catch(console.error);
