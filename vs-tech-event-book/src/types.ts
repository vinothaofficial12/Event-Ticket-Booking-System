export interface Organizer {
  id: string;
  name: string;
  photo: string;
  department: string;
  phone: string;
  email: string;
  linkedin: string;
  bio: string;
}

export interface EventData {
  id: string;
  name: string;
  category?: string;
  department: string;
  dateTime: string;
  venue: string;
  price: number;
  availableTickets: number;
  totalTickets: number;
  description: string;
  image: string;
  organizerId: string;
}

export interface BookingData {
  id?: string;
  userName: string;
  email: string;
  phone: string;
  department: string;
  collegeName: string;
  numTickets: number;
  totalAmount: number;
  event: EventData;
  attendanceStatus?: "present" | "absent" | "pending";
  isCertificateEnabled?: boolean;
  isFoodCouponEnabled?: boolean;
  isEntryTicketEnabled?: boolean;
}

export interface UserMessage {
  id: string;
  recipientEmail: string;
  content: string;
  timestamp: string;
  read: boolean;
  type: "success" | "warning" | "info";
}

export interface FeedbackData {
  id: string;
  bookingId: string;
  eventId: string;
  userEmail: string;
  userName: string;
  rating: number; // 1-5
  comment: string;
  timestamp: string;
}

export interface WaitlistEntry {
  id: string;
  eventId: string;
  userName: string;
  email: string;
  phone: string;
  department: string;
  collegeName: string;
  numTickets: number;
  timestamp: string;
  status: "waiting" | "notified" | "booked";
}
