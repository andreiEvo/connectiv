import type {
  CategorySlug,
  CitySlug,
  ActionTypeSlug,
  ReactionKind,
  AccountTypeSlug,
} from "@/lib/constants";

export type Profile = {
  id: string;
  full_name: string;
  building_what: string;
  city: CitySlug;
  avatar_url: string | null;
  cover_url: string | null;
  is_approved: boolean;
  is_premium: boolean;
  account_type: AccountTypeSlug;
  avatar_verified: boolean;
  created_at: string;
};

export type Post = {
  id: string;
  author_id: string;
  category: CategorySlug;
  description: string;
  video_url: string | null;
  thumbnail_url: string | null;
  city: CitySlug;
  event_at: string | null;
  created_at: string;
};

export type PostWithAuthor = Post & { author: Profile };

export type Follow = {
  follower_id: string;
  following_id: string;
  created_at: string;
};

export type Save = {
  user_id: string;
  post_id: string;
  created_at: string;
};

export type Conversation = {
  id: string;
  initiator_id: string;
  recipient_id: string;
  post_id: string | null;
  action_type: ActionTypeSlug;
  created_at: string;
};

export type ConversationWithParticipants = Conversation & {
  initiator: Profile;
  recipient: Profile;
  last_message?: Message | null;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export type UsageCounter = {
  user_id: string;
  month: string;
  conversations_started: number;
};

export type MeetingSpot = {
  id: string;
  city: CitySlug;
  name: string;
  area: string;
};

export type Reaction = {
  post_id: string;
  user_id: string;
  kind: ReactionKind;
  created_at: string;
};

export type Comment = {
  id: string;
  post_id: string;
  author_id: string;
  body: string;
  created_at: string;
};

export type CommentWithAuthor = Comment & { author: Profile };

export type RateLimitEvent = {
  key: string;
  created_at: string;
};

export type Story = {
  id: string;
  author_id: string;
  video_url: string;
  created_at: string;
  expires_at: string;
};

export type StoryWithAuthor = Story & { author: Profile };

type Relationships = { Relationships: [] };

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
      } & Relationships;
      posts: {
        Row: Post;
        Insert: Partial<Post> & { author_id: string; category: CategorySlug; city: CitySlug };
        Update: Partial<Post>;
      } & Relationships;
      follows: {
        Row: Follow;
        Insert: Partial<Follow> & { follower_id: string; following_id: string };
        Update: Partial<Follow>;
      } & Relationships;
      saves: {
        Row: Save;
        Insert: Partial<Save> & { user_id: string; post_id: string };
        Update: Partial<Save>;
      } & Relationships;
      conversations: {
        Row: Conversation;
        Insert: Partial<Conversation> & {
          initiator_id: string;
          recipient_id: string;
          action_type: ActionTypeSlug;
        };
        Update: Partial<Conversation>;
      } & Relationships;
      messages: {
        Row: Message;
        Insert: Partial<Message> & { conversation_id: string; sender_id: string; body: string };
        Update: Partial<Message>;
      } & Relationships;
      usage_counters: {
        Row: UsageCounter;
        Insert: UsageCounter;
        Update: Partial<UsageCounter>;
      } & Relationships;
      meeting_spots: {
        Row: MeetingSpot;
        Insert: MeetingSpot;
        Update: Partial<MeetingSpot>;
      } & Relationships;
      reactions: {
        Row: Reaction;
        Insert: Partial<Reaction> & { post_id: string; user_id: string; kind: ReactionKind };
        Update: Partial<Reaction>;
      } & Relationships;
      comments: {
        Row: Comment;
        Insert: Partial<Comment> & { post_id: string; author_id: string; body: string };
        Update: Partial<Comment>;
      } & Relationships;
      rate_limit_events: {
        Row: RateLimitEvent;
        Insert: Partial<RateLimitEvent> & { key: string };
        Update: Partial<RateLimitEvent>;
      } & Relationships;
      stories: {
        Row: Story;
        Insert: Partial<Story> & { author_id: string; video_url: string };
        Update: Partial<Story>;
      } & Relationships;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
