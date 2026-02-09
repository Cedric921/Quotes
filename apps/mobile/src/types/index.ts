export interface Topic {
  id: number;
  name: string;
  title?: string;
  description?: string;
  icon?: string;
  color?: string;
  isPremium?: boolean;
  deletedAt?: string | null;
}

export interface Quote {
  id: number;
  text: string;
  author: string;
  topic?: Topic;
  deletedAt?: string | null;
}
