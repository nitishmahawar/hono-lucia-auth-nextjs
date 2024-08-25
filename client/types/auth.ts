export interface User {
  id: string;
  name: string;
  image?: string;
  email: string;
  createdAt: string;
}

export interface Session {
  expiresAt: string;
  fresh: boolean;
  id: string;
  userId: string;
}
