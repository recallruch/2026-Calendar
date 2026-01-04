
/**
 * Gets the number of days in a given month of 2026.
 */
export const getDaysInMonth = (monthIndex: number, year: number = 2026): number => {
  return new Date(year, monthIndex + 1, 0).getDate();
};

/**
 * Gets the starting day of the week for a given month of 2026.
 * Returns 0 for Monday, 6 for Sunday.
 */
export const getStartDayOfMonth = (monthIndex: number, year: number = 2026): number => {
  // getDay() returns 0 for Sunday, 1 for Monday... 6 for Saturday
  const jsDay = new Date(year, monthIndex, 1).getDay();
  // Adjust to 0=Monday, 6=Sunday
  return (jsDay + 6) % 7;
};

/**
 * Generates the full list of day numbers to display in the grid, 
 * including leading/trailing empty slots.
 */
export const generateGridDays = (monthIndex: number, year: number = 2026) => {
  const daysInMonth = getDaysInMonth(monthIndex, year);
  const startDay = getStartDayOfMonth(monthIndex, year);
  
  const grid = [];
  
  // Fill leading empty days
  for (let i = 0; i < startDay; i++) {
    grid.push(null);
  }
  
  // Fill actual days
  for (let i = 1; i <= daysInMonth; i++) {
    grid.push(i);
  }
  
  // Fill trailing empty days to complete the last row of 7
  while (grid.length % 7 !== 0) {
    grid.push(null);
  }
  
  return grid;
};
