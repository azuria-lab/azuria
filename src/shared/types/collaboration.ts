
export interface CalculationShare {
  id: string;
  calculationId: string;
  sharedBy: string;
  sharedWith: string;
  permissionLevel: 'view' | 'comment' | 'edit';
  expiresAt?: string;
  createdAt: string;
}

export interface CalculationComment {
  id: string;
  calculationId: string;
  userId: string;
  content: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    name: string;
    email: string;
    avatar_url?: string;
  };
  replies?: CalculationComment[];
}

export interface CalculationApproval {
  id: string;
  calculationId: string;
  requestedBy: string;
  approverId: string;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
  approvedAt?: string;
  createdAt: string;
  approver?: {
    name: string;
    email: string;
  };
}

export interface CollaborationNotification {
  id: string;
  userId: string;
  type: 'share' | 'comment' | 'approval_request' | 'approval_response' | 'mention';
  title: string;
  message: string;
  relatedId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ShareRequest {
  calculationId: string;
  userEmail: string;
  permissionLevel: 'view' | 'comment' | 'edit';
  expiresAt?: string;
}

export interface ApprovalRequest {
  calculationId: string;
  approverEmail: string;
  comment?: string;
}
