// Calculate the potential win amount for Satta Matka
export const calculateSattaMatkaWin = (betAmount: number): number => {
  return Math.floor(betAmount * 7.5);
};

// Calculate the potential win amount for Coin Toss
export const calculateCoinTossWin = (betAmount: number): number => {
  return Math.floor(betAmount * 1.9);
};

// Format a number amount with commas
export const formatAmount = (amount: number): string => {
  return amount.toLocaleString();
};

// Format a timestamp in a readable form (e.g. "5 min ago")
export const formatTimeAgo = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} sec ago`;
  } else if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)} min ago`;
  } else if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)} hr ago`;
  } else {
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  }
};
