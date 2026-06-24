export type UserRole = 'student' | 'mentor' | 'admin' | 'owner';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  cover_url?: string | null;
  country_of_residence: string;
  professional_field: string | null;
  job_title: string | null;
  skills: string[];
  interests: string[] | string;
  bio: string | null;
  role: UserRole; // Legacy single role (deprecated, use roles array)
  roles: UserRole[]; // Multi-role support
  mentorship_available: boolean;
  mentor_status: ApprovalStatus | null;
  admin_status: ApprovalStatus | null;
  is_owner: boolean;
  specialty: string[];
  profession: string | null;
  phone_number?: string | null;
  username?: string | null;
  city?: string | null;
  is_verified?: boolean;
  is_online?: boolean;
  last_seen_at?: string | null;
  diaspora_country?: string | null;
  home_district?: string | null;
  qr_code?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MentorshipRequest {
  id: string;
  student_id: string;
  mentor_id: string;
  message: string | null;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  updated_at: string;
  student?: Profile;
  mentor?: Profile;
}

export interface SavedMentor {
  id: string;
  student_id: string;
  mentor_id: string;
  created_at: string;
  mentor?: Profile;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote';
  category: string;
  skills: string[];
  salary_range: string | null;
  requirements: string | null;
  employer_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  employer?: Profile;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  type: 'blog' | 'news' | 'feed';
  category: string | null;
  tags: string[];
  author_id: string;
  featured_image_url: string | null;
  view_count: number;
  is_published: boolean;
  media_urls?: string[];
  post_type?: 'text' | 'image' | 'video' | 'event' | 'announcement' | 'job';
  visibility?: 'public' | 'connections' | 'group' | 'private';
  group_id?: string | null;
  likes_count?: number;
  comments_count?: number;
  is_pinned?: boolean;
  created_at: string;
  updated_at: string;
  author?: Profile;
  liked_by_me?: boolean;
}

export interface PostLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface PostComment {
  id: string;
  post_id: string;
  author_id: string;
  parent_id: string | null;
  content: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
  author?: Profile;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  event_date: string;
  end_date: string | null;
  location: string | null;
  is_online: boolean;
  stream_url: string | null;
  is_live: boolean;
  organizer_id: string;
  image_url: string | null;
  max_attendees: number | null;
  attendee_count: number;
  created_at: string;
  updated_at: string;
  organizer?: Profile;
  user_rsvp?: EventRSVP;
}

export interface EventRSVP {
  id: string;
  event_id: string;
  user_id: string;
  status: 'going' | 'interested' | 'not_going';
  created_at: string;
}

export interface Conversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  created_at: string;
  updated_at: string;
  other_participant?: Profile;
  last_message?: Message;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
  sender?: Profile;
}

export interface VaultItem {
  id: string;
  title: string;
  description: string | null;
  item_type: 'project' | 'idea' | 'portfolio' | 'note' | 'other';
  visibility: 'public' | 'private';
  file_urls: string[];
  owner_id: string;
  created_at: string;
  updated_at: string;
  owner?: Profile;
}

export interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  user_id: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  attachment_urls: string[];
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  user?: Profile;
  assignee?: Profile;
}

// ============================================
// BanglaConnect NEW TYPES
// ============================================

// Contacts
export interface Contact {
  id: string;
  user_id: string;
  contact_user_id: string | null;
  phone_number: string | null;
  name: string;
  is_registered: boolean;
  is_blocked: boolean;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface ContactRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  message: string | null;
  created_at: string;
  updated_at: string;
  sender?: Profile;
  receiver?: Profile;
}

// Community Groups
export type GroupType = 'diaspora' | 'regional' | 'interest' | 'family' | 'community';
export type GroupMemberRole = 'owner' | 'admin' | 'moderator' | 'member';

export interface CommunityGroup {
  id: string;
  name: string;
  description: string | null;
  type: GroupType;
  category: string | null;
  country: string | null;
  city: string | null;
  district: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  is_private: boolean;
  is_verified: boolean;
  created_by: string;
  member_count: number;
  created_at: string;
  updated_at: string;
  is_member?: boolean;
  member_role?: GroupMemberRole;
  creator?: Profile;
}

export interface CommunityGroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: GroupMemberRole;
  joined_at: string;
  profile?: Profile;
}

// Calls
export type CallType = 'voice' | 'video';
export type CallStatus = 'initiated' | 'ringing' | 'answered' | 'ended' | 'missed' | 'rejected';

export interface Call {
  id: string;
  caller_id: string;
  receiver_id: string | null;
  group_id: string | null;
  type: CallType;
  status: CallStatus;
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number | null;
  cost_credits: number;
  call_quality: string | null;
  created_at: string;
  caller?: Profile;
  receiver?: Profile;
}

// Wallet
export type TransactionType = 'topup' | 'call_charge' | 'transfer' | 'refund' | 'reward' | 'purchase';

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  type: TransactionType;
  amount: number;
  balance_after: number;
  reference_type: string | null;
  reference_id: string | null;
  description: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface TopupPackage {
  id: string;
  name: string;
  credits: number;
  price_bdt: number;
  bonus_credits: number;
  is_active: boolean;
  created_at: string;
}

// Connection (for connections/friends)
export interface Connection {
  id: string;
  from_profile_id: string;
  to_profile_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  message: string | null;
  created_at: string;
  profile?: Profile;
}
