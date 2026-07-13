export interface UserSummary {
  id: number;
  name: string;
  email: string;
  isPlaceholder: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: UserSummary;
}

export interface OtpIssuedResponse {
  email: string;
  message: string;
  otpExpiresAt: string;
}

export interface GroupSummary {
  id: number;
  name: string;
  inviteCode: string;
}

export interface GroupDetail {
  id: number;
  name: string;
  inviteCode: string;
  createdByUserId: number | null;
  members: UserSummary[];
}

export interface Category {
  id: number;
  name: string;
  color: string | null;
  icon: string | null;
}

export interface ExpenseSplitInput {
  userId: number;
  amount: number;
}

export interface ExpenseSplitView {
  userId: number;
  userName: string;
  amount: number;
}

export interface CreateExpenseRequest {
  groupId: number;
  paidByUserId: number;
  amount: number;
  description?: string;
  categoryId: number;
  date?: string;
  splits: ExpenseSplitInput[];
}

export interface Expense {
  id: number;
  groupId: number;
  paidByUserId: number;
  paidByName: string;
  amount: number;
  description: string | null;
  categoryId: number | null;
  categoryName: string | null;
  categoryColor: string | null;
  categoryIcon: string | null;
  date: string;
  createdAt: string;
  splits: ExpenseSplitView[];
}

export interface Balance {
  userId: number;
  userName: string;
  balance: number;
}

export interface SettlementSuggestion {
  fromUserId: number;
  fromUserName: string;
  toUserId: number;
  toUserName: string;
  amount: number;
}

export interface MemberSpendingSummary {
  userId: number;
  userName: string;
  share: number;
  actualSpent: number;
}

export interface PersonalSpendingSummary {
  share: number;
  actualSpent: number;
  netBalance: number;
}

export interface ApiErrorBody {
  error: string;
  details?: string;
}
