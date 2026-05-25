import React, { useState, useEffect } from "react";
import { User, Mail, Building, Ticket, AlertCircle, Phone, CheckCircle2, QrCode, ArrowLeft, Loader2, GraduationCap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { QRCodeCanvas } from "qrcode.react";
import { DEPARTMENTS } from "../constants";
import type { EventData, BookingData } from "../types";

interface BookingFormProps {
  event: EventData;
  user: { email: string; name: string } | null;
  onBookingComplete: (booking: BookingData) => void;
  onJoinWaitlist?: (waitlistEntry: {
    userName: string;
    email: string;
    phone: string;
    department: string;
    collegeName: string;
    numTickets: number;
    eventId: string;
  }) => void;
}

export default function BookingForm({ event, user, onBookingComplete, onJoinWaitlist }: BookingFormProps) {
  const [step, setStep] = useState<"form" | "payment">("form");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isJoinedWaitlist, setIsJoinedWaitlist] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    phone: "",
    department: "",
    collegeName: "",
    numTickets: 1,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user && !formData.userName && !formData.email) {
      setFormData(prev => ({
        ...prev,
        userName: user.name,
        email: user.email
      }));
    }
  }, [user]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.userName.trim()) newErrors.userName = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[0-9\s-]{10,15}$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone number format";
    }
    if (!formData.department) newErrors.department = "Department is required";
    if (!formData.collegeName.trim()) newErrors.collegeName = "College name is required";
    if (formData.numTickets < 1) {
      newErrors.numTickets = "At least 1 ticket required";
    } else if (event.availableTickets > 0 && formData.numTickets > event.availableTickets) {
      newErrors.numTickets = `Only ${event.availableTickets} tickets available`;
    } else if (event.availableTickets === 0 && formData.numTickets > 5) {
      newErrors.numTickets = "Maximum 5 tickets for waitlist request";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      if (event.availableTickets === 0) {
        setIsVerifying(true);
        setTimeout(() => {
          setIsVerifying(false);
          setIsJoinedWaitlist(true);
          onJoinWaitlist?.({
            ...formData,
            eventId: event.id
          });
        }, 1500);
      } else {
        setStep("payment");
      }
    }
  };

  const handleConfirmPayment = () => {
    setShowConfirmModal(true);
  };

  const handleFinalizeBooking = () => {
    setShowConfirmModal(false);
    setIsVerifying(true);
    // Simulate payment verification delay
    setTimeout(() => {
      onBookingComplete({
        ...formData,
        totalAmount: formData.numTickets * event.price,
        event,
      });
    }, 2000);
  };

  const handleReset = () => {
    setFormData({
      userName: "",
      email: "",
      phone: "",
      department: "",
      collegeName: "",
      numTickets: 1,
    });
    setErrors({});
    setStep("form");
  };

  // Generate UPI Payment URI
  const upiUri = `upi://pay?pa=vinotha2125@okicici&pn=VS%20TECH%20Events&am=${formData.numTickets * event.price}&cu=INR&tn=Booking%20for%20${encodeURIComponent(event.name)}`;

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl border border-neutral-100 overflow-hidden">
      <AnimatePresence mode="wait">
        {isJoinedWaitlist ? (
          <motion.div 
            key="waitlist-success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-8 text-center space-y-6"
          >
            <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-[2rem] flex items-center justify-center mx-auto ring-8 ring-amber-50/50">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-neutral-900 tracking-tight">Joined Waitlist!</h3>
              <p className="text-neutral-500 font-semibold leading-relaxed">
                You have requested <span className="font-bold text-neutral-800">{formData.numTickets} ticket(s)</span> for <span className="text-blue-600 font-bold">{event.name}</span>.
              </p>
              <p className="text-xs text-neutral-400">
                You are on the waitlist! If a booking is cancelled, we will automatically notify you.
              </p>
            </div>

            <button
              onClick={() => {
                setIsJoinedWaitlist(false);
                handleReset();
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl transition-all shadow-xl shadow-blue-100 uppercase tracking-widest text-sm animate-pulse"
            >
              Continue Browsing
            </button>
          </motion.div>
        ) : step === "form" ? (
          <motion.div 
            key="form-step"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="p-8"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black font-display text-neutral-900 tracking-tight">
                {event.availableTickets === 0 ? "Join Waitlist" : "Registration Details"}
              </h3>
              {event.availableTickets === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-wider border border-amber-200"
                >
                  <AlertCircle className="w-3 h-3" /> Waitlist Open
                </motion.div>
              ) : event.availableTickets < 10 && event.availableTickets > 0 && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-wider animate-pulse"
                >
                  <AlertCircle className="w-3 h-3" /> Urgent
                </motion.div>
              )}
            </div>

            {/* Availability Progress Bar */}
            <div className="mb-8 space-y-2.5">
              <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                <span>Tickets Status</span>
                <span className={event.availableTickets < 10 ? "text-red-500" : "text-blue-500"}>
                  {event.availableTickets === 0 ? "SOLD OUT (Waitlist Open)" : `${event.availableTickets} tickets left`}
                </span>
              </div>
              <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${event.availableTickets === 0 ? 100 : (event.availableTickets / event.totalTickets) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    event.availableTickets === 0 ? "bg-amber-500" : event.availableTickets < 10 ? "bg-red-500" : "bg-blue-500"
                  }`}
                />
              </div>
            </div>
            
            <form onSubmit={handleNextToPayment} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                  <User className="w-4 h-4 text-neutral-400" /> Full Name
                </label>
                <input
                  type="text"
                  className={`w-full px-5 py-3 rounded-2xl border transition-all outline-none font-medium ${
                    errors.userName ? "border-red-500 bg-red-50" : "border-neutral-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  }`}
                  placeholder="John Doe"
                  value={formData.userName}
                  onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                />
                {errors.userName && (
                  <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.userName}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-neutral-400" /> Email Address
                </label>
                <input
                  type="email"
                  className={`w-full px-5 py-3 rounded-2xl border transition-all outline-none font-medium ${
                    errors.email ? "border-red-500 bg-red-50" : "border-neutral-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  }`}
                  placeholder="john@university.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-neutral-400" /> Phone Number
                </label>
                <input
                  type="tel"
                  className={`w-full px-5 py-3 rounded-2xl border transition-all outline-none font-medium ${
                    errors.phone ? "border-red-500 bg-red-50" : "border-neutral-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  }`}
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                {errors.phone && (
                  <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.phone}
                  </p>
                )}
              </div>

              {/* Department */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                  <Building className="w-4 h-4 text-neutral-400" /> Department
                </label>
                <select
                  className={`w-full px-5 py-3 rounded-2xl border bg-white appearance-none transition-all outline-none font-medium ${
                    errors.department ? "border-red-500 bg-red-50" : "border-neutral-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  }`}
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                >
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                {errors.department && (
                  <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.department}
                  </p>
                )}
              </div>

              {/* College Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-neutral-400" /> College Name
                </label>
                <input
                  type="text"
                  className={`w-full px-5 py-3 rounded-2xl border transition-all outline-none font-medium ${
                    errors.collegeName ? "border-red-500 bg-red-50" : "border-neutral-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  }`}
                  placeholder="Vel Tech University"
                  value={formData.collegeName}
                  onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                />
                {errors.collegeName && (
                  <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.collegeName}
                  </p>
                )}
              </div>

              {/* Tickets */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-neutral-400" /> Number of Tickets
                </label>
                <div className="flex items-center gap-6 bg-neutral-50 p-4 rounded-3xl border border-neutral-100">
                  <input
                    type="number"
                    min="1"
                    max={event.availableTickets > 0 ? event.availableTickets : 5}
                    className={`w-32 px-5 py-3 rounded-2xl border transition-all outline-none font-bold text-center text-xl ${
                      errors.numTickets ? "border-red-500 bg-red-50" : "border-neutral-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    }`}
                    value={formData.numTickets}
                    onChange={(e) => setFormData({ ...formData, numTickets: parseInt(e.target.value) || 0 })}
                  />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">
                      {event.availableTickets > 0 ? "Total Payable" : "Estimated Amount"}
                    </p>
                    <p className="text-3xl font-black text-neutral-900">₹{(formData.numTickets || 0) * event.price}</p>
                  </div>
                </div>
                {errors.numTickets && (
                  <p className="text-xs text-red-500 font-medium flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" /> {errors.numTickets}
                  </p>
                )}
              </div>

              <div className="md:col-span-2 pt-4 flex gap-4">
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-300 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-blue-200 disabled:shadow-none uppercase tracking-widest text-sm"
                >
                  {isVerifying ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : event.availableTickets === 0 ? (
                    "Join Waitlist"
                  ) : (
                    "Proceed to Payment"
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-8 py-4 rounded-2xl border border-neutral-200 font-bold text-neutral-500 hover:bg-neutral-50 transition-all uppercase tracking-widest text-sm"
                >
                  Clear
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div 
            key="payment-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-8"
          >
            <button 
              onClick={() => setStep("form")}
              className="flex items-center gap-2 text-neutral-500 font-bold text-sm uppercase tracking-widest mb-8 hover:text-neutral-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Details
            </button>

            <div className="text-center space-y-6 max-w-sm mx-auto">
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-neutral-900 tracking-tight">Secure Payment</h3>
                <p className="text-neutral-500 font-medium leading-relaxed">
                  Scan the dynamic UPI QR code below using any payment app (PhonePe, GPay, Paytm) to complete your registration.
                </p>
              </div>

              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[3rem] opacity-5 blur-2xl group-hover:opacity-10 transition-opacity" />
                <div className="relative aspect-square bg-white p-8 rounded-[3rem] border-2 border-neutral-50 shadow-2xl flex flex-col items-center justify-center gap-4">
                  <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-100">
                    <QRCodeCanvas 
                      value={upiUri}
                      size={200}
                      level="H"
                      includeMargin={false}
                      imageSettings={{
                        src: "https://www.vectorlogo.zone/logos/upipay/upipay-icon.svg",
                        x: undefined,
                        y: undefined,
                        height: 40,
                        width: 40,
                        excavate: true,
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-neutral-50 rounded-full border border-neutral-100">
                    <QrCode className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-black text-neutral-900 uppercase tracking-widest">Dynamic UPI QR</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100/50 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-neutral-500 font-bold uppercase tracking-wider">Payee</span>
                  <span className="text-neutral-900 font-black">VS TECH EVENTS</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-neutral-500 font-bold uppercase tracking-wider">Amount Due</span>
                  <span className="text-neutral-900 font-black text-xl">₹{formData.numTickets * event.price}</span>
                </div>
              </div>

              <button
                onClick={handleConfirmPayment}
                disabled={isVerifying}
                className="w-full bg-neutral-900 hover:bg-black disabled:bg-neutral-300 text-white font-black py-5 rounded-[2rem] transition-all shadow-2xl shadow-neutral-200 flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-sm"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying Transaction...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    I Have Paid
                  </>
                )}
              </button>

              <div className="pt-4">
                <p className="text-[10px] text-neutral-400 font-black uppercase tracking-[0.1em] flex items-center justify-center gap-2">
                  <span className="w-8 h-px bg-neutral-200" /> Securing via University Node <span className="w-8 h-px bg-neutral-200" />
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl space-y-6 text-center"
            >
              <div className="w-20 h-20 bg-amber-50 rounded-[2rem] flex items-center justify-center mx-auto ring-8 ring-amber-50/50">
                <AlertCircle className="w-10 h-10 text-amber-500" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-neutral-900 tracking-tight">Final Confirmation</h3>
                <p className="text-neutral-500 font-medium leading-relaxed">
                  Are you sure you want to finalize your booking for <span className="text-blue-600 font-bold">{event.name}</span>? 
                  This action will register {formData.numTickets} ticket(s) under your name.
                </p>
              </div>

              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 flex items-center justify-between">
                <div className="text-left">
                  <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none mb-1">Total Payable</p>
                  <p className="text-xl font-black text-neutral-900 leading-none">₹{formData.numTickets * event.price}</p>
                </div>
                <div className="px-3 py-1 bg-white rounded-full border border-neutral-200 text-[10px] font-black text-neutral-500 uppercase tracking-widest">
                  {formData.numTickets} Ticket{formData.numTickets > 1 ? 's' : ''}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <button 
                  onClick={() => setShowConfirmModal(false)}
                  className="px-6 py-4 rounded-2xl bg-neutral-100 text-neutral-500 font-black text-xs uppercase tracking-[0.2em] hover:bg-neutral-200 transition-all"
                >
                  Go Back
                </button>
                <button 
                  onClick={handleFinalizeBooking}
                  className="px-6 py-4 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-[0.98]"
                >
                  Finalize
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
