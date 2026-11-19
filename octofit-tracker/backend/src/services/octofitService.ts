
import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

function validationError(message: string, status = 400) {
  return Object.assign(new Error(message), { status });
}

function validId(id: unknown): id is string {
  return typeof id === 'string' && mongoose.Types.ObjectId.isValid(id);
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: any) {
  const { userId, teamId, type, minutes } = input || {};

  if (!validId(userId) || !validId(teamId)) {
    throw validationError('Usuário ou equipe inválidos.');
  }

  if (typeof type !== 'string' || !type.trim()) {
    throw validationError('O tipo de atividade é obrigatório.');
  }

  if (typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes <= 0) {
    throw validationError('A duração deve ser maior que zero.');
  }

  const [user, team] = await Promise.all([
    User.findById(userId),
    Team.findById(teamId),
  ]);

  if (!user || !team) {
    throw validationError('Usuário ou equipe não encontrados.');
  }

  return Activity.create({
    user: user._id,
    team: team._id,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: any) {
  const { name, mascot, members = [] } = input || {};

  if (typeof name !== 'string' || !name.trim()) {
    throw validationError('O nome da equipe é obrigatório.');
  }

  if (typeof mascot !== 'string' || !mascot.trim()) {
    throw validationError('A mascote é obrigatória.');
  }

  if (!Array.isArray(members) || !members.every(validId)) {
    throw validationError('A lista de integrantes é inválida.');
  }

  const uniqueMembers = [...new Set(members)];

  const users = await User.find({
    _id: { $in: uniqueMembers },
  });

  if (users.length !== uniqueMembers.length) {
    throw validationError('Um ou mais integrantes não foram encontrados.');
  }

  return Team.create({
    name: name.trim(),
    mascot: mascot.trim(),
    members: uniqueMembers,
  });
}

export async function getLeaderboard() {
  const [teams, activities] = await Promise.all([
    Team.find().lean(),
    Activity.find().lean(),
  ]);

  const totals = new Map<string, number>();

  for (const activity of activities) {
    const teamId = activity.team.toString();
    totals.set(
      teamId,
      (totals.get(teamId) || 0) + activity.points
    );
  }

  return teams
    .filter((team) => totals.has(team._id.toString()))
    .map((team) => ({
      teamName: team.name,
      totalPoints: totals.get(team._id.toString())!,
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((team, index) => ({
      ...team,
      rank: index + 1,
    }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).lean();

  if (!user) {
    throw validationError('Usuário não encontrado.', 404);
  }

  const workouts = await Workout.find({
    focus: user.fitnessGoal,
  }).lean();

  const reasonByFocus: Record<string, string> = {
    endurance: 'Recomendado para melhorar a corrida e a resistência nas atividades.',
    strength: 'Recomendado para desenvolver força e melhorar o desempenho nas atividades.',
  };

  return workouts.map((workout) => ({
    ...workout,
    reason:
      reasonByFocus[workout.focus] ||
      'Recomendado para melhorar o desempenho nas atividades.',
  }));
}

export { User };
