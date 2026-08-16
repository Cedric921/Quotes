import "server-only";
import { repo } from "../db";
import { SocialNetwork } from "../db/entities";
import { notFound } from "../http/errors";

export interface SocialNetworkInput {
  name?: string;
  url?: string;
  icon?: string;
  color?: string | null;
  isActive?: boolean;
  order?: number;
}

export async function createSocialNetwork(input: SocialNetworkInput & { name: string; url: string; icon: string }) {
  const networks = await repo(SocialNetwork);
  return networks.save(networks.create(input));
}

export async function findAllSocialNetworks() {
  return (await repo(SocialNetwork)).find({ order: { order: "ASC", createdAt: "DESC" } });
}

export async function findActiveSocialNetworks() {
  return (await repo(SocialNetwork)).find({ where: { isActive: true }, order: { order: "ASC" } });
}

export async function findSocialNetwork(id: string) {
  const network = await (await repo(SocialNetwork)).findOne({ where: { id } });
  if (!network) throw notFound(`Social network with ID ${id} not found`);
  return network;
}

export async function updateSocialNetwork(id: string, input: SocialNetworkInput) {
  const network = await findSocialNetwork(id);
  Object.assign(network, input);
  return (await repo(SocialNetwork)).save(network);
}

export async function toggleSocialNetworkActive(id: string) {
  const network = await findSocialNetwork(id);
  network.isActive = !network.isActive;
  return (await repo(SocialNetwork)).save(network);
}

export async function removeSocialNetwork(id: string): Promise<void> {
  const network = await findSocialNetwork(id);
  await (await repo(SocialNetwork)).softDelete(network.id);
}
