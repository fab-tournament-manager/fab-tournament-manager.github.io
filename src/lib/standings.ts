import type { StandingRow, TournamentResult } from '../types';

export function computeStandings(results: TournamentResult[]): StandingRow[] {
  const grouped = new Map<string, Omit<StandingRow, 'rank'>>();

  for (const result of results) {
    const key = `${result.playerNickname.trim().toLowerCase()}::${result.playerName.trim().toLowerCase()}`;
    const current = grouped.get(key) ?? {
      id: key,
      playerName: result.playerName,
      playerNickname: result.playerNickname,
      deck: result.deck,
      totalScore: 0,
      totalWins: 0,
      totalLosses: 0,
      totalDraws: 0,
      events: 0,
      stores: [],
      lastEventDate: result.eventDate,
    };

    current.playerName = result.playerName;
    current.playerNickname = result.playerNickname;
    current.deck = result.deck;
    current.totalScore += result.score;
    current.totalWins += result.wins;
    current.totalLosses += result.losses;
    current.totalDraws += result.draws;
    current.events += 1;
    current.lastEventDate = !current.lastEventDate || result.eventDate > current.lastEventDate ? result.eventDate : current.lastEventDate;
    if (!current.stores.includes(result.storeName)) {
      current.stores.push(result.storeName);
    }

    grouped.set(key, current);
  }

  return Array.from(grouped.values())
    .sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      if (b.totalWins !== a.totalWins) return b.totalWins - a.totalWins;
      if (a.totalLosses !== b.totalLosses) return a.totalLosses - b.totalLosses;
      return a.playerName.localeCompare(b.playerName, 'pt-BR');
    })
    .map((row, index) => ({ ...row, rank: index + 1 }));
}
