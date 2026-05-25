import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { QRCodeCanvas } from "qrcode.react";
import { GraduationCap, LogOut, User, Calendar, MapPin, Ticket, Building2, ChevronRight, Bell, BellOff, CalendarPlus, UserCheck, UserX, Clock, Phone, MessageSquare, Lock, AlertCircle, Pencil, Trash2, Download, Award, Star, Heart, Mail, MessageCircle, QrCode, Linkedin, Plus, Search, X, FileText, CheckCircle2, Utensils, RefreshCcw, ArrowUp, ArrowDown, ArrowUpDown, Sun, Moon } from "lucide-react";
import io from "socket.io-client";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Initialize Socket.io
const socket = io({
  autoConnect: true,
  reconnection: true
});
import { generateGoogleCalendarUrl } from "./calendarUtils";
import EventDetails from "./components/EventDetails";
import BookingForm from "./components/BookingForm";
import BookingSummary from "./components/BookingSummary";
import SignInModal from "./components/SignInModal";
import FeedbackModal from "./components/FeedbackModal";
import OrganizerProfile from "./components/OrganizerProfile";
import EventEditModal from "./components/EventEditModal";
import FeedbackInsights from "./components/FeedbackInsights";
import { DEPARTMENTS, EVENT_PLACEHOLDER_IMAGE } from "./constants";
import { ORGANIZERS } from "./organizersData";
import type { EventData, BookingData, UserMessage, FeedbackData, Organizer, WaitlistEntry } from "./types";

const INITIAL_EVENTS: EventData[] = [
  {
    id: "event-101",
    name: "Annual Science & Tech Expo 2026",
    description: "Experience the cutting edge of student research. Discover breakthrough projects and innovative prototypes from VelTech's rising stars in technology.",
    department: "School of Computer Science & Data Science",
    dateTime: "2026-05-05 | 9:00 AM - 2:00 PM",
    venue: "Exhibition Hall 4, Vel Tech Campus",
    price: 350,
    availableTickets: 50,
    totalTickets: 200,
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=2670&auto=format&fit=crop",
    organizerId: "org-1"
  },
  {
    id: "event-102",
    name: "Business Leadership Summit",
    description: "Bridge the gap between academia and industry. Join influential leaders for a transformative day of strategic networking and career insights.",
    department: "School of Management Studies",
    dateTime: "2026-05-06 | 9:00 AM - 2:00 PM",
    venue: "vel murugan Auditorium,Vel Tech Campus",
    price: 150,
    availableTickets: 80,
    totalTickets: 150,
    image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=2670&auto=format&fit=crop",
    organizerId: "org-1"
  },
  {
    id: "event-103",
    name: "Robotics Workshop 2026",
    description: "Unlock your engineering potential. Get hands-on with next-generation robotic systems and advanced AI frameworks in an intensive, lab-based environment.",
    department: "School of Mechanical Engineering",
    dateTime: "2026-05-07 | 9:00 AM - 2:00 PM",
    venue: "EP Lab,Vel Tech Campus",
    price: 200,
    availableTickets: 20,
    totalTickets: 150,
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2670&auto=format&fit=crop",
    organizerId: "org-1"
  },
  {
    id: "event-104",
    name: "Sustainable Architecture Expo",
    description: "Architecting the future. Explore sustainable design philosophies and smart infrastructure solutions at the intersection of aesthetics and ecology.",
    department: "School of Engineering & Architecture",
    dateTime: "2026-05-08 | 9:00 AM - 2:00 PM",
    venue: "ECE Gallery Hall,Vel Tech Campus",
    price: 150,
    availableTickets: 120,
    totalTickets: 150,
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2670&auto=format&fit=crop",
    organizerId: "org-1"
  },
  {
    id: "event-105",
    name: "Rhythm & Beats: Dance Fusion 2026",
    description: "Experience an electrifying night of rhythm! From contemporary hip-hop to classical elegance, witness the most talented dancers on campus battle it out for the grand trophy.",
    department: "School of Fine Arts",
    dateTime: "2026-05-12 | 9:00 AM - 2:00 PM",
    venue: "Open Air Ground,Vel Tech Campus",
    price: 100,
    availableTickets: 300,
    totalTickets: 500,
    image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=2669&auto=format&fit=crop",
    organizerId: "org-1"
  },
  {
    id: "event-106",
    name: "Campus Carnival: Fun & Food Fest",
    description: "The ultimate student fun day! Enjoy thrilling games, exotic food stalls, live student bands, and magical performances. A perfect way to de-stress and celebrate campus life.",
    department: "School of Media & Communication",
    dateTime: "2026-05-13 | 9:00 AM - 2:00 PM",
    venue: "Main Campus Grounds,Vel Tech Campus",
    price: 280,
    availableTickets: 450,
    totalTickets: 600,
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2670&auto=format&fit=crop",
    organizerId: "org-1"
  },
  {
    id: "event-107",
    name: "VS Tech AI Hackathon 2026",
    description: "48 hours of intense coding, problem-solving, and innovation. Build the future with Generative AI and compete for major cash prizes and internship opportunities.",
    department: "School of Computer Science & Data Science",
    dateTime: "2026-05-14 | 9:00 AM - 2:00 PM",
    venue: "Main Computing Lab, Block CSE,Vel Tech Campus",
    price: 500,
    availableTickets: 100,
    totalTickets: 100,
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2670&auto=format&fit=crop",
    organizerId: "org-1"
  },
  {
    id: "event-108",
    name: "National Mock Trial Competition",
    description: "Witness the sharpest legal minds on campus. A high-stakes courtroom simulation where students argue complex cases before a panel of guest judges from the High Court.",
    department: "School of Law & Legal Studies",
    dateTime: "2026-05-15 | 9:00 AM - 2:00 PM",
    venue: "Moot Abdul Hall, Ground Floor,Vel Tech Campus",
    price: 350,
    availableTickets: 150,
    totalTickets: 150,
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2670&auto=format&fit=crop",
    organizerId: "org-1"
  },
  {
    id: "event-109",
    name: "Bio-Medical Innovation Fair",
    description: "Exploring the future of healthcare. Witness revolutionary medical devices, genetic research exhibits, and digital health solutions developed by students.",
    department: "Department of Biomedical Engineering",
    dateTime: "2026-05-16 | 9:00 AM - 2:00 PM",
    venue: "MG Hall, Vel Tech Campus",
    price: 100,
    availableTickets: 200,
    totalTickets: 200,
    image: "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=2670&auto=format&fit=crop",
    organizerId: "org-1"
  },
  {
    id: "event-110",
    name: "Infrastructure & Smart City Summit",
    description: "Presenting the next generation of civil engineering. Focus on smart urban planning, sustainable materials, and earthquake-resistant structures.",
    department: "School of Civil Engineering",
    dateTime: "2026-05-18 | 9:00 AM - 2:00 PM",
    venue: "Civil Block Auditorium,Vel Tech Campus",
    price: 150,
    availableTickets: 150,
    totalTickets: 150,
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2670&auto=format&fit=crop",
    organizerId: "org-1"
  },
  {
    id: "event-111",
    name: "IoT & Electronics Workshop",
    description: "Connect the world! Learn to build smart home devices, wearable tech, and industrial monitoring systems using the latest microcontrollers.",
    department: "Department of Electronics & Communication",
    dateTime: "2026-05-19 | 9:00 AM - 2:00 PM",
    venue: "EC Lab, Vel Tech Campus",
    price: 250,
    availableTickets: 40,
    totalTickets: 40,
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2670&auto=format&fit=crop",
    organizerId: "org-1"
  },
  {
    id: "event-112",
    name: "Agriculture Tech Expo",
    description: "Revolutionizing the farm. Discover how drones, vertical farming, and smart irrigation are transforming the agricultural landscape.",
    department: "School of Agriculture & Veterinary Sciences",
    dateTime: "2026-05-20 | 9:00 AM - 2:00 PM",
    venue: "Campus Green House Area,Vel Tech Campus",
    price: 250,
    availableTickets: 300,
    totalTickets: 300,
    image: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=2670&auto=format&fit=crop",
    organizerId: "org-1"
  },
  {
    id: "event-113",
    name: "Aerospace Design Symposium",
    description: "Taking flight with innovation. Explore aircraft design, propulsion systems, and space exploration tech crafted by students.",
    department: "Department of Aerospace Engineering",
    dateTime: "2026-05-05 | 9:00 AM - 2:00 PM",
    venue: "Aero Hangar, Vel Tech Campus",
    price: 200,
    availableTickets: 100,
    totalTickets: 100,
    image: "https://images.unsplash.com/photo-1517976487492-5750f3195933?q=80&w=2670&auto=format&fit=crop",
    organizerId: "org-1"
  },
  {
    id: "event-114",
    name: "Justice & Ethics Seminar",
    description: "Debating the pillars of society. Join legal experts for a critical look at contemporary issues in social justice and constitutional law.",
    department: "School of Law & Legal Studies",
    dateTime: "2026-05-06 | 9:00 AM - 2:00 PM",
    venue: "Justice Hall,Vel Tech Campus",
    price: 100,
    availableTickets: 80,
    totalTickets: 80,
    image: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?q=80&w=2670&auto=format&fit=crop",
    organizerId: "org-1"
  },
  {
    id: "event-115",
    name: "Campus Sports & Fitness Meet",
    description: "Celebrate health and athletic spirit. A day of competitive sports, yoga sessions, and fitness challenges for all students.",
    department: "School of Sports & Physical Education",
    dateTime: "2026-05-07 | 9:00 AM - 2:00 PM",
    venue: "Main Sports Complex,Vel Tech Campus",
    price: 200,
    availableTickets: 500,
    totalTickets: 500,
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=2670&auto=format&fit=crop",
    organizerId: "org-1"
  },
  {
    id: "event-116",
    name: "Free Fire Mobile Tournament",
    description: "Squad up for the ultimate survival battle! Compete in the campus-wide Free Fire mobile tournament for massive rewards and the title of survival champions.",
    department: "Student Gaming League",
    dateTime: "2026-05-06 | 9:00 AM - 2:00 PM",
    venue: " Multi-Purpose Hall,Vel Tech Campus",
    price: 150,
    availableTickets: 64,
    totalTickets: 64,
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2670&auto=format&fit=crop",
    organizerId: "org-1"
  },
  {
    id: "event-117",
    name: "Inter-Department Cricket Cup",
    description: "The roar of the crowd, the crack of the bat! Join us for the most anticipated cricket tournament of the semester. Represent your department and play for the gold.",
    department: "School of Sports & Physical Education",
    dateTime: "2026-05-06 | 9:00 AM - 2:00 PM",
    venue: "University Cricket Ground,Vel Tech Campus",
    price: 100,
    availableTickets: 120,
    totalTickets: 120,
    image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=2670&auto=format&fit=crop",
    organizerId: "org-1"
  },
  {
    id: "event-118",
    name: "Wool Puzzle 3D Workshop",
    description: "Unleash your creativity in 3D! Learn the unique art of wool puzzle crafting. Create intricate, textured 3D art pieces in this hands-on guided workshop.",
    department: "School of Fine Arts",
    dateTime: "2026-05-07 | 9:00 AM - 2:00 PM",
    venue: "Art Studio, Vel Tech Campus",
    price: 75,
    availableTickets: 50,
    totalTickets: 50,
    image: "https://images.unsplash.com/photo-1605152276897-4f618f831968?q=80&w=2671&auto=format&fit=crop",
    organizerId: "org-1"
  },
  {
    id: "event-119",
    name: "BGMI Mobile Championship",
    description: "Winner Winner Chicken Dinner! Assemble your squad for an intense day of BGMI action. Strategy, precision, and teamwork will decide the champions.",
    department: "Student Gaming League",
    dateTime: "2026-05-08 | 9:00 AM - 2:00 PM",
    venue: "Innovation Hub,Vel Tech Campus",
    price: 150,
    availableTickets: 100,
    totalTickets: 100,
    image: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=2671&auto=format&fit=crop",
    organizerId: "org-1"
  },
  {
    id: "event-120",
    name: "Campus DJ Night: Neon Pulse",
    description: "Light up the night! Experience the most electrifying music event on campus. Top student DJs, neon aesthetics, and non-stop beats to celebrate the end of the semester.",
    department: "School of Media & Communication",
    dateTime: "2026-05-09 | 9:00 AM - 2:00 PM",
    venue: "Open Air Theatre ,Vel Tech Campus",
    price: 300,
    availableTickets: 500,
    totalTickets: 500,
    image: "https://images.unsplash.com/photo-1429962714451-bb934ecbb4ec?q=80&w=2670&auto=format&fit=crop",
    organizerId: "org-1"
  }
];

const INITIAL_BOOKINGS: BookingData[] = [
  {
    id: "booking-101",
    userName: "Rahul Sharma",
    email: "rahul@example.com",
    phone: "9876543210",
    collegeName: "VelTech University",
    department: "B.TECH CSE DATA SCIENCE",
    numTickets: 1,
    totalAmount: 0,
    event: INITIAL_EVENTS[0], // VelTech Expo 2026
    attendanceStatus: "present",
    isCertificateEnabled: false,
    isFoodCouponEnabled: false,
    isEntryTicketEnabled: true
  },
  {
    id: "booking-102",
    userName: "Priya Patel",
    email: "priya@example.com",
    phone: "9876543211",
    collegeName: "VelTech University",
    department: "B.TECH CSE DATA SCIENCE",
    numTickets: 1,
    totalAmount: 0,
    event: INITIAL_EVENTS[0], // VelTech Expo 2026
    attendanceStatus: "present",
    isCertificateEnabled: false,
    isFoodCouponEnabled: false,
    isEntryTicketEnabled: true
  },
  {
    id: "booking-103",
    userName: "Anish Kumar",
    email: "anish@example.com",
    phone: "9876543212",
    collegeName: "VelTech University",
    department: "B.TECH CSE DATA SCIENCE",
    numTickets: 1,
    totalAmount: 500,
    event: INITIAL_EVENTS[6], // VS Tech AI Hackathon
    attendanceStatus: "present",
    isCertificateEnabled: false,
    isFoodCouponEnabled: false,
    isEntryTicketEnabled: true
  },
  {
    id: "booking-104",
    userName: "Meera Reddy",
    email: "meera@example.com",
    phone: "9876543213",
    collegeName: "VelTech University",
    department: "Mechanical Engineering",
    numTickets: 1,
    totalAmount: 500,
    event: INITIAL_EVENTS[1], // Leadership Summit
    attendanceStatus: "absent",
    isCertificateEnabled: false,
    isFoodCouponEnabled: false,
    isEntryTicketEnabled: true
  },
  {
    id: "booking-105",
    userName: "Sanjay Singh",
    email: "sanjay@example.com",
    phone: "9876543214",
    collegeName: "VelTech University",
    department: "Electronics Engineering",
    numTickets: 2,
    totalAmount: 400,
    event: INITIAL_EVENTS[2], // AI & Robotics Workshop
    attendanceStatus: "pending",
    isCertificateEnabled: false,
    isFoodCouponEnabled: false,
    isEntryTicketEnabled: true
  }
];

const INITIAL_FEEDBACKS: FeedbackData[] = [
  {
    id: "fb-101",
    bookingId: "booking-101",
    eventId: "event-101",
    userEmail: "rahul@example.com",
    userName: "Rahul Sharma",
    rating: 5,
    comment: "This was an amazing workshop! The topics covered under machine learning and robotics were highly practical. Absolutely loved the hands-on session, it was a great, incredible experience. The organizer did an excellent job and the campus venue was perfect. Looking forward to more coding hackathons!",
    timestamp: "2026-05-20T10:00:00Z"
  },
  {
    id: "fb-102",
    bookingId: "booking-102",
    eventId: "event-101",
    userEmail: "priya@example.com",
    userName: "Priya Patel",
    rating: 4,
    comment: "Excellent organization and beautiful presentation on AI-driven innovation. The experts were super knowledgeable. I found the practical lab sessions very useful. The food arrangements and hospitality were outstanding. Would highly recommend this technical event to all engineering students!",
    timestamp: "2026-05-21T11:30:00Z"
  },
  {
    id: "fb-103",
    bookingId: "booking-103",
    eventId: "event-107",
    userEmail: "anish@example.com",
    userName: "Anish Kumar",
    rating: 5,
    comment: "Outstanding hackathon with incredible competition. The mentoring sessions was highly valuable. The infrastructure, coding environments, and technical support teams were absolutely brilliant. It was challenging, intense, and highly collaborative. A fantastic initiative by the computer science department!",
    timestamp: "2026-05-22T14:45:00Z"
  },
  {
    id: "fb-104",
    bookingId: "booking-105",
    eventId: "event-103",
    userEmail: "sanjay@example.com",
    userName: "Sanjay Singh",
    rating: 3,
    comment: "Good session but the venue was a bit crowded. The content was highly informative and relevant to future robotics trends. I appreciate the hands-on kit provided but we needed more time on practical coding experiments. Food coupon option was delayed but overall a good learning seminar.",
    timestamp: "2026-05-23T09:12:00Z"
  }
];

