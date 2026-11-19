
import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

interface Activity {
  type: string;
  minutes: number;
  points: number;
}

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getJson<{ activities: Activity[] }>('/api/activities')
      .then((data) => setActivities(data.activities))
      .catch(() => setError('Não foi possível carregar as atividades.'))
      .finally(() => setLoading(false));
  }, []);

  const activityNames: Record<string, string> = {
    run: 'Corrida',
    cycle: 'Ciclismo',
    strength: 'Musculação',
  };

  return (
    <section className="card">
      <div className="card-body">
        <h2 className="h4">Atividades</h2>
        <p>Acompanhe os minutos de atividade e os pontos das pessoas participantes.</p>

        {loading && <p role="status">Carregando atividades...</p>}

        {error && <p role="alert">{error}</p>}

        {!loading && !error && activities.length === 0 && (
          <p>Sem atividades cadastradas.</p>
        )}

        {!loading && !error && activities.length > 0 && (
          <ul>
            {activities.map((activity, index) => (
              <li key={index}>
                <strong>
                  {activityNames[activity.type] || activity.type}
                </strong>
                {' - '}
                {activity.minutes} minutos
                {' - '}
                {activity.points} pontos
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

