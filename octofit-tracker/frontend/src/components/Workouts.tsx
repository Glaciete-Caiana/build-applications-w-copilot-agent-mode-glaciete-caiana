
import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

interface Workout {
  title: string;
  focus?: string;
  minutes?: number;
  difficulty?: string;
  reason: string;
}

export default function Workouts() {
  const [suggestions, setSuggestions] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getJson<{ suggestions: Workout[] }>(
      '/api/workouts/suggestions/mona%40example.com'
    )
      .then((data) => setSuggestions(data.suggestions))
      .catch(() => setError('Não foi possível carregar as sugestões de treino.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="card">
      <div className="card-body">
        <h2 className="h4">Sugestões de treino</h2>
        <p>
          Receba recomendações de treino com base nos seus padrões de atividade.
        </p>

        {loading && (
          <p role="status">Carregando sugestões...</p>
        )}

        {error && (
          <p role="alert">{error}</p>
        )}

        {!loading && !error && suggestions.length === 0 && (
          <p>Sem sugestões de treino disponíveis.</p>
        )}

        {!loading && !error && suggestions.length > 0 && (
          <ul>
            {suggestions.map((workout, index) => (
              <li key={`${workout.title}-${index}`}>
                <strong>{workout.title}</strong>
                {workout.focus && <p>Foco: {workout.focus}</p>}
                {workout.minutes !== undefined && (
                  <p>Duração: {workout.minutes} minutos</p>
                )}
                {workout.difficulty && (
                  <p>Dificuldade: {workout.difficulty}</p>
                )}
                <p>{workout.reason}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