export default function App() {
  const [events, setEvents] = useState<EventData[]>(() => {
    try {
      const saved = localStorage.getItem("vel-events");
      return saved ? JSON.parse(saved) : INITIAL_EVENTS;
    } catch (e) {
      console.error("Failed to load events from storage", e);
      return INITIAL_EVENTS;
    }
  });
  const [selectedEventId, setSelectedEventId] = useState<string | null>(INITIAL_EVENTS[0].id);
  const [bookingSummary, setBookingSummary] = useState<BookingData | null>(null);
  const [dispatchStatus, setDispatchStatus] = useState<"idle" | "email" | "whatsapp" | "confirmed">("idle");
  const [allBookings, setAllBookings] = useState<BookingData[]>(() => {
    try {
      const saved = localStorage.getItem("vel-bookings");
      return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
    } catch (e) {
      console.error("Failed to load bookings from storage", e);
      return INITIAL_BOOKINGS;
    }
  });
  
  // Auth state
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [signInModalMode, setSignInModalMode] = useState<"signin" | "signup">("signin");

  const [user, setUser] = useState<{ email: string; name: string } | null>(() => {
    try {
      const saved = localStorage.getItem("vel-user");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Failed to load user from storage", e);
      return null;
    }
  });

  const [reminders, setReminders] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("vel-reminders");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load reminders from storage", e);
      return [];
    }
  });
  const [userMessages, setUserMessages] = useState<UserMessage[]>(() => {
    try {
      const saved = localStorage.getItem("vel-messages");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load messages from storage", e);
      return [];
    }
  });
  const [feedbacks, setFeedbacks] = useState<FeedbackData[]>(() => {
    try {
      const saved = localStorage.getItem("vel-feedbacks");
      return saved ? JSON.parse(saved) : INITIAL_FEEDBACKS;
    } catch (e) {
      console.error("Failed to load feedbacks from storage", e);
      return INITIAL_FEEDBACKS;
    }
  });
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("vel-favorites");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load favorites from storage", e);
      return [];
    }
  });
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>(() => {
    try {
      const saved = localStorage.getItem("vel-waitlist");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load waitlist from storage", e);
      return [];
    }
  });
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try {
      const saved = localStorage.getItem("vel-theme");
      return saved === "dark" || saved === "light" ? saved : "light";
    } catch (e) {
      return "light";
    }
  });
  const [selectedQRBooking, setSelectedQRBooking] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"events" | "my-bookings" | "admin" | "profile" | "certificates" | "favorites" | "organizers">("events");
  const [searchTerm, setSearchTerm] = useState("");
  const [adminSearchTerm, setAdminSearchTerm] = useState("");
  const [adminDeptFilter, setAdminDeptFilter] = useState("");
  const [adminEventFilter, setAdminEventFilter] = useState("");
  const [adminSortColumn, setAdminSortColumn] = useState<string>("userName");
  const [adminSortDirection, setAdminSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (column: string) => {
    if (adminSortColumn === column) {
      setAdminSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setAdminSortColumn(column);
      setAdminSortDirection("asc");
    }
  };
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return localStorage.getItem("vel-admin-auth") === "true";
  });
  const [activeOrganizer, setActiveOrganizer] = useState<Organizer | null>(() => {
    try {
      const saved = localStorage.getItem("vstech_active_organizer");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [organizerEmail, setOrganizerEmail] = useState("");
  const [adminPortalMode, setAdminPortalMode] = useState<"admin" | "organizer">("organizer");
  const [adminPassword, setAdminPassword] = useState("");
  const [isLiveMonitoring, setIsLiveMonitoring] = useState(true);

  // Socket.io Real-time listeners
  useEffect(() => {
    socket.on("attendance_updated", (data: { bookingId: string, status: string }) => {
      console.log("[REAL-TIME] Attendance update received:", data);
      setAllBookings(prev => prev.map(b => 
        b.id === data.bookingId ? { ...b, attendanceStatus: data.status as any } : b
      ));
    });

    socket.on("booking_added", (newBooking: BookingData) => {
      console.log("[REAL-TIME] New booking received:", newBooking);
      setAllBookings(prev => {
        if (prev.find(b => b.id === newBooking.id)) return prev;
        return [...prev, newBooking];
      });
    });

    return () => {
      socket.off("attendance_updated");
      socket.off("booking_added");
    };
  }, []);
  const [adminError, setAdminError] = useState("");
  const [editingBooking, setEditingBooking] = useState<BookingData | null>(null);
  const [bookingToCancel, setBookingToCancel] = useState<BookingData | null>(null);
  const [feedbackBooking, setFeedbackBooking] = useState<BookingData | null>(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [adminSubTab, setAdminSubTab] = useState<"bookings" | "feedback" | "events" | "insights" | "waitlist">("bookings");
  const [selectedOrganizer, setSelectedOrganizer] = useState<Organizer | null>(null);

  const [allOrganizers, setAllOrganizers] = useState<Organizer[]>(() => {
    try {
      const saved = localStorage.getItem("vstech_organizers");
      return saved ? JSON.parse(saved) : ORGANIZERS;
    } catch (e) {
      return ORGANIZERS;
    }
  });
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkTicketValue, setBulkTicketValue] = useState<number>(0);
  const [bulkUpdateType, setBulkUpdateType] = useState<"add" | "set">("add");

  const getEventRating = (eventId: string) => {
    const eventFeedbacks = feedbacks.filter(f => f.eventId === eventId);
    if (eventFeedbacks.length === 0) return null;
    const avg = eventFeedbacks.reduce((acc, f) => acc + f.rating, 0) / eventFeedbacks.length;
    return {
      average: avg.toFixed(1),
      count: eventFeedbacks.length
    };
  };

  const handleSaveEvent = (updatedEvent: EventData) => {
    setEvents(prev => {
      const exists = prev.find(e => e.id === updatedEvent.id);
      if (exists) {
        return prev.map(e => e.id === updatedEvent.id ? updatedEvent : e);
      }
      return [updatedEvent, ...prev];
    });

    setAllBookings(prev => prev.map(b => 
      b.event.id === updatedEvent.id ? { ...b, event: updatedEvent } : b
    ));
    setEditingEvent(null);
    setIsEventModalOpen(false);
  };

  const handleUpdateOrganizer = (updatedOrg: Organizer) => {
    setAllOrganizers(prev => {
      const next = prev.map(o => o.id === updatedOrg.id ? updatedOrg : o);
      localStorage.setItem('vstech_organizers', JSON.stringify(next));
      return next;
    });
    setActiveOrganizer(updatedOrg);
    localStorage.setItem('vstech_active_organizer', JSON.stringify(updatedOrg));
    
    // Auto-sync with user profile if emails match
    if (user && user.email.toLowerCase() === updatedOrg.email.toLowerCase()) {
      setUser(prev => prev ? ({
        ...prev,
        name: updatedOrg.name,
        email: updatedOrg.email
      }) : prev);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === "admin123") {
      setIsAdminAuthenticated(true);
      setAdminError("");
      setAdminPassword("");
    } else {
      setAdminError("Invalid administrator password.");
    }
  };

  const handleBulkTicketUpdate = () => {
    if (bulkTicketValue <= 0 && bulkUpdateType === "set") return;
    
    setEvents(prev => prev.map(event => {
      // If we're an organizer, we only update our own events
      if (activeOrganizer && event.organizerId !== activeOrganizer.id) {
        return event;
      }
      
      const newTotal = bulkUpdateType === "add" 
        ? event.totalTickets + bulkTicketValue 
        : bulkTicketValue;
      
      // Calculate available tickets (total - booked)
      const bookedCount = event.totalTickets - event.availableTickets;
      const newAvailable = Math.max(0, newTotal - bookedCount);
      
      return {
        ...event,
        totalTickets: newTotal,
        availableTickets: newAvailable
      };
    }));
    
    setIsBulkModalOpen(false);
    setBulkTicketValue(0);
  };

  const handleCancelBooking = (bookingId: string) => {
    const booking = allBookings.find(b => b.id === bookingId);
    if (!booking) return;

    // 1. Restore tickets to the event
    setEvents(prev => prev.map(event => {
      if (event.id === booking.event.id) {
        return {
          ...event,
          availableTickets: event.availableTickets + booking.numTickets
        };
      }
      return event;
    }));

    // 2. Remove from allBookings
    setAllBookings(prev => prev.filter(b => b.id !== bookingId));

    // 3. Add a cancellation notification
    const newMessage: UserMessage = {
      id: Math.random().toString(36).substr(2, 9),
      recipientEmail: booking.email,
      content: `Your booking for "${booking.event.name}" has been successfully cancelled. Tickets: ${booking.numTickets}. Amount ₹${booking.totalAmount} will be refunded if applicable.`,
      timestamp: new Date().toISOString(),
      read: false,
      type: "info"
    };
    setUserMessages(prev => [newMessage, ...prev]);

    setBookingToCancel(null);

    // 4. Process waitlist automatically
    processWaitlistNotifications(booking.event.id, booking.numTickets);
  };

  const processWaitlistNotifications = (eventId: string, newlyAvailableTickets: number) => {
    setWaitlist(prev => {
      let ticketsRemaining = newlyAvailableTickets;
      const updated = prev.map(entry => {
        if (entry.eventId === eventId && entry.status === "waiting" && ticketsRemaining >= entry.numTickets) {
          // Notify waitlisted student!
          const notification: UserMessage = {
            id: Math.random().toString(36).substr(2, 9),
            recipientEmail: entry.email,
            content: `🎟️ Good news! Tickets for "${events.find(e => e.id === eventId)?.name || 'the event'}" are now available due to a recent cancellation! Since you were on the waitlist, a slot of ${entry.numTickets} ticket(s) is cleared for you. Head over to the registrations page to book!`,
            timestamp: new Date().toISOString(),
            read: false,
            type: "success"
          };
          setUserMessages(m => [notification, ...m]);
          ticketsRemaining -= entry.numTickets;
          return { ...entry, status: "notified" as const };
        }
        return entry;
      });
      return updated;
    });
  };

  const handleJoinWaitlist = (entry: {
    userName: string;
    email: string;
    phone: string;
    department: string;
    collegeName: string;
    numTickets: number;
    eventId: string;
  }) => {
    const newEntry: WaitlistEntry = {
      id: Math.random().toString(36).substr(2, 9),
      eventId: entry.eventId,
      userName: entry.userName,
      email: entry.email,
      phone: entry.phone,
      department: entry.department,
      collegeName: entry.collegeName,
      numTickets: entry.numTickets,
      timestamp: new Date().toISOString(),
      status: "waiting"
    };

    setWaitlist(prev => [newEntry, ...prev]);

    // Send instant waitlist confirmation notification
    const newMessage: UserMessage = {
      id: Math.random().toString(36).substr(2, 9),
      recipientEmail: entry.email,
      content: `📝 Waitlist Confirmed: You have successfully joined the waitlist for "${events.find(e => e.id === entry.eventId)?.name || 'the event'}". Requested Tickets: ${entry.numTickets}. We will notify you immediately once slot availability is restored.`,
      timestamp: new Date().toISOString(),
      read: false,
      type: "info"
    };
    setUserMessages(prev => [newMessage, ...prev]);
  };


  const handleOrganizerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const org = allOrganizers.find(o => o.email.toLowerCase() === organizerEmail.toLowerCase());
    if (org) {
      setActiveOrganizer(org);
      localStorage.setItem('vstech_active_organizer', JSON.stringify(org));
      setAdminError("");
      setOrganizerEmail("");
    } else {
      setAdminError("Organizer email not found.");
    }
  };

  const filteredAdminBookings = useMemo(() => {
    const term = adminSearchTerm.toLowerCase();
    const filtered = allBookings.filter(b => {
      // Filter for organizer events if logged in as organizer
      if (activeOrganizer && b.event.organizerId !== activeOrganizer.id) {
        return false;
      }

      const matchesSearch = 
        (b.userName?.toLowerCase() || "").includes(term) || 
        (b.email?.toLowerCase() || "").includes(term) ||
        (b.phone?.toLowerCase() || "").includes(term) ||
        (b.event?.name?.toLowerCase() || "").includes(term) ||
        (b.department?.toLowerCase() || "").includes(term);
      
      const matchesDept = !adminDeptFilter || b.department === adminDeptFilter;
      const matchesEvent = !adminEventFilter || b.event.name === adminEventFilter;

      return matchesSearch && matchesDept && matchesEvent;
    });

    if (!adminSortColumn) return filtered;

    return [...filtered].sort((a, b) => {
      let valA: any = "";
      let valB: any = "";

      switch (adminSortColumn) {
        case "userName":
          valA = a.userName?.toLowerCase() || "";
          valB = b.userName?.toLowerCase() || "";
          break;
        case "phone":
          valA = a.phone || "";
          valB = b.phone || "";
          break;
        case "collegeName":
          valA = a.collegeName?.toLowerCase() || "";
          valB = b.collegeName?.toLowerCase() || "";
          break;
        case "department":
          valA = a.department?.toLowerCase() || "";
          valB = b.department?.toLowerCase() || "";
          break;
        case "event":
          valA = a.event?.name?.toLowerCase() || "";
          valB = b.event?.name?.toLowerCase() || "";
          break;
        case "numTickets":
          valA = a.numTickets ?? 0;
          valB = b.numTickets ?? 0;
          break;
        case "attendanceStatus":
          valA = a.attendanceStatus?.toLowerCase() || "";
          valB = b.attendanceStatus?.toLowerCase() || "";
          break;
        case "isCertificateEnabled":
          valA = a.isCertificateEnabled ? 1 : 0;
          valB = b.isCertificateEnabled ? 1 : 0;
          break;
        case "isFoodCouponEnabled":
          valA = a.isFoodCouponEnabled ? 1 : 0;
          valB = b.isFoodCouponEnabled ? 1 : 0;
          break;
        case "totalAmount":
          valA = a.totalAmount ?? 0;
          valB = b.totalAmount ?? 0;
          break;
        default:
          valA = a.userName?.toLowerCase() || "";
          valB = b.userName?.toLowerCase() || "";
      }

      if (valA < valB) return adminSortDirection === "asc" ? -1 : 1;
      if (valA > valB) return adminSortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [allBookings, adminSearchTerm, adminDeptFilter, adminEventFilter, activeOrganizer, adminSortColumn, adminSortDirection]);

  const filteredFeedbacks = useMemo(() => {
    if (!activeOrganizer) return feedbacks;
    const organizerEventIds = events.filter(e => e.organizerId === activeOrganizer.id).map(e => e.id);
    return feedbacks.filter(fb => organizerEventIds.includes(fb.eventId));
  }, [feedbacks, activeOrganizer, events]);

  // Auto-recognize organizer on mount/email change
  useEffect(() => {
    if (!activeOrganizer && user) {
      const org = allOrganizers.find(o => o.email.toLowerCase() === user.email.toLowerCase());
      if (org) {
        setActiveOrganizer(org);
        localStorage.setItem('vstech_active_organizer', JSON.stringify(org));
      }
    }
  }, [user, allOrganizers, activeOrganizer]);
  
  useEffect(() => {
    localStorage.setItem("vel-events", JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem("vel-bookings", JSON.stringify(allBookings));
  }, [allBookings]);

  useEffect(() => {
    localStorage.setItem("vel-reminders", JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem("vel-messages", JSON.stringify(userMessages));
  }, [userMessages]);

  useEffect(() => {
    localStorage.setItem("vel-feedbacks", JSON.stringify(feedbacks));
  }, [feedbacks]);

  useEffect(() => {
    localStorage.setItem("vel-user", JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem("vel-admin-auth", isAdminAuthenticated.toString());
  }, [isAdminAuthenticated]);

  useEffect(() => {
    localStorage.setItem("vel-favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem("vel-waitlist", JSON.stringify(waitlist));
  }, [waitlist]);

  useEffect(() => {
    localStorage.setItem("vel-theme", theme);
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  const toggleFavorite = (eventId: string) => {
    setFavorites(prev => 
      prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId]
    );
  };

  const unreadCount = useMemo(() => {
    if (!user) return 0;
    return userMessages.filter(m => m.recipientEmail === user.email && !m.read).length;
  }, [user, userMessages]);

  const favoritedEvents = useMemo(() => {
    return events.filter(e => favorites.includes(e.id));
  }, [events, favorites]);

  const filteredEvents = useMemo(() => {
    const term = searchTerm.toLowerCase();
    
    return events.filter(e => {
      const organizer = allOrganizers.find(o => o.id === e.organizerId);
      const organizerName = organizer?.name.toLowerCase() || "";
      
      return (
        e.name.toLowerCase().includes(term) || 
        e.description.toLowerCase().includes(term) ||
        e.department.toLowerCase().includes(term) ||
        organizerName.includes(term)
      );
    });
  }, [events, searchTerm, allOrganizers]);

  const selectedEvent = useMemo(() => {
    if (!selectedEventId) return null;
    const selected = events.find(e => e.id === selectedEventId);
    if (selected) return selected;
    return null;
  }, [events, selectedEventId]);

  const Highlight = ({ text, highlight }: { text: string; highlight: string }) => {
    if (!highlight.trim()) {
      return <span>{text}</span>;
    }
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => (
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={i} className="bg-blue-100 text-blue-900 rounded-sm px-0.5 font-bold transition-all decoration-blue-400 underline decoration-2 underline-offset-2">{part}</mark>
          ) : (
            <span key={i}>{part}</span>
          )
        ))}
      </span>
    );
  };

  const handleBookingComplete = async (booking: BookingData) => {
    // Check for duplicate booking
    const isDuplicate = allBookings.some(b => 
      b.email.toLowerCase() === booking.email.toLowerCase() && 
      b.event.id === booking.event.id
    );

    if (isDuplicate) {
      alert(`You have already registered for ${booking.event.name} with this email address.`);
      return;
    }

    const bookingWithId = {
      ...booking,
      id: Math.random().toString(36).substr(2, 9),
      attendanceStatus: "pending" as const,
      isEntryTicketEnabled: true
    };

    setEvents((prev) => prev.map(e => 
      e.id === bookingWithId.event.id 
        ? { ...e, availableTickets: e.availableTickets - bookingWithId.numTickets }
        : e
    ));

    setDispatchStatus("email");

    // Connect to Professional University Cloud Backend
    try {
      const response = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: bookingWithId.userName,
          email: bookingWithId.email,
          phone: bookingWithId.phone,
          eventName: bookingWithId.event.name,
          bookingId: `VS-${bookingWithId.id?.slice(-4).toUpperCase()}`
        })
      });

      if (response.ok) {
        setDispatchStatus("whatsapp");
        
        // Brief pause to simulate Meta WhatsApp API handshake
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setAllBookings((prev) => [bookingWithId, ...prev]);
        socket.emit("new_booking", bookingWithId);
        setBookingSummary(bookingWithId);
        setDispatchStatus("confirmed");
        
        setTimeout(() => setDispatchStatus("idle"), 2000);

        const emailContent = `CONFIRMED: Your spot is reserved for ${bookingWithId.event.name} at VS TECH! 
Booking ID: VS-${bookingWithId.id?.slice(-4).toUpperCase()}
Date: ${bookingWithId.event.dateTime}
Tickets: ${bookingWithId.numTickets}

Success! Your Digital Entry Ticket is now available in the Rewards tab. Kindly reach the venue 15 mins before. We have sent the digital ticket and WhatsApp notification to your registered details.`;

        const confirmationMessage: UserMessage = {
          id: Math.random().toString(36).substr(2, 9),
          recipientEmail: bookingWithId.email,
          content: emailContent,
          timestamp: new Date().toISOString(),
          read: false,
          type: "success"
        };

        setUserMessages(prev => [confirmationMessage, ...prev]);
      }
    } catch (err) {
      console.error("Backend Dispatch Error:", err);
      // Fallback for UI if backend is unreachable
      setDispatchStatus("idle");
      setAllBookings((prev) => [bookingWithId, ...prev]);
      setBookingSummary(bookingWithId);
    }
  };

  const handleToggleAttendance = (bookingId: string) => {
    const booking = allBookings.find(b => b.id === bookingId);
    if (!booking) return;

    const nextStatus = booking.attendanceStatus === "present" ? "absent" : 
                       booking.attendanceStatus === "absent" ? "pending" : "present";
    
    // Simulate sending SMS & In-app Notification
    let messageContent = "";
    let messageType: "success" | "warning" | "info" = "info";

    if (nextStatus === "present") {
      messageContent = `You are attending ${booking.event.name}! Great day! - VS Tech Team`;
      messageType = "success";
      alert(`[SMS SENT to ${booking.phone}]\n"${messageContent}"`);
    } else if (nextStatus === "absent") {
      messageContent = `We noticed you missed ${booking.event.name}. Hope joining us for the next one! - VS Tech Team`;
      messageType = "warning";
      alert(`[SMS SENT to ${booking.phone}]\n"${messageContent}"`);
    }

    if (messageContent) {
      const newMessage: UserMessage = {
        id: Math.random().toString(36).substr(2, 9),
        recipientEmail: booking.email,
        content: messageContent,
        timestamp: new Date().toISOString(),
        read: false,
        type: messageType
      };
      setUserMessages(prev => [newMessage, ...prev]);
    }

    setAllBookings(prev => prev.map(b => 
      b.id === bookingId ? { ...b, attendanceStatus: nextStatus } : b
    ));
    socket.emit("attendance_change", { bookingId, status: nextStatus });
  };

  const handleToggleCertificate = (bookingId: string) => {
    const booking = allBookings.find(b => b.id === bookingId);
    if (!booking) return;

    const willEnable = !booking.isCertificateEnabled;

    if (willEnable) {
      const newMessage: UserMessage = {
        id: Math.random().toString(36).substr(2, 9),
        recipientEmail: booking.email,
        content: `Your certificate for "${booking.event.name}" is now ready for download! Access it in your Certificates tab.`,
        timestamp: new Date().toISOString(),
        read: false,
        type: "success"
      };
      setUserMessages(prev => [newMessage, ...prev]);
    }

    setAllBookings(prev => prev.map(b => 
      b.id === bookingId ? { ...b, isCertificateEnabled: willEnable } : b
    ));
  };

  const handleToggleFoodCoupon = (bookingId: string) => {
    const booking = allBookings.find(b => b.id === bookingId);
    if (!booking) return;

    const willEnable = !booking.isFoodCouponEnabled;

    if (willEnable) {
      const newMessage: UserMessage = {
        id: Math.random().toString(36).substr(2, 9),
        recipientEmail: booking.email,
        content: `Your food coupon for "${booking.event.name}" is now available! Access it in your Rewards tab.`,
        timestamp: new Date().toISOString(),
        read: false,
        type: "success"
      };
      setUserMessages(prev => [newMessage, ...prev]);
    }

    setAllBookings(prev => prev.map(b => 
      b.id === bookingId ? { ...b, isFoodCouponEnabled: willEnable } : b
    ));
  };

  const bulkCertEligibleCount = useMemo(() => {
    return filteredAdminBookings.filter(b => b.attendanceStatus === "present" && !b.isCertificateEnabled).length;
  }, [filteredAdminBookings]);

  const bulkFoodEligibleCount = useMemo(() => {
    return filteredAdminBookings.filter(b => b.attendanceStatus === "present" && !b.isFoodCouponEnabled).length;
  }, [filteredAdminBookings]);

  const handleBulkEnableFoodCoupons = () => {
    const eligibleBookings = filteredAdminBookings.filter(b => b.attendanceStatus === "present" && !b.isFoodCouponEnabled);
    
    if (eligibleBookings.length === 0) {
      alert("No students in the current view are marked 'Present' without food coupon access.");
      return;
    }

    const confirmMsg = `Enable food coupons for all ${eligibleBookings.length} present students in the current list?`;

    if (window.confirm(confirmMsg)) {
      const updatedIds = new Set(eligibleBookings.map(b => b.id).filter(Boolean));
      
      // Batch update bookings
      setAllBookings(prev => prev.map(b => 
        (b.id && updatedIds.has(b.id)) ? { ...b, isFoodCouponEnabled: true } : b
      ));

      // Send notifications
      const newMessages: UserMessage[] = eligibleBookings.map(b => ({
        id: Math.random().toString(36).substr(2, 9),
        recipientEmail: b.email,
        content: `Your food coupon for "${b.event.name}" is now ready! View it in your Rewards tab.`,
        timestamp: new Date().toISOString(),
        read: false,
        type: "success"
      }));
      
      setUserMessages(prev => [...newMessages, ...prev]);
      alert(`Success! ${eligibleBookings.length} food coupons enabled.`);
    }
  };

  const handleBulkEnableCertificates = () => {
    const eligibleBookings = filteredAdminBookings.filter(b => b.attendanceStatus === "present" && !b.isCertificateEnabled);
    
    if (eligibleBookings.length === 0) {
      alert("No students in the current view are marked 'Present' without certificate access.");
      return;
    }

    const confirmMsg = `Enable certificates for all ${eligibleBookings.length} present students in the current list?`;

    if (window.confirm(confirmMsg)) {
      const updatedIds = new Set(eligibleBookings.map(b => b.id).filter(Boolean));
      
      // Batch update bookings
      setAllBookings(prev => prev.map(b => 
        (b.id && updatedIds.has(b.id)) ? { ...b, isCertificateEnabled: true } : b
      ));

      // Send notifications
      const newMessages: UserMessage[] = eligibleBookings.map(b => ({
        id: Math.random().toString(36).substr(2, 9),
        recipientEmail: b.email,
        content: `Your certificate for "${b.event.name}" is now ready! View it in your Certificates tab.`,
        timestamp: new Date().toISOString(),
        read: false,
        type: "success"
      }));
      
      setUserMessages(prev => [...newMessages, ...prev]);
      alert(`Success! ${eligibleBookings.length} certificates enabled.`);
    }
  };

  const handleDeleteBooking = (bookingId: string | undefined) => {
    if (!bookingId) {
      alert("Error: Booking ID is missing.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this booking? This will restore available tickets for the event.")) {
      const bookingToDelete = allBookings.find(b => b.id === bookingId);
      if (bookingToDelete) {
        setEvents(prev => prev.map(e => 
          e.id === bookingToDelete.event.id 
            ? { ...e, availableTickets: e.availableTickets + (Number(bookingToDelete.numTickets) || 0) }
            : e
        ));
        // Process waitlist automatically when booking is deleted
        processWaitlistNotifications(bookingToDelete.event.id, Number(bookingToDelete.numTickets) || 0);
      }
      setAllBookings(prev => prev.filter(b => b.id !== bookingId));
    }
  };

  const handleUpdateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;

    setAllBookings(prev => prev.map(b => 
      b.id === editingBooking.id ? editingBooking : b
    ));
    setEditingBooking(null);
  };

  const exportToCSV = () => {
    if (filteredAdminBookings.length === 0) {
      alert("No bookings found to export.");
      return;
    }

    const headers = ["Booking ID", "Student Name", "Email", "Phone", "Department", "College", "Event Name", "Tickets", "Status", "Total Amount"];
    const csvContent = [
      headers.join(","),
      ...filteredAdminBookings.map(b => [
        `"${b.id}"`,
        `"${b.userName}"`,
        `"${b.email}"`,
        `"${b.phone}"`,
        `"${b.department}"`,
        `"${b.collegeName}"`,
        `"${b.event.name}"`,
        b.numTickets,
        `"${b.attendanceStatus || "pending"}"`,
        b.totalAmount
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `bookings_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    if (filteredAdminBookings.length === 0) {
      alert("No bookings found to export.");
      return;
    }

    const doc = new jsPDF("p", "mm", "a4");

    // Set document meta
    doc.setProperties({
      title: "VS Tech Event Registration Records",
      subject: "Event Registration Report",
      author: "VS Tech Admin",
      creator: "VS Tech Event Book System"
    });

    // 1. Draw Brand Header Background
    doc.setFillColor(37, 99, 235); // Blue (#2563EB)
    doc.rect(0, 0, 210, 38, "F");

    // Banner Accent Stripe (amber)
    doc.setFillColor(245, 158, 11); // Amber (#F59E0B)
    doc.rect(0, 38, 210, 2, "F");

    // 2. Add Brand Text
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("VS TECH EVENT BOOK", 15, 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(219, 234, 254); // Light blue
    doc.text("OFFICIAL REGISTERED ATTENDEES & BOOKINGS REPORT", 15, 25);
    doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 15, 30);

    // Filter summary
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text("ADMIN DASHBOARD", 195, 15, { align: "right" });
    if (adminSearchTerm || adminDeptFilter || adminEventFilter) {
      const filterDesc = [
        adminSearchTerm ? `Search: "${adminSearchTerm}"` : "",
        adminDeptFilter ? `Dept: ${adminDeptFilter}` : "",
        adminEventFilter ? `Event: ${events.find(e => e.id === adminEventFilter)?.name || adminEventFilter}` : ""
      ].filter(Boolean).join(" | ");
      doc.setFontSize(8);
      doc.text(`Filters: ${filterDesc}`, 195, 22, { align: "right" });
    }

    // 3. Overview Statistics Block
    doc.setFillColor(248, 250, 252); // Soft light Gray
    doc.setDrawColor(226, 232, 240); // Gray 200
    doc.roundedRect(14, 48, 182, 24, 3, 3, "FD");

    // Metrics calculation
    const totalBookings = filteredAdminBookings.length;
    const totalTickets = filteredAdminBookings.reduce((sum, b) => sum + (b.numTickets || 0), 0);
    const presentAttendance = filteredAdminBookings.filter(b => b.attendanceStatus === "present").length;
    const totalRev = filteredAdminBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    // Metric Labels and Values
    doc.setTextColor(71, 85, 105); // Slate 600
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("TOTAL BOOKINGS", 25, 54);
    doc.text("TOTAL TICKETS", 75, 54);
    doc.text("ATTENDED COUNT", 125, 54);
    doc.text("TOTAL REVENUE", 170, 54);

    doc.setTextColor(15, 23, 42); // Slate 900
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(String(totalBookings), 25, 62);
    doc.text(String(totalTickets), 75, 62);
    doc.text(`${presentAttendance} (${totalBookings > 0 ? Math.round((presentAttendance / totalBookings) * 100) : 0}%)`, 125, 62);
    doc.text(`INR ${totalRev.toLocaleString()}`, 170, 62);

    // 4. Data Table Using autoTable
    const tableData = filteredAdminBookings.map((b, index) => [
      index + 1,
      `${b.userName}\n${b.email}`,
      b.phone || "N/A",
      `${b.collegeName}\n${b.department}`,
      b.event.name,
      b.numTickets,
      (b.attendanceStatus || "pending").toUpperCase(),
      `INR ${b.totalAmount}`
    ]);

    const tableHeaders = [
      ["#", "Student details", "Phone", "College / Department", "Event Name", "Tickets", "Status", "Amount"]
    ];

    autoTable(doc, {
      startY: 78,
      head: tableHeaders,
      body: tableData,
      theme: "striped",
      headStyles: {
        fillColor: [37, 99, 235], // Theme Blue
        textColor: 255,
        fontStyle: "bold",
        fontSize: 9,
        halign: "left"
      },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: 42 },
        2: { cellWidth: 24 },
        3: { cellWidth: 40 },
        4: { cellWidth: 32 },
        5: { cellWidth: 14, halign: "center" },
        6: { cellWidth: 20, halign: "center", fontStyle: "bold" },
        7: { cellWidth: 20, halign: "right", fontStyle: "bold" }
      },
      styles: {
        fontSize: 8,
        cellPadding: 4,
        overflow: "linebreak",
        valign: "middle"
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252] // Light gray stripe
      },
      didParseCell: function(data) {
        if (data.section === "body" && data.column.index === 6) {
          const statusText = data.cell.text[0];
          if (statusText === "PRESENT") {
            data.cell.styles.textColor = [16, 185, 129]; // Emerald (green)
          } else if (statusText === "PENDING" || statusText === "WAITING") {
            data.cell.styles.textColor = [217, 119, 6]; // Amber (yellow-orange)
          } else {
            data.cell.styles.textColor = [239, 68, 68]; // Red
          }
        }
      },
      didDrawPage: function(data) {
        // Page footer
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184); // Slate 400
        
        // Footer divider line
        doc.setDrawColor(241, 245, 249);
        doc.line(14, doc.internal.pageSize.getHeight() - 15, 196, doc.internal.pageSize.getHeight() - 15);

        // Footer text
        doc.text("VS Tech Event Book Server Records — Confidential Admin Document", 14, doc.internal.pageSize.getHeight() - 10);
        
        const str = `Page ${data.pageNumber}`;
        doc.text(str, 196, doc.internal.pageSize.getHeight() - 10, { align: "right" });
      }
    });

    // Save report
    doc.save(`bookings_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleImageUpdate = (eventId: string, newImageUrl: string) => {
    setEvents((prev) => prev.map(e => 
      e.id === eventId ? { ...e, image: newImageUrl } : e
    ));
  };

  const handleBack = () => {
    setBookingSummary(null);
    setSelectedEventId(INITIAL_EVENTS[0].id);
  };

  const handleSignInSuccess = (email: string, name: string) => {
    const newUser = { email, name };
    setUser(newUser);
    localStorage.setItem("vel-user", JSON.stringify(newUser));
  };

  const handleSubmitFeedback = (feedback: Omit<FeedbackData, "id" | "timestamp">) => {
    const newFeedback: FeedbackData = {
      ...feedback,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
    };
    setFeedbacks(prev => [newFeedback, ...prev]);
    alert("Thank you for your feedback!");
  };

  const handleSignOut = () => {
    setUser(null);
  };

  const toggleReminder = async (eventId: string, eventName: string) => {
    if (reminders.includes(eventId)) {
      setReminders(prev => prev.filter(id => id !== eventId));
      return;
    }

    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setReminders(prev => [...prev, eventId]);
        new Notification("Reminder Set!", {
          body: `We'll notify you when ${eventName} is near.`,
        });
      } else {
        alert("Please enable notifications to receive reminders.");
      }
    } else {
      setReminders(prev => [...prev, eventId]);
      alert(`Reminder set for ${eventName}! (Simulated)`);
    }
  };

  const getCalendarLink = (event: EventData) => {
    const start = event.dateTime.replace(/-/g, "") + "T090000Z";
    const end = event.dateTime.replace(/-/g, "") + "T120000Z";
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.name)}&dates=${start}/${end}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.venue)}`;
  };

  return (
    <div className="min-h-screen pb-20">
      <SignInModal 
        isOpen={isSignInModalOpen} 
        onClose={() => setIsSignInModalOpen(false)} 
        onSuccess={handleSignInSuccess}
        initialEmail={user?.email || ""}
        initialName={user?.name || ""}
        initialMode={signInModalMode}
      />

      <FeedbackModal 
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        booking={feedbackBooking}
        onSubmit={handleSubmitFeedback}
      />

      <EventEditModal 
        isOpen={isEventModalOpen}
        event={editingEvent}
        onClose={() => {
          setEditingEvent(null);
          setIsEventModalOpen(false);
        }}
        onSave={handleSaveEvent}
      />

      {/* Bulk Ticket Update Modal */}
      <AnimatePresence>
        {isBulkModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBulkModalOpen(false)}
              className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-neutral-900 tracking-tight">Bulk Ticket Update</h3>
                    <p className="text-sm text-neutral-500 font-medium">Update ticket capacity for all events.</p>
                  </div>
                  <button 
                    onClick={() => setIsBulkModalOpen(false)}
                    className="p-2 hover:bg-neutral-100 rounded-xl text-neutral-400 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="flex bg-neutral-100 p-1.5 rounded-2xl">
                    <button
                      onClick={() => setBulkUpdateType("add")}
                      className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${bulkUpdateType === "add" ? "bg-white text-blue-600 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}
                    >
                      Add Tickets
                    </button>
                    <button
                      onClick={() => setBulkUpdateType("set")}
                      className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${bulkUpdateType === "set" ? "bg-white text-blue-600 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}
                    >
                      Set Capacity
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">
                      {bulkUpdateType === "add" ? "Amount to Add" : "New Total Capacity"}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={bulkTicketValue || ""}
                        onChange={(e) => setBulkTicketValue(parseInt(e.target.value) || 0)}
                        className="w-full pl-12 pr-4 py-4 bg-neutral-50 rounded-2xl border border-neutral-100 outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-black text-xl text-neutral-900"
                        placeholder="0"
                      />
                      <Ticket className="w-6 h-6 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-[10px] text-neutral-400 font-medium italic ml-1 leading-relaxed">
                      {bulkUpdateType === "add" 
                        ? "This will increase the total ticket count of all authorized events by this amount." 
                        : "This will set the total ticket count of all authorized events to exactly this value."}
                    </p>
                  </div>

                  <button
                    onClick={handleBulkTicketUpdate}
                    disabled={bulkUpdateType === "set" && bulkTicketValue <= 0}
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-4"
                  >
                    Apply Bulk Update
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Email & WhatsApp Dispatching Modal */}
      <AnimatePresence>
        {dispatchStatus !== "idle" && dispatchStatus !== "confirmed" && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-neutral-900/60 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-sm w-full text-center space-y-8"
            >
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 border-8 border-neutral-50 rounded-full" />
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className={`absolute inset-0 border-8 rounded-full border-t-transparent ${dispatchStatus === "email" ? "border-blue-600" : "border-emerald-500"}`}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  {dispatchStatus === "email" ? (
                    <Mail className="w-10 h-10 text-blue-600" />
                  ) : (
                    <MessageCircle className="w-10 h-10 text-emerald-500" />
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-100 rounded text-[8px] font-black uppercase text-neutral-400 tracking-widest mx-auto mb-2">
                  Simulation Mode
                </div>
                <h3 className="text-2xl font-black text-neutral-900 tracking-tight">
                  {dispatchStatus === "email" ? "Syncing Google Email" : "Connecting to WhatsApp"}
                </h3>
                <p className="text-sm text-neutral-500 font-medium leading-relaxed">
                  {dispatchStatus === "email" 
                    ? "Dispatching original digital ticket to user's Google Inbox..." 
                    : "Sending confirmation and QR code to contact number via Meta API..."}
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 px-4 py-2 bg-neutral-50 rounded-2xl">
                <div className={`w-2 h-2 rounded-full animate-ping ${dispatchStatus === "email" ? "bg-blue-500" : "bg-emerald-500"}`} />
                <span className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">External Dispatch Active</span>
              </div>
            </motion.div>
          </motion.div>
        )}

        {editingBooking && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
                <h3 className="text-xl font-black text-neutral-900">Edit Student Info</h3>
                <button 
                  onClick={() => setEditingBooking(null)}
                  className="p-2 hover:bg-neutral-200 rounded-xl transition-colors"
                >
                  <UserX className="w-5 h-5 text-neutral-500" />
                </button>
              </div>
              
              <form onSubmit={handleUpdateBooking} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-neutral-400 uppercase tracking-widest">Student Name</label>
                    <input 
                      type="text"
                      value={editingBooking.userName}
                      onChange={(e) => setEditingBooking({...editingBooking, userName: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-neutral-400 uppercase tracking-widest">Phone Number</label>
                    <input 
                      type="tel"
                      value={editingBooking.phone}
                      onChange={(e) => setEditingBooking({...editingBooking, phone: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-neutral-400 uppercase tracking-widest">Department</label>
                    <select 
                      value={editingBooking.department}
                      onChange={(e) => setEditingBooking({...editingBooking, department: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold"
                    >
                      {DEPARTMENTS.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-neutral-400 uppercase tracking-widest">College Name</label>
                    <input 
                      type="text"
                      value={editingBooking.collegeName}
                      onChange={(e) => setEditingBooking({...editingBooking, collegeName: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setEditingBooking(null)}
                    className="flex-1 py-4 rounded-2xl border border-neutral-200 text-neutral-600 font-bold hover:bg-neutral-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-100 dark:border-neutral-800/80 py-6 mb-8 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => { setActiveTab("events"); setBookingSummary(null); }}
          >
            <div className="bg-blue-600 dark:bg-blue-500 p-2 rounded-lg text-white">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-black font-display tracking-tight text-neutral-900 dark:text-neutral-50">
              VS Tech<span className="text-blue-600 dark:text-blue-400"> Event</span> Book
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setTheme(prev => prev === "light" ? "dark" : "light")}
              className="p-2.5 rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-all active:scale-95 flex items-center justify-center border border-neutral-200/50 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 cursor-pointer shadow-sm select-none"
              title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
              <AnimatePresence mode="wait" initial={false}>
                {theme === "light" ? (
                  <motion.div
                    key="moon"
                    initial={{ rotate: -45, scale: 0.8, opacity: 0 }}
                    animate={{ rotate: 0, scale: 1, opacity: 1 }}
                    exit={{ rotate: 45, scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Moon className="w-4 h-4 text-violet-600" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="sun"
                    initial={{ rotate: 45, scale: 0.8, opacity: 0 }}
                    animate={{ rotate: 0, scale: 1, opacity: 1 }}
                    exit={{ rotate: -45, scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Sun className="w-4 h-4 text-amber-400" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            <div className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => { setActiveTab("events"); setBookingSummary(null); }}
              className={`text-sm font-semibold transition-colors ${activeTab === "events" ? "text-blue-600" : "text-neutral-500 hover:text-blue-600"}`}
            >
              Events
            </button>
            {user && (
              <button 
                onClick={() => { setActiveTab("favorites"); setBookingSummary(null); }}
                className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${activeTab === "favorites" ? "text-blue-600" : "text-neutral-500 hover:text-blue-600"}`}
              >
                Favorites
                {favorites.length > 0 && (
                  <span className="w-4 h-4 bg-blue-100 text-blue-600 text-[10px] flex items-center justify-center rounded-full font-bold">
                    {favorites.length}
                  </span>
                )}
              </button>
            )}
            <button 
              onClick={() => { setActiveTab("organizers"); setSelectedOrganizer(null); }}
              className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${activeTab === "organizers" ? "text-blue-600" : "text-neutral-500 hover:text-blue-600"}`}
            >
              <User className="w-4 h-4" />
              Organizers
            </button>
            <button 
              onClick={() => { setActiveTab("my-bookings"); setBookingSummary(null); }}
              className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${activeTab === "my-bookings" ? "text-blue-600" : "text-neutral-500 hover:text-blue-600"}`}
            >
              My Bookings
              {unreadCount > 0 && (
                <span className="w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
            {user && (
              <button 
                onClick={() => { setActiveTab("certificates"); setBookingSummary(null); }}
                className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${activeTab === "certificates" ? "text-blue-600" : "text-neutral-500 hover:text-blue-600"}`}
              >
                <Award className="w-4 h-4" />
                Rewards
              </button>
            )}
            {user && (
              <button 
                onClick={() => { setActiveTab("profile"); setBookingSummary(null); }}
                className={`text-sm font-semibold transition-colors ${activeTab === "profile" ? "text-blue-600" : "text-neutral-500 hover:text-blue-600"}`}
              >
                Profile
              </button>
            )}
            <button 
              onClick={() => { setActiveTab("admin"); setBookingSummary(null); }}
              className={`text-sm font-semibold transition-colors ${activeTab === "admin" ? "text-blue-600" : "text-neutral-500 hover:text-blue-600"}`}
            >
              Admin
            </button>
            
            {user ? (
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => { setActiveTab("profile"); setBookingSummary(null); }}
                  className="flex items-center gap-2 text-sm font-bold text-neutral-900 bg-neutral-50 px-3 py-1.5 rounded-full hover:bg-neutral-100 transition-colors"
                >
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span className="max-w-[120px] truncate">{user.name}</span>
                </button>
                <button 
                  onClick={handleSignOut}
                  className="text-neutral-400 hover:text-red-500 transition-colors p-1"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => { setSignInModalMode("signin"); setIsSignInModalOpen(true); }}
                  className="text-neutral-600 hover:text-blue-600 text-sm font-bold transition-colors"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => { setSignInModalMode("signup"); setIsSignInModalOpen(true); }}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>

      <main className="max-w-6xl mx-auto px-4">
        <AnimatePresence mode="wait">
          {activeTab === "admin" ? (
            <motion.div
              key="admin"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-8"
            >
              {!isAdminAuthenticated && !activeOrganizer ? (
                <div className="max-w-md mx-auto mt-20">
                  <div className="bg-white p-8 rounded-[2.5rem] border border-neutral-100 shadow-2xl space-y-6">
                    <div className="flex bg-neutral-100 p-1 rounded-2xl mb-4">
                      <button 
                        onClick={() => { setAdminPortalMode("admin"); setAdminError(""); }}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${adminPortalMode === "admin" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}
                      >
                        Administrator
                      </button>
                      <button 
                        onClick={() => { setAdminPortalMode("organizer"); setAdminError(""); }}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${adminPortalMode === "organizer" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}
                      >
                        Organizer
                      </button>
                    </div>

                    <div className="text-center space-y-2">
                      <div className="w-16 h-16 bg-neutral-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 scale-110">
                        {adminPortalMode === "admin" ? <Lock className="w-8 h-8" /> : <User className="w-8 h-8" />}
                      </div>
                      <h2 className="text-2xl font-black text-neutral-900 tracking-tight">
                        {adminPortalMode === "admin" ? "Admin Access" : "Organizer Portal"}
                      </h2>
                      <p className="text-sm text-neutral-500 font-medium">
                        {adminPortalMode === "admin" 
                          ? "Enter the administrator password to proceed." 
                          : "Enter your registered organizer email to manage your events."}
                      </p>
                    </div>
                    
                    {adminPortalMode === "admin" ? (
                      <form onSubmit={handleAdminLogin} className="space-y-4">
                        <div className="relative">
                          <input 
                            type="password"
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            placeholder="Enter password"
                            className="w-full px-5 py-4 rounded-2xl border border-neutral-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-center font-bold tracking-[0.3em]"
                          />
                        </div>
                        {adminError && (
                          <p className="text-xs text-red-500 font-bold flex items-center justify-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {adminError}
                          </p>
                        )}
                        <button 
                          type="submit"
                          className="w-full bg-neutral-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-xl shadow-neutral-200"
                        >
                          Unlock Admin Portal
                        </button>
                      </form>
                    ) : (
                      <form onSubmit={handleOrganizerLogin} className="space-y-4">
                        <div className="relative">
                          <input 
                            type="email"
                            value={organizerEmail}
                            onChange={(e) => setOrganizerEmail(e.target.value)}
                            placeholder="organizer@veltech.edu.in"
                            className="w-full px-5 py-4 rounded-2xl border border-neutral-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-center font-bold"
                          />
                        </div>
                        {adminError && (
                          <p className="text-xs text-red-500 font-bold flex items-center justify-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {adminError}
                          </p>
                        )}
                        <button 
                          type="submit"
                          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
                        >
                          Access My Dashboard
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div className="space-y-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                          {activeOrganizer ? "Organizer Mode" : "Admin Mode"}
                        </span>
                      </div>
                      <h2 className="text-4xl md:text-5xl font-black font-display text-neutral-900 leading-[1.1]">
                        {activeOrganizer ? `Welcome, ${activeOrganizer.name.split(' ')[0]}.` : "Admin Portal."}
                      </h2>
                      <p className="text-lg text-neutral-500 font-medium leading-relaxed max-w-2xl">
                        {activeOrganizer 
                          ? `You are managing events for the ${activeOrganizer.department}. Review registrations and track live attendance for your hosted events.` 
                          : "Monitor venue capacity, student attendance, and overall event performance across the entire campus."}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => {
                          const savedBookings = localStorage.getItem("vel-bookings");
                          if (savedBookings) {
                            setAllBookings(JSON.parse(savedBookings));
                          }
                          // Simple visual feedback
                          const icon = document.getElementById('refresh-icon');
                          if (icon) {
                            icon.classList.add('animate-spin');
                            setTimeout(() => icon.classList.remove('animate-spin'), 1000);
                          }
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-neutral-200 rounded-2xl text-sm font-black uppercase tracking-widest text-neutral-600 hover:bg-neutral-50 hover:text-blue-600 transition-all shadow-sm active:scale-95"
                        title="Refresh attendance data"
                      >
                        <RefreshCcw id="refresh-icon" className="w-4 h-4 transition-transform" />
                        <span className="hidden sm:inline">Refresh</span>
                      </button>
                      
                      <button 
                        onClick={() => setIsLiveMonitoring(!isLiveMonitoring)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 border ${
                          isLiveMonitoring 
                            ? "bg-emerald-50 border-emerald-100 text-emerald-600" 
                            : "bg-white border-neutral-200 text-neutral-400"
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${isLiveMonitoring ? "bg-emerald-500 animate-pulse" : "bg-neutral-300"}`} />
                        {isLiveMonitoring ? "Live On" : "Live Off"}
                      </button>

                      <button 
                        onClick={() => {
                          setIsAdminAuthenticated(false);
                          localStorage.removeItem("vel-admin-auth");
                          setActiveOrganizer(null);
                          localStorage.removeItem('vstech_active_organizer');
                          setActiveTab("events");
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-neutral-200 rounded-2xl text-sm font-black uppercase tracking-widest text-neutral-600 hover:bg-neutral-50 transition-all shadow-sm active:scale-95"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                    <div className="flex bg-neutral-100 p-1 rounded-2xl">
                      <button 
                        onClick={() => setAdminSubTab("insights")}
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${adminSubTab === "insights" ? "bg-white text-blue-600 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}
                      >
                        Insights
                      </button>
                      <button 
                        onClick={() => setAdminSubTab("bookings")}
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${adminSubTab === "bookings" ? "bg-white text-blue-600 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}
                      >
                        Bookings
                      </button>
                      <button 
                        onClick={() => setAdminSubTab("feedback")}
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${adminSubTab === "feedback" ? "bg-white text-blue-600 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}
                      >
                        Feedback
                      </button>
                      <button 
                        onClick={() => setAdminSubTab("events")}
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${adminSubTab === "events" ? "bg-white text-blue-600 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}
                      >
                        Manage Events
                      </button>
                      <button 
                        onClick={() => setAdminSubTab("waitlist")}
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${adminSubTab === "waitlist" ? "bg-white text-blue-600 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}
                      >
                        Waitlist ({waitlist.length})
                      </button>
                    </div>

                    {adminSubTab === "bookings" && (
                      <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto flex-1">
                        <div className="relative flex-1">
                          <input 
                            type="text" 
                            placeholder="Search students..."
                            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-neutral-100 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm font-medium"
                            value={adminSearchTerm}
                            onChange={(e) => setAdminSearchTerm(e.target.value)}
                          />
                          <User className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        </div>
                        
                        <select
                          className="px-4 py-3 rounded-2xl border border-neutral-100 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm font-bold text-neutral-600 cursor-pointer"
                          value={adminDeptFilter}
                          onChange={(e) => setAdminDeptFilter(e.target.value)}
                        >
                          <option value="">All Departments</option>
                          {DEPARTMENTS.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>

                        <select
                          className="px-4 py-3 rounded-2xl border border-neutral-100 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm font-bold text-neutral-600 cursor-pointer max-w-[200px]"
                          value={adminEventFilter}
                          onChange={(e) => setAdminEventFilter(e.target.value)}
                        >
                          <option value="">All Events</option>
                          {Array.from(new Set(
                            allBookings
                              .filter(b => !activeOrganizer || b.event.organizerId === activeOrganizer.id)
                              .map(b => b.event.name)
                          )).map(eventName => (
                            <option key={eventName} value={eventName}>{eventName}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-2">
                      {adminSubTab === "bookings" && (
                        <>
                          <div className="flex items-center gap-2 border-r border-neutral-200 pr-2 mr-2 hidden sm:flex">
                            <div className="bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 flex items-center gap-2">
                              <span className="text-[9px] font-black text-emerald-600 uppercase tracking-tight">Verified</span>
                              <span className="text-sm font-black text-emerald-700">{filteredAdminBookings.filter(b => b.attendanceStatus === "present").length}</span>
                            </div>
                            <div className="bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 flex items-center gap-2">
                              <span className="text-[9px] font-black text-blue-600 uppercase tracking-tight">Pending</span>
                              <span className="text-sm font-black text-blue-700">{filteredAdminBookings.filter(b => b.attendanceStatus !== "present").length}</span>
                            </div>
                          </div>
                          <button 
                            onClick={handleBulkEnableCertificates}
                            disabled={bulkCertEligibleCount === 0}
                            className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest shadow-lg transition-all group ${
                              bulkCertEligibleCount > 0 
                                ? "bg-blue-600 hover:bg-blue-700 shadow-blue-100 hover:-translate-y-0.5 active:translate-y-0" 
                                : "bg-neutral-300 cursor-not-allowed opacity-60"
                            }`}
                            title={bulkCertEligibleCount > 0 ? `Enable certificates for ${bulkCertEligibleCount} students` : "No eligible students found in current view"}
                          >
                            <FileText className={`w-4 h-4 transition-transform ${bulkCertEligibleCount > 0 ? "group-hover:scale-110" : ""}`} />
                            Bulk Certs {bulkCertEligibleCount > 0 && (
                              <span className="bg-blue-500 text-white px-1.5 py-0.5 rounded-md text-[8px] animate-in fade-in zoom-in duration-300">
                                {bulkCertEligibleCount}
                              </span>
                            )}
                          </button>
                          <button 
                            onClick={handleBulkEnableFoodCoupons}
                            disabled={bulkFoodEligibleCount === 0}
                            className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest shadow-lg transition-all group ${
                              bulkFoodEligibleCount > 0 
                                ? "bg-orange-500 hover:bg-orange-600 shadow-orange-100 hover:-translate-y-0.5 active:translate-y-0" 
                                : "bg-neutral-300 cursor-not-allowed opacity-60"
                            }`}
                            title={bulkFoodEligibleCount > 0 ? `Enable food coupons for ${bulkFoodEligibleCount} students` : "No eligible students found in current view"}
                          >
                            <Utensils className={`w-4 h-4 transition-transform ${bulkFoodEligibleCount > 0 ? "group-hover:scale-110" : ""}`} />
                            Bulk Food {bulkFoodEligibleCount > 0 && (
                              <span className="bg-orange-400 text-white px-1.5 py-0.5 rounded-md text-[8px] animate-in fade-in zoom-in duration-300">
                                {bulkFoodEligibleCount}
                              </span>
                            )}
                          </button>
                          <button 
                            onClick={exportToCSV}
                            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 px-4 py-3 rounded-2xl text-white text-sm font-bold shadow-lg shadow-emerald-100 transition-all cursor-pointer"
                            title="Export to CSV"
                          >
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">CSV Export</span>
                          </button>
                          <button 
                            onClick={exportToPDF}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-3 rounded-2xl text-white text-sm font-bold shadow-lg shadow-red-100 transition-all cursor-pointer"
                            title="Export current view to a branded printable PDF report"
                          >
                            <FileText className="w-4 h-4" />
                            <span className="hidden sm:inline">Export PDF</span>
                          </button>
                        </>
                      )}
                      {adminSubTab === "events" && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setEditingEvent(null);
                              setIsEventModalOpen(true);
                            }}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-2xl text-white text-sm font-bold shadow-lg shadow-blue-100 transition-all font-display"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Create Event</span>
                          </button>
                          <button 
                            onClick={() => setIsBulkModalOpen(true)}
                            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 px-4 py-3 rounded-2xl text-white text-sm font-bold shadow-lg shadow-amber-100 transition-all font-display"
                          >
                            <Ticket className="w-4 h-4" />
                            <span>Bulk Update</span>
                          </button>
                        </div>
                      )}
                      <div className="bg-blue-600 px-4 py-3 rounded-2xl text-white text-sm font-bold shadow-lg shadow-blue-100 shrink-0 font-display">
                        {adminSubTab === "insights" ? "Advanced Analytics" : adminSubTab === "bookings" ? `Total: ${filteredAdminBookings.length}` : adminSubTab === "feedback" ? `Feedbacks: ${filteredFeedbacks.length}` : adminSubTab === "waitlist" ? `Waitlisted: ${waitlist.length}` : `Events: ${events.length}`}
                      </div>
                    </div>
                  </div>

                  {adminSubTab === "insights" && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-8"
                    >
                      {/* Analytics Header Metrics */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-[2rem] border border-neutral-100 shadow-sm">
                          <p className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-1">Total Bookings</p>
                          <h4 className="text-3xl font-black text-neutral-800 tracking-tighter">
                            {allBookings.length}
                          </h4>
                          <div className="mt-2 text-emerald-500 text-[10px] font-bold">Total verified & outstanding registrations</div>
                        </div>
                        <div className="bg-white p-6 rounded-[2rem] border border-neutral-100 shadow-sm">
                          <p className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-1">Upcoming Events</p>
                          <h4 className="text-3xl font-black text-neutral-800 tracking-tighter">
                            {events.filter(e => new Date(e.dateTime) >= new Date()).length || events.length}
                          </h4>
                          <div className="mt-2 text-blue-500 text-[10px] font-bold">Active & scheduled campus events</div>
                        </div>
                        <div className="bg-white p-6 rounded-[2rem] border border-neutral-100 shadow-sm">
                          <p className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-1">Waitlist Requests</p>
                          <h4 className="text-3xl font-black text-neutral-800 tracking-tighter">
                            {waitlist.length}
                          </h4>
                          <div className="mt-2 text-amber-500 text-[10px] font-bold">Students waiting for slots due to cancellations</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Registration Trends */}
                        <div className="bg-white p-8 rounded-[2rem] border border-neutral-100 shadow-sm space-y-6">
                          <h3 className="text-xl font-black text-neutral-900 italic">Registration Trends</h3>
                          <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={events.map(e => ({
                                name: e.name.length > 15 ? e.name.substring(0, 15) + '...' : e.name,
                                registrations: allBookings.filter(b => b.event.id === e.id).length,
                                attendees: allBookings.filter(b => b.event.id === e.id && b.attendanceStatus === 'present').length
                              }))}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" fontSize={10} fontWeight="bold" />
                                <YAxis fontSize={10} fontWeight="bold" />
                                <Tooltip 
                                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold' }} />
                                <Bar dataKey="registrations" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="attendees" fill="#10b981" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Department Distribution */}
                        <div className="bg-white p-8 rounded-[2rem] border border-neutral-100 shadow-sm space-y-6">
                          <h3 className="text-xl font-black text-neutral-900 italic">Engagement by Department</h3>
                          <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={[
                                    { name: 'CSE', value: allBookings.filter(b => b.department === 'CSE').length },
                                    { name: 'ECE', value: allBookings.filter(b => b.department === 'ECE').length },
                                    { name: 'MECH', value: allBookings.filter(b => b.department === 'MECH').length },
                                    { name: 'IT', value: allBookings.filter(b => b.department === 'IT').length },
                                  ].filter(d => d.value > 0)}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={100}
                                  paddingAngle={5}
                                  dataKey="value"
                                >
                                  {['#3b82f6', '#10b981', '#f59e0b', '#ef4444'].map((color, index) => (
                                    <Cell key={`cell-${index}`} fill={color} />
                                  ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '16px' }} />
                                <Legend />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>

                      {/* Student Feedback Keywords & Sentiment Analysis Section */}
                      <FeedbackInsights feedbacks={feedbacks} events={events} />
                    </motion.div>
                  )}

                  {adminSubTab === "events" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {events.map((event) => (
                        <div key={event.id} className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden flex flex-col">
                          <div className="h-32 bg-neutral-100 overflow-hidden relative">
                            <img src={event.image} alt={event.name} className="w-full h-full object-cover" />
                            <div className="absolute top-2 right-2 flex gap-1">
                              <button 
                                onClick={() => {
                                  setEditingEvent(event);
                                  setIsEventModalOpen(true);
                                }}
                                className="p-2 bg-white/90 rounded-lg text-blue-600 hover:bg-white shadow-sm transition-colors"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="p-5 flex-1 space-y-3">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-blue-50 text-[9px] font-black text-blue-600 uppercase rounded-md border border-blue-100">
                                {event.department.split(' ').pop()}
                              </span>
                            </div>
                            <h4 className="font-black text-neutral-900 leading-tight line-clamp-1">{event.name}</h4>
                            <p className="text-xs text-neutral-500 font-medium line-clamp-2">{event.description}</p>
                            <div className="pt-2 flex items-center justify-between">
                              <span className="text-sm font-black text-neutral-900">₹{event.price}</span>
                              <div className="flex items-center gap-3">
                                {getEventRating(event.id) && (
                                  <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                    <span className="text-[10px] font-black text-neutral-700">{getEventRating(event.id)?.average}</span>
                                  </div>
                                )}
                                <span className="text-[10px] font-bold text-neutral-400">{event.availableTickets}/{event.totalTickets} Left</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {adminSubTab === "bookings" && (
                    <div className="bg-white rounded-3xl border border-neutral-100 shadow-xl overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-neutral-50 border-b border-neutral-100">
                            <th 
                              onClick={() => handleSort("userName")}
                              className="px-6 py-4 text-[10px] font-black uppercase text-neutral-400 tracking-widest cursor-pointer hover:bg-neutral-100 hover:text-neutral-700 select-none transition-colors group"
                            >
                              <div className="flex items-center gap-1">
                                <span>Student Name</span>
                                {adminSortColumn === "userName" ? (
                                  adminSortDirection === "asc" ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />
                                ) : (
                                  <ArrowUpDown className="w-3 h-3 text-neutral-300 opacity-20 group-hover:opacity-100 transition-opacity" />
                                )}
                              </div>
                            </th>
                            <th 
                              onClick={() => handleSort("phone")}
                              className="px-6 py-4 text-[10px] font-black uppercase text-neutral-400 tracking-widest cursor-pointer hover:bg-neutral-100 hover:text-neutral-700 select-none transition-colors group"
                            >
                              <div className="flex items-center gap-1">
                                <span>Phone</span>
                                {adminSortColumn === "phone" ? (
                                  adminSortDirection === "asc" ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />
                                ) : (
                                  <ArrowUpDown className="w-3 h-3 text-neutral-300 opacity-20 group-hover:opacity-100 transition-opacity" />
                                )}
                              </div>
                            </th>
                            <th 
                              onClick={() => handleSort("collegeName")}
                              className="px-6 py-4 text-[10px] font-black uppercase text-neutral-400 tracking-widest cursor-pointer hover:bg-neutral-100 hover:text-neutral-700 select-none transition-colors group"
                            >
                              <div className="flex items-center gap-1">
                                <span>College</span>
                                {adminSortColumn === "collegeName" ? (
                                  adminSortDirection === "asc" ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />
                                ) : (
                                  <ArrowUpDown className="w-3 h-3 text-neutral-300 opacity-20 group-hover:opacity-100 transition-opacity" />
                                )}
                              </div>
                            </th>
                            <th 
                              onClick={() => handleSort("department")}
                              className="px-6 py-4 text-[10px] font-black uppercase text-neutral-400 tracking-widest cursor-pointer hover:bg-neutral-100 hover:text-neutral-700 select-none transition-colors group"
                            >
                              <div className="flex items-center gap-1">
                                <span>Department</span>
                                {adminSortColumn === "department" ? (
                                  adminSortDirection === "asc" ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />
                                ) : (
                                  <ArrowUpDown className="w-3 h-3 text-neutral-300 opacity-20 group-hover:opacity-100 transition-opacity" />
                                )}
                              </div>
                            </th>
                            <th 
                              onClick={() => handleSort("event")}
                              className="px-6 py-4 text-[10px] font-black uppercase text-neutral-400 tracking-widest cursor-pointer hover:bg-neutral-100 hover:text-neutral-700 select-none transition-colors group"
                            >
                              <div className="flex items-center gap-1">
                                <span>Event</span>
                                {adminSortColumn === "event" ? (
                                  adminSortDirection === "asc" ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />
                                ) : (
                                  <ArrowUpDown className="w-3 h-3 text-neutral-300 opacity-20 group-hover:opacity-100 transition-opacity" />
                                )}
                              </div>
                            </th>
                            <th 
                              onClick={() => handleSort("numTickets")}
                              className="px-6 py-4 text-[10px] font-black uppercase text-neutral-400 tracking-widest cursor-pointer hover:bg-neutral-100 hover:text-neutral-700 select-none transition-colors group"
                            >
                              <div className="flex items-center gap-1">
                                <span>Tickets</span>
                                {adminSortColumn === "numTickets" ? (
                                  adminSortDirection === "asc" ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />
                                ) : (
                                  <ArrowUpDown className="w-3 h-3 text-neutral-300 opacity-20 group-hover:opacity-100 transition-opacity" />
                                )}
                              </div>
                            </th>
                            <th 
                              onClick={() => handleSort("attendanceStatus")}
                              className="px-6 py-4 text-[10px] font-black uppercase text-neutral-400 tracking-widest cursor-pointer hover:bg-neutral-100 hover:text-neutral-700 select-none transition-colors group"
                            >
                              <div className="flex items-center gap-1">
                                <span>Attendance</span>
                                {adminSortColumn === "attendanceStatus" ? (
                                  adminSortDirection === "asc" ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />
                                ) : (
                                  <ArrowUpDown className="w-3 h-3 text-neutral-300 opacity-20 group-hover:opacity-100 transition-opacity" />
                                )}
                              </div>
                            </th>
                            <th 
                              onClick={() => handleSort("isCertificateEnabled")}
                              className="px-6 py-4 text-[10px] font-black uppercase text-neutral-400 tracking-widest cursor-pointer hover:bg-neutral-100 hover:text-neutral-700 select-none transition-colors group text-center"
                            >
                              <div className="flex items-center justify-center gap-1">
                                <span>Certificate</span>
                                {adminSortColumn === "isCertificateEnabled" ? (
                                  adminSortDirection === "asc" ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />
                                ) : (
                                  <ArrowUpDown className="w-3 h-3 text-neutral-300 opacity-20 group-hover:opacity-100 transition-opacity" />
                                )}
                              </div>
                            </th>
                            <th 
                              onClick={() => handleSort("isFoodCouponEnabled")}
                              className="px-6 py-4 text-[10px] font-black uppercase text-neutral-400 tracking-widest cursor-pointer hover:bg-neutral-100 hover:text-neutral-700 select-none transition-colors group text-center"
                            >
                              <div className="flex items-center justify-center gap-1">
                                <span>Food Coupon</span>
                                {adminSortColumn === "isFoodCouponEnabled" ? (
                                  adminSortDirection === "asc" ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />
                                ) : (
                                  <ArrowUpDown className="w-3 h-3 text-neutral-300 opacity-20 group-hover:opacity-100 transition-opacity" />
                                )}
                              </div>
                            </th>
                            <th 
                              onClick={() => handleSort("totalAmount")}
                              className="px-6 py-4 text-[10px] font-black uppercase text-neutral-400 tracking-widest cursor-pointer hover:bg-neutral-100 hover:text-neutral-700 select-none transition-colors group text-right"
                            >
                              <div className="flex items-center justify-end gap-1">
                                <span>Amount</span>
                                {adminSortColumn === "totalAmount" ? (
                                  adminSortDirection === "asc" ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />
                                ) : (
                                  <ArrowUpDown className="w-3 h-3 text-neutral-300 opacity-20 group-hover:opacity-100 transition-opacity" />
                                )}
                              </div>
                            </th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase text-neutral-400 tracking-widest text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50">
                          {filteredAdminBookings.length > 0 ? (
                            filteredAdminBookings.map((booking, idx) => (
                              <tr key={idx} className="hover:bg-neutral-50/50 transition-colors">
                                <td className="px-6 py-4">
                                  <p className="font-bold text-neutral-900">{booking.userName}</p>
                                  <p className="text-xs text-neutral-500">{booking.email}</p>
                                </td>
                                <td className="px-6 py-4">
                                  <p className="text-sm font-medium text-neutral-700 flex items-center gap-1.5">
                                    <Phone className="w-3.5 h-3.5 text-neutral-400" />
                                    {booking.phone}
                                  </p>
                                </td>
                                <td className="px-6 py-4">
                                  <p className="text-xs font-semibold text-neutral-600">{booking.collegeName}</p>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-xs font-semibold text-neutral-600 bg-neutral-100 px-2 py-1 rounded-md">
                                    {booking.department}
                                  </span>
                                </td>
                                <td className="px-6 py-4 font-medium text-neutral-700">{booking.event.name}</td>
                                <td className="px-6 py-4 font-bold text-neutral-900">{booking.numTickets}</td>
                                <td className="px-6 py-4">
                                  <button 
                                    onClick={() => booking.id && handleToggleAttendance(booking.id)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase transition-all shadow-sm ${
                                      booking.attendanceStatus === "present" 
                                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                                        : booking.attendanceStatus === "absent"
                                        ? "bg-red-50 text-red-600 border border-red-100"
                                        : "bg-neutral-50 text-neutral-400 border border-neutral-100"
                                    }`}
                                  >
                                    {booking.attendanceStatus === "present" ? (
                                      <><UserCheck className="w-3 h-3" /> Present</>
                                    ) : booking.attendanceStatus === "absent" ? (
                                      <><UserX className="w-3 h-3" /> Absent</>
                                    ) : (
                                      <><Clock className="w-3 h-3" /> Pending</>
                                    )}
                                  </button>
                                </td>
                                <td className="px-6 py-4">
                                  {booking.attendanceStatus === "present" ? (
                                    <button 
                                      onClick={() => booking.id && handleToggleCertificate(booking.id)}
                                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase transition-all shadow-sm ${
                                        booking.isCertificateEnabled 
                                          ? "bg-blue-50 text-blue-600 border border-blue-100" 
                                          : "bg-neutral-50 text-neutral-400 border border-neutral-100"
                                      }`}
                                    >
                                      {booking.isCertificateEnabled ? (
                                        <><CheckCircle2 className="w-3 h-3" /> Enabled</>
                                      ) : (
                                        <><FileText className="w-3 h-3" /> Enable Cert</>
                                      )}
                                    </button>
                                  ) : (
                                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest italic">Requires Present</span>
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  {booking.attendanceStatus === "present" ? (
                                    <button 
                                      onClick={() => booking.id && handleToggleFoodCoupon(booking.id)}
                                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase transition-all shadow-sm ${
                                        booking.isFoodCouponEnabled 
                                          ? "bg-orange-50 text-orange-600 border border-orange-100" 
                                          : "bg-neutral-50 text-neutral-400 border border-neutral-100"
                                      }`}
                                    >
                                      {booking.isFoodCouponEnabled ? (
                                        <><CheckCircle2 className="w-3 h-3" /> Enabled</>
                                      ) : (
                                        <><Utensils className="w-3 h-3" /> Enable Food</>
                                      )}
                                    </button>
                                  ) : (
                                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest italic">Requires Present</span>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-right font-black text-blue-600">₹{booking.totalAmount}</td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center justify-center gap-2">
                                    <button 
                                      onClick={() => setEditingBooking(booking)}
                                      className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                      title="Edit Student Info"
                                    >
                                      <Pencil className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteBooking(booking.id)}
                                      className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                      title="Delete Record"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={8} className="px-6 py-20 text-center text-neutral-400 font-medium italic">
                                No student bookings have been recorded yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  )}

                  {adminSubTab === "feedback" && (
                    <div className="bg-white rounded-3xl border border-neutral-100 shadow-xl overflow-hidden">
                    <div className="p-6 border-b border-neutral-100 bg-neutral-50/50">
                      <h3 className="font-bold text-neutral-900">Student Feedback</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                      {filteredFeedbacks.length > 0 ? (
                        filteredFeedbacks.map((fb, idx) => (
                          <div key={fb.id} className="bg-neutral-50 p-6 rounded-2xl space-y-4 border border-neutral-100">
                            <div className="flex items-center justify-between">
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(s => (
                                  <Star key={s} className={`w-3 h-3 ${s <= fb.rating ? "fill-amber-400 text-amber-400" : "text-neutral-200"}`} />
                                ))}
                              </div>
                              <span className="text-[10px] font-black text-neutral-400 uppercase">{new Date(fb.timestamp).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm font-medium text-neutral-600 italic">"{fb.comment || "No comment provided."}"</p>
                            <div className="pt-4 border-t border-neutral-200 flex items-center justify-between">
                              <div>
                                <p className="text-xs font-black text-neutral-900">{fb.userName}</p>
                                <p className="text-[10px] text-neutral-400 font-bold uppercase truncate max-w-[150px]">{fb.userEmail}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-tighter line-clamp-1">{events.find(e => e.id === fb.eventId)?.name}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full py-20 text-center space-y-4">
                          <div className="w-16 h-16 bg-neutral-100 text-neutral-300 rounded-full flex items-center justify-center mx-auto">
                            <MessageSquare className="w-8 h-8" />
                          </div>
                          <p className="text-neutral-400 font-medium tracking-tight">No feedback has been submitted yet.</p>
                        </div>
                      )}
                    </div>
                  </div>
                  )}

                  {adminSubTab === "waitlist" && (
                    <div className="bg-white rounded-3xl border border-neutral-100 shadow-xl overflow-hidden">
                      <div className="p-6 border-b border-neutral-100 bg-neutral-50/50 flex justify-between items-center">
                        <h3 className="font-bold text-neutral-900">Waitlist Management</h3>
                        <span className="text-xs bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-full">{waitlist.length} Waiting</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-neutral-50 border-b border-neutral-100">
                              <th className="px-6 py-4 text-[10px] font-black uppercase text-neutral-400 tracking-widest">Student Details</th>
                              <th className="px-6 py-4 text-[10px] font-black uppercase text-neutral-400 tracking-widest">Phone</th>
                              <th className="px-6 py-4 text-[10px] font-black uppercase text-neutral-400 tracking-widest">College / Dept</th>
                              <th className="px-6 py-4 text-[10px] font-black uppercase text-neutral-400 tracking-widest">Event</th>
                              <th className="px-6 py-4 text-[10px] font-black uppercase text-neutral-400 tracking-widest text-center">Tickets</th>
                              <th className="px-6 py-4 text-[10px] font-black uppercase text-neutral-400 tracking-widest text-center">Joined At</th>
                              <th className="px-6 py-4 text-[10px] font-black uppercase text-neutral-400 tracking-widest text-center">Status</th>
                              <th className="px-6 py-4 text-[10px] font-black uppercase text-neutral-400 tracking-widest text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-50">
                            {waitlist.length > 0 ? (
                              waitlist.map((entry, idx) => (
                                <tr key={entry.id || idx} className="hover:bg-neutral-50/50 transition-colors">
                                  <td className="px-6 py-4 animate-none">
                                    <p className="font-bold text-neutral-900">{entry.userName}</p>
                                    <p className="text-xs text-neutral-500">{entry.email}</p>
                                  </td>
                                  <td className="px-6 py-4 animate-none">
                                    <p className="text-sm font-medium text-neutral-700 flex items-center gap-1.5">
                                      <Phone className="w-3.5 h-3.5 text-neutral-400" />
                                      {entry.phone}
                                    </p>
                                  </td>
                                  <td className="px-6 py-4 animate-none">
                                    <p className="text-xs font-semibold text-neutral-600 mb-1">{entry.collegeName}</p>
                                    <span className="text-[10px] font-bold text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
                                      {entry.department}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 font-medium text-neutral-700 animate-none">
                                    {events.find(e => e.id === entry.eventId)?.name || "Unknown Event"}
                                  </td>
                                  <td className="px-6 py-4 text-center font-bold text-neutral-900 animate-none">
                                    {entry.numTickets}
                                  </td>
                                  <td className="px-6 py-4 text-center text-xs text-neutral-500 animate-none">
                                    {new Date(entry.timestamp).toLocaleDateString()} {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </td>
                                  <td className="px-6 py-4 text-center animate-none">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                      entry.status === "booked" 
                                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                                        : entry.status === "notified"
                                        ? "bg-blue-50 text-blue-600 border border-blue-100"
                                        : "bg-amber-50 text-amber-600 border border-amber-100 animate-pulse"
                                    }`}>
                                      {entry.status}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-center whitespace-nowrap animate-none">
                                    <div className="flex items-center justify-center gap-2">
                                      <button 
                                        onClick={() => {
                                          if (window.confirm("Are you sure you want to remove this student from the waitlist?")) {
                                            setWaitlist(prev => prev.filter(w => w.id !== entry.id));
                                          }
                                        }}
                                        className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 border border-red-100 transition-colors animate-none"
                                        title="Remove from Waitlist"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                      {entry.status === "waiting" && (
                                        <button 
                                          onClick={() => {
                                            setWaitlist(prev => prev.map(w => w.id === entry.id ? { ...w, status: "notified" as const } : w));
                                            const notification: UserMessage = {
                                              id: Math.random().toString(36).substr(2, 9),
                                              recipientEmail: entry.email,
                                              content: `Manual Notification: Tickets for "${events.find(e => e.id === entry.eventId)?.name || 'the event'}" has slot availability now! Since you are on our waitlist, please register immediately.`,
                                              timestamp: new Date().toISOString(),
                                              read: false,
                                              type: "success"
                                            };
                                            setUserMessages(m => [notification, ...m]);
                                            alert(`Notification dispatched manually to ${entry.email}!`);
                                          }}
                                          className="p-1.5 bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-100 border border-blue-100 transition-colors animate-none"
                                          title="Dispatch Notification Alert"
                                        >
                                          <Mail className="w-4 h-4" />
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={8} className="px-6 py-20 text-center text-neutral-400 font-medium italic">
                                  No waitlisted students recorded yet.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          ) : activeTab === "certificates" ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-6xl mx-auto px-4 py-12"
            >
              <div className="text-center space-y-4 max-w-2xl mx-auto mb-12">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8" />
                </div>
                <h2 className="text-4xl font-black font-display text-neutral-900 leading-[1.1]">
                  Certificate Portal
                </h2>
                <p className="text-lg text-neutral-500 font-medium leading-relaxed">
                  Download your official participation certificates for successfully attended events at VS Tech.
                </p>
              </div>

              {!user ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-neutral-100 shadow-sm max-w-md mx-auto space-y-6">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                    <Lock className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-neutral-900">Sign In Required</h3>
                    <p className="text-sm text-neutral-500 font-medium">Please sign in to view your rewards and certificates.</p>
                  </div>
                  <button 
                    onClick={() => { setSignInModalMode("signin"); setIsSignInModalOpen(true); }}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                  >
                    Sign In to Continue
                  </button>
                </div>
              ) : allBookings.filter(b => b.email === user.email && (b.isCertificateEnabled || b.isFoodCouponEnabled || b.isEntryTicketEnabled)).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {allBookings.filter(b => b.email === user.email && (b.isCertificateEnabled || b.isFoodCouponEnabled || b.isEntryTicketEnabled)).map((booking, idx) => (
                    <React.Fragment key={idx}>
                      {booking.isCertificateEnabled && (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          whileHover={{ y: -8 }}
                          className="group relative bg-white rounded-[2rem] border border-neutral-100 shadow-xl overflow-hidden"
                        >
                          {/* Certificate Preview Card */}
                          <div className="aspect-[4/3] bg-neutral-900 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                            {/* Elegant Border Decoration */}
                            <div className="absolute inset-4 border-2 border-blue-500/30 rounded-2xl pointer-events-none" />
                            <div className="absolute inset-6 border border-blue-500/10 rounded-xl pointer-events-none" />
                            
                            <Award className="w-10 h-10 text-blue-500 mb-2 opacity-50" />
                            <div className="space-y-1.5 relative z-10 w-full px-4">
                              <p className="text-blue-400 text-[8px] font-black tracking-[0.2em] uppercase">Certificate of Achievement</p>
                              <div className="w-8 h-0.5 bg-blue-500 mx-auto my-2" />
                              <p className="text-neutral-500 text-[8px] uppercase tracking-widest">Presented to</p>
                              <p className="text-white font-black text-sm tracking-tight">{booking.userName}</p>
                              <p className="text-neutral-500 text-[8px] uppercase tracking-widest mt-1">From the Department of</p>
                              <p className="text-neutral-300 font-bold text-[9px] line-clamp-1">{booking.department}</p>
                              <div className="pt-2">
                                <p className="text-neutral-500 text-[8px] uppercase tracking-widest">For successful completion of</p>
                                <h4 className="text-white font-black text-[11px] line-clamp-2 uppercase tracking-tight mt-0.5">{booking.event.name}</h4>
                              </div>
                              <div className="flex items-center justify-between mt-4 px-2">
                                <div className="text-left">
                                  <p className="text-neutral-500 text-[7px] uppercase tracking-widest">Date</p>
                                  <p className="text-blue-400 font-bold text-[8px]">{booking.event.dateTime}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-neutral-500 text-[10px] font-black tracking-widest uppercase">VS TECH</p>
                                  <p className="text-blue-500 font-bold text-[8px]">CAMPUS EVENTS</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between text-xs text-neutral-400 font-bold uppercase tracking-widest">
                              <span>Ref: VS-{booking.id?.slice(-4).toUpperCase()}</span>
                              <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Verified Attended</span>
                            </div>
                            
                            <button 
                              onClick={() => {
                                alert(`CERTIFICATE GENERATED\n\nName: ${booking.userName}\nEvent: ${booking.event.name}\nDepartment: ${booking.department}\nDate: ${booking.event.dateTime}\n\nDownloading document...`);
                              }}
                              className="w-full py-4 bg-neutral-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02]"
                            >
                              <Download className="w-4 h-4" />
                              Download PDF
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {booking.isFoodCouponEnabled && (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 + 0.1 }}
                          whileHover={{ y: -8 }}
                          className="group relative bg-white rounded-[2rem] border border-neutral-100 shadow-xl overflow-hidden"
                        >
                          <div className="aspect-[4/3] bg-orange-600/10 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                             {/* Decorative background */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
                            
                            <div className="z-10 space-y-3">
                              <div className="w-12 h-12 bg-orange-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg shadow-orange-100">
                                <Utensils className="w-6 h-6" />
                              </div>
                              <h3 className="text-2xl font-black text-neutral-900 italic tracking-tighter uppercase leading-none">Food Coupon</h3>
                              <p className="text-orange-600 font-black text-[10px] uppercase tracking-widest">Complimentary Meal</p>
                              
                              <div className="w-full max-w-[140px] mx-auto h-[1px] bg-orange-200 my-2" />
                              
                              <div className="space-y-1">
                                <p className="text-neutral-400 text-[8px] uppercase tracking-[0.2em] font-bold">Attendee</p>
                                <p className="text-neutral-900 font-black text-sm tracking-tight truncate px-4">{booking.userName}</p>
                              </div>
                              
                              <p className="text-[10px] font-bold text-orange-600 mt-2 bg-orange-100/50 px-3 py-1 rounded-full inline-block">
                                Valid at Campus Cafeteria
                              </p>
                            </div>
                          </div>

                          <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between text-xs text-neutral-400 font-bold uppercase tracking-widest">
                              <span>Ref: FOOD-{booking.id?.slice(-4).toUpperCase()}</span>
                              <span className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">Ready to Redeem</span>
                            </div>
                            
                            <button 
                              onClick={() => {
                                alert(`FOOD COUPON ACTIVE\n\nName: ${booking.userName}\nRef: FOOD-${booking.id?.slice(-4).toUpperCase()}\n\nPresent this screen at the cafeteria counter to redeem your free meal.`);
                              }}
                              className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-orange-600 transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02]"
                            >
                              <QrCode className="w-4 h-4" />
                              View Coupon
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {booking.isEntryTicketEnabled && (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 + 0.2 }}
                          whileHover={{ y: -8 }}
                          className="group relative bg-white rounded-[2rem] border border-neutral-100 shadow-xl overflow-hidden"
                        >
                          <div className="aspect-[4/3] bg-blue-600 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                             {/* Digital Pattern */}
                            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }} />
                            
                            <div className="z-10 space-y-3">
                              <div className="w-12 h-12 bg-white text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg">
                                <Ticket className="w-6 h-6" />
                              </div>
                              <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">Entry Ticket</h3>
                              <p className="text-blue-100 font-black text-[10px] uppercase tracking-widest">Official Campus Pass</p>
                              
                              <div className="w-full max-w-[140px] mx-auto h-[1px] bg-blue-400 my-2" />
                              
                              <div className="space-y-1">
                                <p className="text-blue-200 text-[8px] uppercase tracking-[0.2em] font-bold">Event</p>
                                <p className="text-white font-black text-sm tracking-tight truncate px-4 uppercase">{booking.event.name}</p>
                              </div>
                              
                              <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl inline-flex items-center gap-2 mt-2">
                                <QrCode className="w-3 h-3 text-white" />
                                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Scan to Enter</span>
                              </div>
                            </div>
                          </div>

                          <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between text-xs text-neutral-400 font-bold uppercase tracking-widest">
                              <span>ID: VS-{booking.id?.slice(-4).toUpperCase()}</span>
                              <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Confirmed</span>
                            </div>
                            
                            <button 
                              onClick={() => setBookingSummary(booking)}
                              className="w-full py-4 border-2 border-neutral-900 text-neutral-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-neutral-900 hover:text-white transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02]"
                            >
                              <QrCode className="w-4 h-4" />
                              Show QR Code
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-neutral-200">
                  <div className="w-20 h-20 bg-neutral-50 text-neutral-300 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Award className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-neutral-900 mb-2">No Rewards Available</h3>
                  <p className="text-neutral-500 font-medium max-w-sm mx-auto mb-8">
                    Registered for an event? Your entry ticket will appear here automatically. Certificates and food coupons are issued after attendance.
                  </p>
                  <button 
                    onClick={() => setActiveTab("events")}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
                  >
                    Explore Events
                  </button>
                </div>
              )}
            </motion.div>
          ) : activeTab === "profile" && user ? (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4 max-w-2xl mx-auto mb-10">
                <h2 className="text-4xl md:text-5xl font-black font-display text-neutral-900 leading-[1.1]">
                  Your Profile.
                </h2>
                <p className="text-lg text-neutral-500 font-medium leading-relaxed">
                  Personal details and event participation summary.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Profile Card */}
                <div className="md:col-span-4">
                  <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-xl space-y-6 sticky top-24">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="w-24 h-24 bg-blue-600 text-white rounded-3xl flex items-center justify-center shadow-lg shadow-blue-100 mb-2">
                        <User className="w-12 h-12" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-neutral-900">{user.name}</h3>
                        <p className="text-neutral-500 font-medium">{user.email}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={handleSignOut}
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-neutral-50 space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-500 font-medium font-sans">Total Bookings</span>
                        <span className="font-black text-neutral-900 bg-neutral-100 px-3 py-1 rounded-full">
                          {allBookings.filter(b => b.email === user.email).length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-500 font-medium font-sans">Reminders Set</span>
                        <span className="font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                          {reminders.length}
                        </span>
                      </div>
                    </div>
                  </div>

                {/* Bookings Summary */}
                <div className="md:col-span-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-neutral-900">Upcoming Events</h3>
                    <button 
                      onClick={() => setActiveTab("my-bookings")}
                      className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      View All Bookings <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {allBookings.filter(b => b.email === user.email).length > 0 ? (
                    <div className="space-y-4">
                      {allBookings
                        .filter(b => b.email === user.email)
                        .slice(0, 3)
                        .map((booking, idx) => (
                          <motion.div 
                            key={idx}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white/60 backdrop-blur-sm p-5 rounded-2xl border border-neutral-100 flex items-center gap-4 hover:shadow-md transition-all group"
                          >
                            <img 
                              src={booking.event.image || EVENT_PLACEHOLDER_IMAGE}
                              alt={booking.event.name}
                              className="w-16 h-16 rounded-xl object-cover shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-neutral-900 truncate group-hover:text-blue-600 transition-colors">
                                {booking.event.name}
                              </h4>
                              <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-neutral-400">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" /> {booking.event.dateTime}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" /> {booking.event.venue}
                                </span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-xs font-black text-blue-600">₹{booking.totalAmount}</p>
                              <p className="text-[10px] font-bold text-neutral-400">{booking.numTickets} Ticket(s)</p>
                            </div>
                          </motion.div>
                        ))}
                      
                      {allBookings.filter(b => b.email === user.email).length > 3 && (
                        <p className="text-center text-sm text-neutral-400 font-medium">
                          +{allBookings.filter(b => b.email === user.email).length - 3} more bookings
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white/40 backdrop-blur-sm rounded-3xl border-2 border-dashed border-neutral-200 p-12 text-center">
                      <p className="text-neutral-500 font-medium">No bookings found for your account.</p>
                      <button 
                        onClick={() => setActiveTab("events")}
                        className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
                      >
                        Explore Events
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : activeTab === "organizers" ? (
            <motion.div
              key="organizers-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {!selectedOrganizer ? (
                <>
                  <div className="text-center space-y-4 max-w-2xl mx-auto mb-10">
                    <h2 className="text-4xl md:text-5xl font-black font-display text-neutral-900 leading-[1.1]">
                      Event Organizers.
                    </h2>
                    <p className="text-lg text-neutral-500 font-medium leading-relaxed">
                      Meet the visionary minds behind VelTech's most exciting events.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {allOrganizers.map((org) => (
                      <motion.div
                        key={org.id}
                        layoutId={`org-card-${org.id}`}
                        onClick={() => setSelectedOrganizer(org)}
                        className="group bg-white rounded-[2.5rem] border border-neutral-100 shadow-xl overflow-hidden cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                      >
                        <div className="aspect-[4/3] relative overflow-hidden">
                          <img 
                            src={org.photo} 
                            alt={org.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                            <span className="text-white text-xs font-black uppercase tracking-widest flex items-center gap-2">
                              View Profile <ChevronRight className="w-4 h-4" />
                            </span>
                          </div>
                        </div>
                        <div className="p-8 text-center bg-white relative">
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 rounded-[1.5rem] bg-white border-4 border-white shadow-lg overflow-hidden hidden group-hover:block transition-all">
                             <img src={org.photo} className="w-full h-full object-cover" alt="" />
                          </div>
                          <h3 className="text-xl font-black text-neutral-900 mb-1 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{org.name}</h3>
                          <p className="text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] mb-4">{org.department}</p>
                          <p className="text-sm text-neutral-500 font-medium line-clamp-2 mb-6">
                            {org.bio}
                          </p>
                          <div className="flex items-center justify-center gap-4 pt-4 border-t border-neutral-50">
                            <div className="flex flex-col items-center">
                              <span className="text-lg font-black text-neutral-900">{events.filter(e => e.organizerId === org.id).length}</span>
                              <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest leading-none">Events</span>
                            </div>
                            <div className="w-px h-8 bg-neutral-100" />
                            <div className="flex flex-col items-center">
                              <span className="text-lg font-black text-neutral-900">4.9</span>
                              <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest leading-none">Rating</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {allOrganizers.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-[3rem] border border-neutral-100 shadow-xl max-w-xl mx-auto">
                      <User className="w-16 h-16 text-neutral-200 mx-auto mb-4" />
                      <h3 className="text-xl font-black text-neutral-900 mb-2">No Organizers Yet</h3>
                      <p className="text-neutral-500 font-medium">New organizers will appear here once they list events.</p>
                    </div>
                  )}
                </>
              ) : (
                <OrganizerProfile 
                  organizer={selectedOrganizer}
                  events={events}
                  onBack={() => setSelectedOrganizer(null)}
                />
              )}
            </motion.div>
          ) : activeTab === "my-bookings" ? (
            <motion.div
              key="my-bookings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4 max-w-2xl mx-auto mb-10">
                <h2 className="text-4xl md:text-5xl font-black font-display text-neutral-900 leading-[1.1]">
                  My Bookings.
                </h2>
                <p className="text-lg text-neutral-500 font-medium leading-relaxed">
                  Keeping track of your upcoming campus experiences.
                </p>
              </div>

              {user ? (
                <div className="max-w-4xl mx-auto space-y-6">
                  {/* Notifications Section */}
                  {userMessages.filter(m => m.recipientEmail === user.email).length > 0 && (
                    <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
                      <div className="px-6 py-4 border-b border-neutral-50 flex items-center justify-between bg-neutral-50/50">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-neutral-400" />
                          <h3 className="text-sm font-black uppercase text-neutral-500 tracking-widest">Recent Notifications</h3>
                        </div>
                        <button 
                          onClick={() => setUserMessages(prev => prev.map(m => m.recipientEmail === user.email ? {...m, read: true} : m))}
                          className="text-xs font-bold text-blue-600 hover:underline"
                        >
                          Mark all as read
                        </button>
                      </div>
                      <div className="divide-y divide-neutral-50 max-h-[300px] overflow-y-auto">
                        {userMessages.filter(m => m.recipientEmail === user.email).map((msg, idx) => (
                          <div 
                            key={msg.id} 
                            className={`p-4 flex gap-4 transition-colors ${!msg.read ? "bg-blue-50/30" : ""}`}
                            onMouseEnter={() => !msg.read && setUserMessages(prev => prev.map((m, i) => m.id === msg.id ? {...m, read: true} : m))}
                          >
                            <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                              msg.type === "success" ? "bg-emerald-500" : 
                              msg.type === "warning" ? "bg-amber-500" : "bg-blue-500"
                            } ${!msg.read ? "animate-pulse" : "opacity-30"}`} />
                            <div className="flex-1 space-y-1">
                              <p className={`text-sm ${!msg.read ? "font-bold text-neutral-900" : "text-neutral-600"}`}>
                                {msg.content}
                              </p>
                              <p className="text-[10px] text-neutral-400 font-medium">
                                {new Date(msg.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {allBookings.filter(b => b.email === user.email).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {allBookings.filter(b => b.email === user.email).map((booking, idx) => (
                        <motion.div 
                          key={idx}
                          whileHover={{ y: -4 }}
                          className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                              Confirmed
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-neutral-400">
                                {booking.event.dateTime}
                              </span>
                              <a 
                                href={generateGoogleCalendarUrl(booking.event)}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-600 transition-colors p-1"
                                title="Add to Calendar"
                              >
                                <CalendarPlus className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>
                          <h4 className="font-bold text-neutral-900 text-lg">{booking.event.name}</h4>
                          <div className="space-y-4 text-sm text-neutral-500">
                            <p className="flex justify-between font-medium">
                              <span>Tickets:</span>
                              <span className="text-neutral-900">{booking.numTickets}</span>
                            </p>
                            <p className="flex justify-between font-medium">
                              <span>Total Amount:</span>
                              <span className="text-neutral-900 font-bold">₹{booking.totalAmount}</span>
                            </p>
                            <p className="flex justify-between font-medium border-t border-neutral-50 pt-2">
                              <span>Booking ID:</span>
                              <span className="text-neutral-400 font-mono">VS-{booking.id?.slice(-4).toUpperCase()}</span>
                            </p>
                          </div>

                          <div className="pt-2 flex flex-col gap-2">
                            <button 
                              onClick={() => setSelectedQRBooking(selectedQRBooking === booking.id ? null : booking.id || null)}
                              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-50 text-blue-600 font-bold text-xs uppercase tracking-widest hover:bg-blue-100 transition-all border border-blue-100"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              {selectedQRBooking === booking.id ? "Hide QR Pass" : "View QR Pass"}
                            </button>

                            <a 
                              href={generateGoogleCalendarUrl(booking.event)}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800/50 dark:hover:bg-neutral-800/80 text-neutral-600 dark:text-neutral-300 font-bold text-xs uppercase tracking-widest transition-all border border-neutral-200/50 dark:border-neutral-700/60 select-none cursor-pointer"
                              title="Add to Google Calendar"
                            >
                              <CalendarPlus className="w-3.5 h-3.5 text-blue-500" />
                              Add to Google Calendar
                            </a>
                            
                            <AnimatePresence>
                              {selectedQRBooking === booking.id && (
                                <motion.div 
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 flex flex-col items-center gap-3">
                                    <div className="bg-white p-2 rounded-xl shadow-sm border border-neutral-100 mt-2">
                                      <QRCodeCanvas 
                                        id={`qr-${booking.id}`}
                                        value={`VERIFY-VS-TECH-VS-${booking.id?.slice(-4).toUpperCase()}-${booking.email}`}
                                        size={120}
                                        level="H"
                                      />
                                    </div>
                                    <button 
                                      onClick={() => {
                                        const canvas = document.getElementById(`qr-${booking.id}`) as HTMLCanvasElement;
                                        if (canvas) {
                                          const pngUrl = canvas.toDataURL("image/png");
                                          const downloadLink = document.createElement("a");
                                          downloadLink.href = pngUrl;
                                          downloadLink.download = `pass-${booking.id}.png`;
                                          document.body.appendChild(downloadLink);
                                          downloadLink.click();
                                          document.body.removeChild(downloadLink);
                                        }
                                      }}
                                      className="text-[9px] font-black uppercase text-neutral-400 hover:text-neutral-900 transition-colors flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-neutral-200 shadow-sm"
                                    >
                                      <Download className="w-2.5 h-2.5" /> Download Image
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                          <div className="flex gap-2 pt-2 border-t border-neutral-50 mb-2">
                            <button 
                              onClick={() => toggleReminder(booking.event.id, booking.event.name)}
                              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                reminders.includes(booking.event.id)
                                  ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                                  : "bg-white border-neutral-100 text-neutral-600 hover:bg-neutral-50"
                              }`}
                            >
                              {reminders.includes(booking.event.id) ? (
                                <><BellOff className="w-3.5 h-3.5" /> Set Off</>
                              ) : (
                                <><Bell className="w-3.5 h-3.5" /> Remind Me</>
                              )}
                            </button>
                            {booking.attendanceStatus === "present" ? (
                              <button 
                                onClick={() => { setFeedbackBooking(booking); setIsFeedbackModalOpen(true); }}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-blue-100"
                              >
                                <Star className="w-3.5 h-3.5 fill-white" /> Rate Experience
                              </button>
                            ) : (
                              <button 
                                onClick={() => setBookingToCancel(booking)}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 text-[10px] font-black uppercase tracking-widest transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Cancel Booking
                              </button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-neutral-200">
                      <p className="text-neutral-400 font-medium text-lg">You haven't made any bookings yet.</p>
                      <button 
                        onClick={() => setActiveTab("events")}
                        className="mt-4 text-blue-600 font-bold hover:underline"
                      >
                        Browse events
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-neutral-100 shadow-sm max-w-md mx-auto space-y-6">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                    <Lock className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-neutral-900">Sign In Required</h3>
                    <p className="text-sm text-neutral-500 font-medium">Please sign in to view your bookings and receive notifications.</p>
                  </div>
                  <button 
                    onClick={() => { setSignInModalMode("signin"); setIsSignInModalOpen(true); }}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                  >
                    Sign In to Continue
                  </button>
                </div>
              )}
            </motion.div>
          ) : activeTab === "favorites" ? (
            <motion.div
              key="favorites"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4 max-w-2xl mx-auto mb-10">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 fill-red-500" />
                </div>
                <h2 className="text-4xl md:text-5xl font-black font-display text-neutral-900 leading-[1.1]">
                  Your Favorites.
                </h2>
                <p className="text-lg text-neutral-500 font-medium leading-relaxed">
                  The events you don't want to miss. High priority experiences saved for later.
                </p>
              </div>

              {favoritedEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {favoritedEvents.map((e, idx) => (
                    <motion.div 
                      key={e.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="group relative bg-white rounded-[2.5rem] border border-neutral-100 shadow-xl overflow-hidden hover:shadow-2xl transition-all"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img 
                          src={e.image || EVENT_PLACEHOLDER_IMAGE} 
                          alt={e.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                        <button 
                          onClick={() => toggleFavorite(e.id)}
                          className="absolute top-4 right-4 p-2.5 bg-white/20 backdrop-blur-md rounded-2xl text-white hover:bg-white/40 transition-colors shadow-lg"
                        >
                          <Heart className={`w-5 h-5 ${favorites.includes(e.id) ? "fill-red-500 text-red-500" : "text-white"}`} />
                        </button>
                        <div className="absolute bottom-4 left-6">
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/80 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                            {e.department}
                          </span>
                        </div>
                      </div>
                      <div className="p-8 space-y-6">
                        <div className="space-y-4">
                          <h4 className="text-xl font-black text-neutral-900 leading-tight group-hover:text-blue-600 transition-colors">
                            {e.name}
                          </h4>
                          <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2 text-neutral-500">
                              <Calendar className="w-4 h-4" />
                              <span className="text-xs font-bold uppercase tracking-widest">{e.dateTime}</span>
                            </div>
                            <div className="flex items-center gap-2 text-neutral-500">
                              <MapPin className="w-4 h-4" />
                              <span className="text-xs font-bold uppercase tracking-widest">{e.venue}</span>
                            </div>
                            {getEventRating(e.id) && (
                              <div className="flex items-center gap-2 text-amber-500">
                                <Star className="w-4 h-4 fill-amber-400" />
                                <span className="text-xs font-black tracking-widest">{getEventRating(e.id)?.average} ({getEventRating(e.id)?.count})</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-6 border-t border-neutral-50">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Entry Fee</span>
                            <span className="text-xl font-black text-blue-600 tracking-tighter">₹{e.price}</span>
                          </div>
                          <button 
                            onClick={() => {
                              setSelectedEventId(e.id);
                              setActiveTab("events");
                            }}
                            className="px-6 py-3 bg-neutral-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg"
                          >
                            Book Now
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-neutral-200">
                  <div className="w-20 h-20 bg-neutral-50 text-neutral-300 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Heart className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-neutral-900 mb-2">No Favorites Yet</h3>
                  <p className="text-neutral-500 font-medium max-w-sm mx-auto mb-8">
                    Start exploring events and tap the heart icon to save the experiences you're interested in.
                  </p>
                  <button 
                    onClick={() => setActiveTab("events")}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
                  >
                    Browse Events
                  </button>
                </div>
              )}
            </motion.div>
          ) : !bookingSummary ? (
            <motion.div
              key="booking-flow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <>
                {/* Hero Section */}
                  <div className="text-center space-y-6 max-w-2xl mx-auto mb-10">
                    <h2 className="text-4xl md:text-5xl font-black font-display text-neutral-900 leading-[1.1]">
                      VS Tech Campus Events.
                    </h2>
                    <p className="text-lg text-neutral-500 font-medium leading-relaxed">
                      Reserve your spot at the most exclusive workshops, professional summits, and innovative expos across VS Tech.
                    </p>

                    {/* Real-time Presence Indicator */}
                    <div className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100 max-w-fit mx-auto mt-4">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                        {allBookings.length + 12} Students Are Online Now
                      </span>
                    </div>
                    
                    {/* Event Search Bar */}
                    <div className="max-w-xl mx-auto space-y-4 mb-10">
                      <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000 group-focus-within:duration-200"></div>
                        <div className="relative flex items-center">
                          <div className="absolute left-4 text-neutral-400">
                            <Search className="w-5 h-5" />
                          </div>
                          <input 
                            type="text"
                            placeholder="Search by event, department, or organizer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-neutral-100 shadow-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium text-neutral-900"
                          />
                          {searchTerm && (
                            <button 
                              onClick={() => setSearchTerm("")}
                              className="absolute right-4 p-1 hover:bg-neutral-100 rounded-lg text-neutral-400 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Featured Recommendations */}
                  <div className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                        <h3 className="text-xl font-black text-neutral-900 italic tracking-tighter">Recommended for You</h3>
                      </div>
                      <div className="hidden sm:flex gap-2">
                         <div className="w-8 h-8 rounded-full border border-neutral-100 flex items-center justify-center text-neutral-300">
                           <ChevronRight className="w-4 h-4 rotate-180" />
                         </div>
                         <div className="w-8 h-8 rounded-full border border-neutral-200 bg-white flex items-center justify-center text-blue-600 shadow-sm">
                           <ChevronRight className="w-4 h-4" />
                         </div>
                      </div>
                    </div>

                    <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                      {events.slice(0, 3).map((event, idx) => (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.1 }}
                          onClick={() => setSelectedEventId(event.id)}
                          className="min-w-[280px] sm:min-w-[340px] h-[200px] relative rounded-[2rem] overflow-hidden group cursor-pointer shadow-xl shadow-blue-900/5 ring-1 ring-white/20"
                        >
                          <img 
                            src={event.image || EVENT_PLACEHOLDER_IMAGE}
                            alt={event.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-2 py-0.5 bg-blue-600 text-[8px] font-black uppercase tracking-widest text-white rounded-md">
                                Featured
                              </span>
                              <span className="px-2 py-0.5 bg-white/20 backdrop-blur-md text-[8px] font-black uppercase tracking-widest text-white rounded-md">
                                {event.category}
                              </span>
                            </div>
                            <h3 className="text-xl font-black text-white italic leading-tight group-hover:text-blue-200 transition-colors">{event.name}</h3>
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-white/60 text-[10px] font-bold flex items-center gap-1">
                                <MapPin className="w-2.5 h-2.5" /> {event.venue}
                              </p>
                              <span className="text-white text-xs font-black">₹{event.price}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Main Content Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Event Selection List */}
                    <div className="lg:col-span-4 space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                      <h3 className="text-lg font-bold text-neutral-900 sticky top-0 bg-neutral-50 py-2 z-10 flex items-center justify-between">
                        <span>Events Found ({filteredEvents.length})</span>
                        {searchTerm && (
                          <button 
                            onClick={() => setSearchTerm("")}
                            className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded-lg"
                          >
                            Clear Search
                          </button>
                        )}
                      </h3>
                      {filteredEvents.length > 0 ? (
                        filteredEvents.map(e => (
                          <div
                            key={e.id}
                            className={`w-full p-4 rounded-2xl transition-all border group relative ${
                              selectedEventId === e.id 
                                ? "bg-white border-blue-600 shadow-xl shadow-blue-50/50 ring-2 ring-blue-100" 
                                : "bg-white border-neutral-100 hover:border-neutral-200 shadow-sm hover:shadow-md cursor-pointer"
                            }`}
                            onClick={() => setSelectedEventId(e.id)}
                          >
                            <div className="flex gap-4">
                              <div className="relative shrink-0">
                                <img 
                                  src={e.image || EVENT_PLACEHOLDER_IMAGE} 
                                  alt={e.name} 
                                  className="w-24 h-24 rounded-xl object-cover"
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = EVENT_PLACEHOLDER_IMAGE;
                                  }}
                                />
                                {e.availableTickets < 10 && (
                                  <div className="absolute -top-2 -left-2 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg">
                                    LOW AVAILABILITY
                                  </div>
                                )}
                                <button
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    toggleFavorite(e.id);
                                  }}
                                  className={`absolute -bottom-2 -right-2 p-1.5 rounded-lg shadow-md transition-all ${
                                    favorites.includes(e.id)
                                      ? "bg-red-500 text-white"
                                      : "bg-white text-neutral-300 hover:text-red-500"
                                  }`}
                                >
                                  <Heart className={`w-3.5 h-3.5 ${favorites.includes(e.id) ? "fill-current" : ""}`} />
                                </button>
                              </div>
                              <div className="flex-1 min-w-0 flex flex-col justify-between">
                                <div>
                                  <div className="flex items-start justify-between gap-2">
                                    <h4 className="text-sm font-bold text-neutral-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                      <Highlight text={e.name} highlight={searchTerm} />
                                    </h4>
                                    {getEventRating(e.id) && (
                                      <div className="flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded-lg border border-amber-100">
                                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                        <span className="text-[9px] font-black text-amber-700">{getEventRating(e.id)?.average}</span>
                                      </div>
                                    )}
                                    <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${selectedEventId === e.id ? "text-blue-600 rotate-90" : "text-neutral-300"}`} />
                                  </div>
                                  
                                  <div className="mt-2 space-y-1">
                                    <div className="flex items-center gap-1.5 text-neutral-500">
                                      <Building2 className="w-3 h-3" />
                                      <span className="text-[10px] font-medium truncate">
                                        <Highlight text={e.department} highlight={searchTerm} />
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-neutral-500">
                                      <User className="w-3 h-3" />
                                      <span className="text-[10px] font-medium truncate">
                                        <Highlight text={allOrganizers.find(o => o.id === e.organizerId)?.name || ""} highlight={searchTerm} />
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-neutral-500">
                                      <Calendar className="w-3 h-3" />
                                      <span className="text-[10px] font-medium">{e.dateTime}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-neutral-500">
                                      <MapPin className="w-3 h-3" />
                                      <span className="text-[10px] font-medium truncate">{e.venue}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between mt-3 pt-2 border-t border-neutral-50">
                                  <div className="flex items-center gap-1">
                                    <Ticket className="w-3 h-3 text-neutral-400" />
                                    <span className={`text-[10px] font-bold ${e.availableTickets < 10 ? "text-red-500" : "text-neutral-400"}`}>
                                      {e.availableTickets} Left
                                    </span>
                                  </div>
                                  <span className="text-xs font-black text-blue-600">₹{e.price}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-neutral-200">
                          <p className="text-neutral-400 font-medium">No events available at this time.</p>
                        </div>
                      )}
                    </div>

                    {/* Event Details & Booking */}
                    <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8 sticky top-32">
                      {selectedEvent ? (
                        <>
                          <EventDetails 
                            event={selectedEvent} 
                            organizer={allOrganizers.find(o => o.id === selectedEvent.organizerId) || allOrganizers[0]}
                            onImageUpdate={handleImageUpdate}
                            rating={getEventRating(selectedEvent.id)}
                            onOrganizerClick={(orgId) => {
                              const org = allOrganizers.find(o => o.id === orgId);
                              if (org) {
                                setSelectedOrganizer(org);
                                setActiveTab("organizers");
                                setSelectedEventId(null);
                              }
                            }}
                          />
                          <BookingForm 
                            event={selectedEvent} 
                            user={user}
                            onBookingComplete={handleBookingComplete} 
                            onJoinWaitlist={handleJoinWaitlist}
                          />
                        </>
                      ) : (
                        <div className="md:col-span-2 bg-white rounded-3xl p-12 border border-dashed border-neutral-200 text-center flex flex-col items-center justify-center">
                          <AlertCircle className="w-12 h-12 text-neutral-300 mb-4" />
                          <h4 className="text-xl font-bold text-neutral-900 mb-1">Select an Event</h4>
                          <p className="text-neutral-500">Pick an event from the list to view details and reserve your spot.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              </motion.div>
          ) : (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto pt-12"
            >
              <BookingSummary 
                booking={bookingSummary} 
                onBack={handleBack} 
                onViewBookings={() => { setActiveTab("my-bookings"); setBookingSummary(null); }}
                onFeedback={() => { setFeedbackBooking(bookingSummary); setIsFeedbackModalOpen(true); }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 mt-24 py-12 border-t border-neutral-200/50 flex flex-col md:flex-row items-center justify-between gap-6 text-sm font-medium text-neutral-500">
        <p>© 2026 VS Tech Event Book. Developed for Excellence.</p>
        <div className="flex items-center gap-8">
          <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Help Center</a>
        </div>
      </footer>

      {/* Cancellation Confirmation Modal */}
      <AnimatePresence>
        {bookingToCancel && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 min-h-screen">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBookingToCancel(null)}
              className="absolute inset-0 bg-neutral-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-2 border border-red-100">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-neutral-900 uppercase tracking-tighter">Cancel Booking?</h3>
                  <p className="text-neutral-500 font-medium leading-relaxed px-4">
                    Are you sure you want to cancel your booking for <span className="text-neutral-900 font-bold">"{bookingToCancel.event.name}"</span>?
                  </p>
                </div>
                
                <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 text-left space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-neutral-400 uppercase">Tickets</span>
                    <span className="text-neutral-900">{bookingToCancel.numTickets}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-neutral-400 uppercase">Refund Value</span>
                    <span className="text-blue-600">₹{bookingToCancel.totalAmount}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => handleCancelBooking(bookingToCancel.id!)}
                    className="w-full py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-700 transition-all shadow-lg shadow-red-200"
                  >
                    Confirm Cancellation
                  </button>
                  <button 
                    onClick={() => setBookingToCancel(null)}
                    className="w-full py-4 bg-white text-neutral-900 rounded-2xl font-black uppercase tracking-widest text-xs border border-neutral-200 hover:bg-neutral-50 transition-all"
                  >
                    Keep My Booking
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


