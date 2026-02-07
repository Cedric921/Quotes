export interface Topic {
  id: number;
  name: string;
  description?: string;
  deletedAt?: string | null;
}

export interface Quote {
  id: number;
  text: string;
  author: string;
  topic?: Topic;
  deletedAt?: string | null;
}
