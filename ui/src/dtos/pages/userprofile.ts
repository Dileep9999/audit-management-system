// user profile

// activity
export interface TypeOptionsDataRecord {
  id: string;
  label: string;
}

// user followers
export interface UserFollowerRecord {
  name: string;
  email: string;
  phone: string;
  image: string;
  viewMoreLink: string;
  isFollowing: boolean;
}

// user documnents
export interface UserDocumnentMediaRecord {
  type: "image" | "video";
  src?: string;
  ima?: string;
  title: string;
  size: string;
}

// user document file
export interface UserDocumentFileRecord {
  color: string;
  title: string;
  size: string;
}

// user documents record
export interface UserDocumentsFolderRecord {
  name: string;
  details: string;
}

// user projects
export interface UserProjectRecord {
  title: string;
  link: string;
  description: string;
  icon: string;
  iconColor: string;
  tag: string;
  views: number;
  avatars: string[];
  color: string;
}
