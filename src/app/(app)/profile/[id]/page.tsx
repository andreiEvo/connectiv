import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { FollowButton } from "@/components/follow-button";
import { StoryRing } from "@/components/story-ring";
import { DeletePostButton } from "@/components/delete-post-button";
import { cityLabel, categoryLabel } from "@/lib/constants";
import { LANG_COOKIE, DEFAULT_LANG, type LangCode } from "@/lib/lang-cookie";
import { t } from "@/lib/i18n/dictionary";
import { hasActiveStory } from "@/app/actions/stories";
import type { Post } from "@/lib/supabase/types";

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab: tabParam } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const cookieStore = await cookies();
  const lang = (cookieStore.get(LANG_COOKIE)?.value as LangCode) ?? DEFAULT_LANG;

  const isOwnProfile = user.id === id;
  const tab = isOwnProfile && (tabParam === "saved" || tabParam === "following") ? tabParam : "posts";

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  if (!profile) notFound();

  const [{ count: followerCount }, { count: followingCount }, { data: isFollowingRow }, profileHasStory] =
    await Promise.all([
      supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", id),
      supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", id),
      isOwnProfile
        ? Promise.resolve({ data: null })
        : supabase
            .from("follows")
            .select("follower_id")
            .eq("follower_id", user.id)
            .eq("following_id", id)
            .maybeSingle(),
      hasActiveStory(id),
    ]);

  let posts: Post[] = [];
  if (tab === "posts") {
    const { data } = await supabase
      .from("posts")
      .select("*")
      .eq("author_id", id)
      .order("created_at", { ascending: false });
    posts = data ?? [];
  } else if (tab === "saved" && isOwnProfile) {
    const { data } = await supabase
      .from("saves")
      .select("post:posts(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    posts = ((data as unknown as { post: Post }[]) ?? []).map((r) => r.post).filter(Boolean);
  } else if (tab === "following" && isOwnProfile) {
    const { data } = await supabase
      .from("follows")
      .select("following:profiles!follows_following_id_fkey(*)")
      .eq("follower_id", user.id);
    return (
      <FollowingList
        rows={(data as unknown as { following: typeof profile }[]) ?? []}
        profile={profile}
        followerCount={followerCount ?? 0}
        followingCount={followingCount ?? 0}
        isOwnProfile={isOwnProfile}
      />
    );
  }

  return (
    <div className="flex-1 overflow-y-auto w-full max-w-lg lg:max-w-3xl mx-auto">
      <div
        className={
          profile.cover_url
            ? "h-32 lg:h-48 lg:rounded-b-xl bg-cover bg-center"
            : "h-32 lg:h-48 lg:rounded-b-xl bg-gradient-to-br from-surface to-surface-2"
        }
        style={profile.cover_url ? { backgroundImage: `url(${profile.cover_url})` } : undefined}
      />
      <div className="px-4 pt-0 pb-4 flex flex-col items-center text-center gap-3 -mt-10">
        <StoryRing active={profileHasStory} badgeSize={20}>
          <Avatar
            name={profile.full_name}
            src={profile.avatar_url}
            size={72}
            className="ring-4 ring-bg"
          />
        </StoryRing>
        <div>
          <h1 className="font-display text-lg font-semibold flex items-center gap-1.5 justify-center">
            {profile.full_name}
            {profile.avatar_verified && (
              <span
                title="Poză verificată"
                className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-accent text-on-accent"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-2.5 w-2.5">
                  <path d="M5 13l4 4 10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            )}
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            {cityLabel(profile.city, lang)}
            {profile.account_type === "companie" && " · Companie"}
          </p>
        </div>
        {profile.building_what && (
          <p className="text-sm text-text max-w-xs leading-relaxed">{profile.building_what}</p>
        )}

        <div className="flex items-center gap-5 text-sm text-text-muted">
          <span>
            <strong className="text-text">{followerCount ?? 0}</strong> urmăritori
          </span>
          <span>
            <strong className="text-text">{followingCount ?? 0}</strong> urmăriți
          </span>
        </div>

        {isOwnProfile ? (
          <Link
            href="/settings"
            className="text-sm font-medium text-text border border-border-strong rounded-lg px-4 py-2 hover:border-accent hover:text-accent transition-colors duration-150"
          >
            Editează profilul
          </Link>
        ) : (
          <FollowButton targetUserId={id} initialFollowing={!!isFollowingRow} />
        )}
        {!profile.avatar_verified && isOwnProfile && (
          <p className="text-xs text-text-muted max-w-xs">
            Poza va fi verificată automat în curând.
          </p>
        )}
      </div>

      <div className="flex items-center justify-center gap-1 px-4 pb-3 border-b border-border">
        <ProfileTab id={id} tab="posts" active={tab === "posts"} label="Postări" />
        {isOwnProfile && <ProfileTab id={id} tab="saved" active={tab === "saved"} label="Salvate" />}
        {isOwnProfile && (
          <ProfileTab id={id} tab="following" active={tab === "following"} label="Urmăriți" />
        )}
      </div>

      {posts.length === 0 ? (
        <EmptyState
          title={tab === "saved" ? t(lang, "empty_saved_title") : t(lang, "empty_posts_title")}
          description={
            tab === "saved"
              ? t(lang, "empty_saved_description")
              : isOwnProfile
                ? t(lang, "empty_posts_own")
                : t(lang, "empty_posts_other")
          }
        />
      ) : (
        <div className="grid grid-cols-3 lg:grid-cols-4 gap-0.5 p-0.5">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/feed?post=${post.id}`}
              className="relative aspect-[9/16] bg-surface-2 overflow-hidden group"
            >
              {post.thumbnail_url || post.video_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.thumbnail_url ?? undefined}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center p-2">
                  <p className="text-[11px] text-text-muted text-center line-clamp-4">
                    {post.description}
                  </p>
                </div>
              )}
              <span className="absolute bottom-1 left-1 text-[9px] uppercase tracking-wide bg-black/60 text-white rounded px-1.5 py-0.5">
                {categoryLabel(post.category, lang)}
              </span>
              {isOwnProfile && tab === "posts" && (
                <DeletePostButton postId={post.id} iconOnly className="absolute top-1 right-1" />
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function ProfileTab({
  id,
  tab,
  active,
  label,
}: {
  id: string;
  tab: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={`/profile/${id}?tab=${tab}`}
      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-150 ${
        active ? "bg-accent text-on-accent" : "text-text-muted hover:text-text"
      }`}
    >
      {label}
    </Link>
  );
}

function FollowingList({
  rows,
  profile,
  followerCount,
  followingCount,
  isOwnProfile,
}: {
  rows: { following: { id: string; full_name: string; avatar_url: string | null; building_what: string } }[];
  profile: { id: string; full_name: string; avatar_url: string | null; city: string };
  followerCount: number;
  followingCount: number;
  isOwnProfile: boolean;
}) {
  return (
    <div className="flex-1 overflow-y-auto w-full max-w-lg lg:max-w-3xl mx-auto">
      <div className="px-4 pt-6 pb-4 flex flex-col items-center text-center gap-3">
        <Avatar name={profile.full_name} src={profile.avatar_url} size={72} />
        <h1 className="font-display text-lg font-semibold">{profile.full_name}</h1>
        <div className="flex items-center gap-5 text-sm text-text-muted">
          <span>
            <strong className="text-text">{followerCount}</strong> urmăritori
          </span>
          <span>
            <strong className="text-text">{followingCount}</strong> urmăriți
          </span>
        </div>
      </div>
      <div className="flex items-center justify-center gap-1 px-4 pb-3 border-b border-border">
        <ProfileTab id={profile.id} tab="posts" active={false} label="Postări" />
        {isOwnProfile && <ProfileTab id={profile.id} tab="saved" active={false} label="Salvate" />}
        {isOwnProfile && <ProfileTab id={profile.id} tab="following" active label="Urmăriți" />}
      </div>
      {rows.length === 0 ? (
        <EmptyState
          title="Nu urmărești pe nimeni încă"
          description="Urmărește progresul cuiva din feed ca să apară aici."
        />
      ) : (
        <ul className="divide-y divide-border">
          {rows.map(({ following: f }) => (
            <li key={f.id}>
              <Link href={`/profile/${f.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-surface transition-colors duration-150">
                <Avatar name={f.full_name} src={f.avatar_url} size={40} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text truncate">{f.full_name}</p>
                  <p className="text-xs text-text-muted truncate">{f.building_what}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
