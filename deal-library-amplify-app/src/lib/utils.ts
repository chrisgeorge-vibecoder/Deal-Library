import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'badge-success';
    case 'pending':
      return 'badge-warning';
    case 'completed':
      return 'badge-info';
    case 'expired':
      return 'badge-danger';
    default:
      return 'badge bg-neutral-100 text-neutral-800';
  }
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'high':
      return 'badge-danger';
    case 'medium':
      return 'badge-warning';
    case 'low':
      return 'badge-success';
    default:
      return 'badge bg-neutral-100 text-neutral-800';
  }
}
