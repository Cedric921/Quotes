import { useMutation } from "@tanstack/react-query";
import { contactApi, ContactMessageInput } from "../../services/api";

// Query keys
export const contactKeys = {
  all: ["contact"] as const,
};

/**
 * Hook to send a contact message
 */
export const useSendContactMessage = () => {
  return useMutation({
    mutationFn: (data: ContactMessageInput) => contactApi.sendMessage(data),
  });
};

