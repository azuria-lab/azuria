
import { CalculationHistory } from "@/types/simpleCalculator";

/**
 * Local storage operations for calculation history
 */
export const localStorageUtils = {
  // Get history from localStorage
  getLocalHistory: (): CalculationHistory[] => {
    const localHistory = localStorage.getItem("calculationHistory");
    if (!localHistory) {return [];}
    
    const history: CalculationHistory[] = JSON.parse(localHistory);
    
    // Ensure dates are objects
    return history.map(item => ({
      ...item,
      date: new Date(item.date)
    }));
  },

  // Save calculation to localStorage
  saveToLocalStorage: (historyData: CalculationHistory) => {
    const localHistory = localStorage.getItem("calculationHistory");
    const history: CalculationHistory[] = localHistory 
      ? JSON.parse(localHistory) 
      : [];

    // Add to beginning of history
    history.unshift(historyData);

    // Limit history to 50 items
    const limitedHistory = history.slice(0, 50);
    localStorage.setItem("calculationHistory", JSON.stringify(limitedHistory));
    
    return true;
  },

  // Delete item from localStorage
  deleteLocalItem: (id: string): boolean => {
    const localHistory = localStorage.getItem("calculationHistory");
    if (!localHistory) {return false;}

    const history: CalculationHistory[] = JSON.parse(localHistory);
    const updatedHistory = history.filter(item => item.id !== id);
    
    localStorage.setItem("calculationHistory", JSON.stringify(updatedHistory));
    return true;
  },

  // Clear all local history
  clearLocalHistory: () => {
    localStorage.removeItem("calculationHistory");
    return true;
  }
};
