// utils/commentsStorage.ts
type Comment = {
  id: string;
  author: string;
  content: string;
  date: string;
};

const STORAGE_KEY = "user_comments";

// Save all comments
export const saveComments = (userId: number, comments: Comment[]) => {
  if (typeof window === "undefined") return;
  
  const allData = localStorage.getItem(STORAGE_KEY);
  const parsedData = allData ? JSON.parse(allData) : {};
  
  parsedData[userId] = comments;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedData));
};

// Load comments for a user
export const loadComments = (userId: number): Comment[] => {
  if (typeof window === "undefined") return [];
  
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  
  return JSON.parse(data)[userId] || [];
};