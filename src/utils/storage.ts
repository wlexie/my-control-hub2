
type Comment = {
  id: string;
  author: string;
  content: string;
  date: string;
};

const STORAGE_KEY = `user_comments_`;

export const loadComments = (userId: number): Comment[] => {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(`${STORAGE_KEY}${userId}`);
  return data ? JSON.parse(data) : [];
};

export const saveComment = (userId: number, comment: Omit<Comment, "id">) => {
  const comments = loadComments(userId);
  const newComment = {
    ...comment,
    id: Date.now().toString(),
  };
  const updatedComments = [newComment, ...comments];
  localStorage.setItem(`${STORAGE_KEY}${userId}`, JSON.stringify(updatedComments));
  return newComment;
};