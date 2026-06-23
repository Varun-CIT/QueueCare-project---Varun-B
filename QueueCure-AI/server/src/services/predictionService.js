let consultationHistory = [5];

export function getAverageConsultationTime() {
  if (consultationHistory.length === 0) return 5;

  const total = consultationHistory.reduce(
    (sum, value) => sum + value,
    0
  );

  return Math.round(total / consultationHistory.length);
}

export function addConsultationTime(minutes) {
  if (!minutes || minutes <= 0) return;

  consultationHistory.push(minutes);

  if (consultationHistory.length > 20) {
    consultationHistory.shift();
  }
}

export function calculateWaitTime(patientsAhead) {
  return patientsAhead * getAverageConsultationTime();
}

export function updateEstimatedWaitTimes(queue) {
  const average = getAverageConsultationTime();

  return queue.map((patient, index) => ({
    ...patient,
    estimatedWait: average * (index + 1),
  }));
}