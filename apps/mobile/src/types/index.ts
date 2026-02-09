export interface Topic {
  id: string;
  name: string;
  title?: string;
  description?: string;
  icon?: string;
  color?: string;
  isPremium?: boolean;
  deletedAt?: string | null;
}

export interface Quote {
  id: string;
  text: string;
  author: string;
  topic?: Topic;
  deletedAt?: string | null;
}
