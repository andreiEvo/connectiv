"use client";

import { useState, useTransition } from "react";
import { toggleFollow } from "@/app/actions/social";
import { Button } from "@/components/ui/button";

export function FollowButton({
  targetUserId,
  initialFollowing,
}: {
  targetUserId: string;
  initialFollowing: boolean;
}) {
  const [following, setFollowing] = useState(initialFollowing);
  const [, startTransition] = useTransition();

  return (
    <Button
      variant={following ? "secondary" : "primary"}
      size="sm"
      onClick={() => {
        setFollowing((v) => !v);
        startTransition(async () => {
          const result = await toggleFollow(targetUserId);
          if (typeof result.following === "boolean") setFollowing(result.following);
        });
      }}
    >
      {following ? "Urmărești progresul" : "Urmărește progresul"}
    </Button>
  );
}
