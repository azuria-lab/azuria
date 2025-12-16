export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type MemberRole = 'admin' | 'manager' | 'member' | 'viewer';

export interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  role: MemberRole;
  isActive: boolean;
  joinedAt: Date;
  lastActive?: Date;
}

export interface ChecklistItem {
  id: string;
  taskId: string;
  title: string;
  isCompleted: boolean;
  completedAt?: Date;
  completedBy?: string;
  order: number;
}

export interface Task {
  id: string;
  teamId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  tags: string[];
  checklist?: ChecklistItem[];
  attachments?: string[];
  comments?: TaskComment[];
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: Date;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  members: TeamMember[];
  createdAt: Date;
  updatedAt: Date;
  settings: {
    allowPublicTasks: boolean;
    requireApproval: boolean;
    defaultView: 'board' | 'list' | 'timeline';
  };
}

export interface BoardColumn {
  id: string;
  title: string;
  status: TaskStatus;
  order: number;
  tasks: Task[];
}

