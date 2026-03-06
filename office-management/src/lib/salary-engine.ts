export const calculateWorkforceExpenditure = (baseMonthly: number, mode: "HOUR" | "DAY" | "MONTH") => {
  const workingDays = 22; // Standard corporate month
  const workingHours = workingDays * 8;

  switch (mode) {
    case "HOUR": return (baseMonthly / workingHours).toFixed(2);
    case "DAY": return (baseMonthly / workingDays).toFixed(2);
    default: return baseMonthly.toLocaleString();
  }
};