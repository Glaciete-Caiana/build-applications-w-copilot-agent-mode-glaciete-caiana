
import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

interface Team {
  _id?: string;
  name: string;
  mascot?: string;
  members: string[];
}

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getJson<{ teams: Team[] }>('/api/teams')
      .then((data) => setTeams(data.teams))
      .catch(() => setError('Não foi possível carregar as equipes.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="card">
      <div className="card-body">
        <h2 className="h4">Equipes</h2>
        <p>Gerencie equipes e integrantes.</p>

        {loading && (
          <p role="status">Carregando equipes...</p>
        )}

        {error && (
          <p role="alert">{error}</p>
        )}

        {!loading && !error && teams.length === 0 && (
          <p>Sem equipes cadastradas.</p>
        )}

        {!loading && !error && teams.length > 0 && (
          <ul>
            {teams.map((team, index) => (
              <li key={team._id || index}>
                <strong>{team.name}</strong>
                {team.mascot && ` - ${team.mascot}`}
                <p>
                  Integrantes: {team.members?.length || 0}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

