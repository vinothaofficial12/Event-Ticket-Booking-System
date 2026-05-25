import { CheckCircle2, Ticket, User, Mail, Building, ArrowLeft, Phone, MessageSquare, MessageCircle, Download, CalendarPlus, MapPin } from "lucide-react";
import { motion } from "motion/react";
import { QRCodeCanvas } from "qrcode.react";
import { generateGoogleCalendarUrl } from "../calendarUtils";
import type { BookingData } from "../types";

interface BookingSummaryProps {
  booking: BookingData;
  onBack: () => void;
  onViewBookings: () => void;
  onFeedback: () => void;
}

export default function BookingSummary({ booking, onBack, onViewBookings, onFeedback }: BookingSummaryProps) {
  const bookingId = `VS-${booking.id?.slice(-4).toUpperCase()}`;

  const downloadQRCode = () => {
    const canvas = document.getElementById("ticket-qr") as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
      let downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `ticket-${bookingId}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-3xl shadow-xl border border-blue-100 overflow-hidden"
    >
      <div className="bg-emerald-500 p-8 text-center text-white">
        <CheckCircle2 className="w-16 h-16 mx-auto mb-4" />
        <h2 className="text-3xl font-bold font-display">Booking Confirmed!</h2>
        <p className="text-emerald-50 mt-2 font-medium">Your tickets have been reserved successfully.</p>
        
        <div className="mt-8 grid md:grid-cols-2 gap-6 items-stretch">
          {/* Digital Ticket QR */}
          <div className="bg-white p-6 rounded-[2.5rem] shadow-xl flex flex-col items-center justify-center gap-4">
            <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-100">
              <QRCodeCanvas 
                id="ticket-qr"
                value={`VERIFY-VS-TECH-${bookingId}-${booking.email}`}
                size={140}
                level="H"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button 
                onClick={downloadQRCode}
                className="flex flex-1 items-center justify-center gap-2 text-neutral-900 font-black text-[10px] uppercase tracking-widest bg-neutral-100 px-4 py-2.5 rounded-full hover:bg-neutral-200 transition-colors"
              >
                <Download className="w-3 h-3 text-blue-600" /> Download Pass
              </button>
              <a 
                href={generateGoogleCalendarUrl(booking.event)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 text-blue-700 font-black text-[10px] uppercase tracking-widest bg-blue-50 px-4 py-2.5 rounded-full hover:bg-blue-100 transition-colors border border-blue-100"
              >
                <CalendarPlus className="w-3 h-3" /> Add to Calendar
              </a>
            </div>
          </div>

          {/* Dispatch Status */}
          <div className="flex flex-col justify-center space-y-4 bg-white/10 p-6 rounded-[2.5rem] border border-white/20 backdrop-blur-md shadow-inner text-left">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-400/30">
                <Mail className="w-5 h-5 text-blue-200" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[8px] font-black uppercase tracking-widest text-white/90">Email Sent</span>
                <span className="text-[10px] text-white/60 truncate block">{booking.email}</span>
              </div>
            </div>
            <div className="w-full h-px bg-white/10" />
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-400/30">
                <MessageCircle className="w-5 h-5 text-emerald-300" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[8px] font-black uppercase tracking-widest text-white/90">WhatsApp Sent</span>
                <span className="text-[10px] text-white/60 truncate block">{booking.phone}</span>
              </div>
            </div>
            <div className="pt-2">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <p className="text-[10px] text-emerald-100 font-bold uppercase tracking-wider">Cloud Dispatch Verified</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-2">Booking Summary</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">Name</p>
                  <p className="font-semibold text-neutral-800">{booking.userName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">Email</p>
                  <p className="font-semibold text-neutral-800">{booking.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">Phone</p>
                  <p className="font-semibold text-neutral-800">{booking.phone}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Building className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">Department</p>
                  <p className="font-semibold text-neutral-800">{booking.department}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Ticket className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">Event</p>
                  <p className="font-semibold text-neutral-800">{booking.event.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CalendarPlus className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">Date & Time</p>
                  <p className="font-semibold text-neutral-800">{booking.event.dateTime}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">Venue</p>
                  <p className="font-semibold text-neutral-800">{booking.event.venue}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-neutral-50 rounded-2xl p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-500">Tickets Booked</p>
            <p className="text-2xl font-bold text-neutral-900">{booking.numTickets}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-neutral-500">Total Amount Paid</p>
            <p className="text-3xl font-black text-blue-600 font-display">₹{booking.totalAmount}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onFeedback}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-lg shadow-blue-100"
          >
            <MessageSquare className="w-5 h-5" /> Write Feedback
          </button>
          
          <button
            onClick={onBack}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold transition-all"
          >
            <ArrowLeft className="w-5 h-5" /> Book Another Ticket
          </button>
          
          <button
            onClick={onViewBookings}
            className="w-full py-3 rounded-xl border border-neutral-200 text-neutral-600 font-bold hover:bg-neutral-50 transition-all flex items-center justify-center gap-2"
          >
            <Ticket className="w-4 h-4 text-blue-500" /> View All My Bookings
          </button>
        </div>
      </div>
    </motion.div>
  );
}
