import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  api,
  type CompleteOnboardingInput,
  type UpdateUserProfileInput,
  type UserProfile,
} from "@/lib/api";

const PROFILE_KEY = ["user-profile"] as const;

export function useUserProfile() {
  return useQuery({
    queryKey: PROFILE_KEY,
    queryFn: () => api.getUserProfile(),
    staleTime: Infinity,
  });
}

export function useUpdateUserProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateUserProfileInput) => api.updateUserProfile(input),
    onSuccess: (data: UserProfile) => {
      qc.setQueryData(PROFILE_KEY, data);
    },
  });
}

export function useCompleteOnboarding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CompleteOnboardingInput) => api.completeOnboarding(input),
    onSuccess: (data: UserProfile) => {
      qc.setQueryData(PROFILE_KEY, data);
    },
  });
}

export function isOnboarded(profile: UserProfile | undefined | null) {
  return Boolean(profile?.onboardedAt);
}
