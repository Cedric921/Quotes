/**
 * Base interface with common fields from BaseEntity
 */
export interface BaseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface Topic extends BaseModel {
  name: string;
  title?: string;
  description?: string;
  icon?: string;
  color?: string;
  isPremium?: boolean;
}

export interface Quote extends BaseModel {
  text: string;
  author: string;
  topic?: Topic;
}

export interface User extends BaseModel {
  email: string;
  isAdmin: boolean;
  isSubscribed: boolean;
  subscriptionEndDate?: string | null;
  isPremium?: boolean;
}
