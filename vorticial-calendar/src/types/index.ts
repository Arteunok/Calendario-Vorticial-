export interface Folder {
  id: string;
  name: string;
  description: string;
  instructions: string;
  color: string;
  content: ContentItem[];
  isActive: boolean;
  position: number; // 0-8 for spiral positions
}

export interface ContentItem {
  id: string;
  type: 'image' | 'video' | 'text' | 'audio';
  file?: File;
  url?: string;
  caption?: string;
  tags?: string[];
  createdAt: Date;
  isUsed: boolean;
}

export interface CycleSettings {
  isActive: boolean;
  startDate: Date;
  intervalDays: number; // Every 3 days for feed posts
  notificationTimes: {
    morning: string; // "09:00"
    afternoon: string; // "15:00"
    evening: string; // "21:00"
  };
  currentFolderIndex: number;
}

export interface NotificationSettings {
  enabled: boolean;
  times: {
    morning: string;
    afternoon: string;
    evening: string;
  };
  platforms: string[];
}

export interface InstagramSettings {
  accessToken?: string;
  businessAccountId?: string;
  isConnected: boolean;
}