import { doc, runTransaction } from 'firebase/firestore';
import { db } from './firebase';

// --- Save votes to Firestore ---
export async function saveStagePrediction(
  stage: 'ro16' | 'qf' | 'sf' | 'final',
  selection: Record<string, string>
) {
  const docRef = doc(db, 'predictions', stage);

  try {
    await runTransaction(db, async (transaction) => {
      const docSnap = await transaction.get(docRef);

      if (!docSnap.exists()) {
        const initData: Record<string, Record<string, number>> = {};
        Object.keys(selection).forEach((matchId) => {
          initData[matchId] = { [selection[matchId]]: 1 };
        });
        transaction.set(docRef, initData);
        return;
      }

      const data = docSnap.data();

      const updates: Record<string, any> = {};
      Object.entries(selection).forEach(([matchId, team]) => {
        if (!data[matchId]) data[matchId] = {};
        const currentVotes = data[matchId][team] || 0;
        updates[matchId] = {
          ...data[matchId],
          [team]: currentVotes + 1,
        };
      });

      transaction.update(docRef, updates);
    });
    console.log(`Prediction for ${stage} saved successfully.`);
  } catch (err) {
    console.error(`Error saving prediction for ${stage}:`, err);
  }
}

// --- Compute round-wide percentages ---
export function getRoundPercentages(
  roundVotes: Record<string, Record<string, number>>
) {
  const teamTotals: Record<string, number> = {};
  let totalVotes = 0;

  Object.values(roundVotes).forEach(match => {
    Object.entries(match).forEach(([team, count]) => {
      teamTotals[team] = (teamTotals[team] || 0) + count;
      totalVotes += count;
    });
  });

  const percentages: Record<string, number> = {};
  Object.entries(teamTotals).forEach(([team, count]) => {
    percentages[team] = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
  });

  return percentages;
}
