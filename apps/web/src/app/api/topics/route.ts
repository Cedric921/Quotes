import { z } from "zod";
import { route } from "@/server/http/route";
import { createTopic, findTopics } from "@/server/services/topics.service";

const topicFields = {
  title: z.string().nullish(),
  description: z.string().nullish(),
  icon: z.string().nullish(),
  color: z.string().nullish(),
  isPremium: z.boolean().optional(),
};

export const GET = route({ auth: "public" }, () => findTopics());

// Was public in NestJS.
export const POST = route(
  { auth: "admin", body: z.object({ name: z.string(), ...topicFields }) },
  ({ body }) => createTopic(body),
);
