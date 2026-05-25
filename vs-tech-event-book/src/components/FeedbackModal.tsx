import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, X, MessageSquare } from "lucide-react";
import type { BookingData, FeedbackData } from "../types";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingData | null;
  onSubmit: (feedback: Omit<FeedbackData, "id" | "timestamp">) => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, booking, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  if (!booking) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      bookingId: booking.id || "",
      eventId: booking.event.id,
      userEmail: booking.email,
      userName: booking.userName,
      rating,
      comment
    });
    setComment("");
    setRating(5);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
            className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl"
          >
            <div className="p-8 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-neutral-900">Event Feedback</h3>
                  <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest">{booking.event.name}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-neutral-200 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              <div className="space-y-4 text-center">
                <label className="text-sm font-black text-neutral-900 uppercase tracking-widest">How was your experience?</label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-125 focus:outline-none"
                    >
                      <Star
                        className={`w-10 h-10 ${
                          star <= (hoverRating || rating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-neutral-200"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-xs font-bold text-neutral-400">
                  {rating === 1 ? "Poor" : rating === 2 ? "Fair" : rating === 3 ? "Good" : rating === 4 ? "Very Good" : "Excellent!"}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-neutral-400 uppercase tracking-widest">Tell us more (Optional)</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts about the event..."
                  className="w-full px-5 py-4 rounded-2xl border border-neutral-100 bg-neutral-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium min-h-[120px] resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 rounded-2xl border border-neutral-200 text-neutral-600 font-bold hover:bg-neutral-50 transition-all"
                >
                  Skip
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                >
                  Submit Feedback
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FeedbackModal;
