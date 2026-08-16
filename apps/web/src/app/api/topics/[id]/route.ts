import { z } from "zod";
import { route } from "@/server/http/route";
import { findTopic, removeTopic, updateTopic } from "@/server/services/topics.service";

export const GET = route({ auth: "public" }, ({ params }) => findTopic(params.id));

// PATCH and DELETE were public in NestJS.
export const PATCH = route(
  {
    auth: "admin",
    body: z.object({
      name: z.string().optional(),
      title: z.string().nullish(),
      description: z.string().nullish(),
      icon: z.string().nullish(),
      color: z.string().nullish(),
      isPremium: z.boolean().optional(),
    }),
  },
  ({ params, body }) => updateTopic(params.id, body),
);

export const DELETE = route({ auth: "admin" }, ({ params }) => removeTopic(params.id));
