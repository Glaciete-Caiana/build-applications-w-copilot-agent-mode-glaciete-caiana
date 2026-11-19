
import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

interface LeaderboardEntry {
  teamName: string;
  totalPoints: number;
  rank: number;
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getJson<{ leaderboard: LeaderboardEntry[] }>('/api/leaderboard')
      .then((data) => setLeaderboard(data.leaderboard))
      .catch(() => setError('Não foi possível carregar o placar.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="card">
      <div className="card-body">
        <h2 className="h4">Placar</h2>
        <p>Compare a pontuação total das equipes.</p>

        {loading && <p role="status">Carregando placar...</p>}

        {error && <p role="alert">{error}</p>}

        {!loading && !error && leaderboard.length === 0 && (
          <p>Sem classificação disponível.</p>
        )}

        {!loading && !error && leaderboard.length > 0 && (
          <ol>
            {leaderboard.map((entry) => (
              <li key={entry.rank}>
                <strong>{entry.rank}º - {entry.teamName}</strong>
                {' - '}
                {entry.totalPoints} pontos
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
