export const USER_ROLES = ['buyer', 'seller', 'mechanic', 'farmer', 'agent', 'admin'] as const;
export const RESERVATION_STATUS = ['active', 'picked_up', 'expired', 'cancelled', 'refunded'] as const;
export const SERVICE_STATUS = ['open', 'bidding', 'assigned', 'in_progress', 'solved', 'cancelled'] as const;
export const KYC_STATUS = ['DRAFT', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'RESUBMISSION_REQUIRED'] as const;
export const CATEGORIES = ['Groceries', 'Electronics', 'Home Services', 'Vehicle Repair', 'Farm Direct'] as const;
