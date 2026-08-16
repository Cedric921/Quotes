import { repo } from "../db";
import { Topic } from "../db/entities";

export interface CreateTopicInput {
  name: string;
  title?: string | null;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  isPremium?: boolean;
}

export type UpdateTopicInput = Partial<CreateTopicInput>;

export async function createTopic(input: CreateTopicInput) {
  const topics = await repo(Topic);
  return topics.save(topics.create(input));
}

export async function findTopics() {
  return (await repo(Topic)).find();
}

/** `null` when missing: NestJS answered an empty 200, not a 404. */
export async function findTopic(id: string) {
  return (await repo(Topic)).findOneBy({ id });
}

export async function updateTopic(id: string, input: UpdateTopicInput) {
  const topic = await findTopic(id);
  if (!topic) return null;
  Object.assign(topic, input);
  return (await repo(Topic)).save(topic);
}

/** Soft delete; answers TypeORM's UpdateResult, as NestJS did. */
export async function removeTopic(id: string) {
  return (await repo(Topic)).softDelete(id);
}
