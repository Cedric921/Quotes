export interface Quote {
  id: number;
  text: string;
  author: string | null;
  deletedAt?: Date | null;
  topic?: {
    id: number;
    name: string;
  } | null;
}

export interface Topic {
  id: number;
  name: string;
  description: string;
}

export interface User {
  id: number;
  email: string;
  isAdmin: boolean;
  isSubscribed: boolean;
  subscriptionEndDate?: string;
}
