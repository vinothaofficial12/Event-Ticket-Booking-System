import React, { useState, useRef } from "react";
import { Calendar, MapPin, Ticket, Building2, Share2, Twitter, Mail, Copy, Check, Camera, Loader2, Star, CalendarPlus, Linkedin, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { EVENT_PLACEHOLDER_IMAGE } from "../constants";
import { ORGANIZERS } from "../organizersData";
import { generateGoogleCalendarUrl } from "../calendarUtils";
import type { EventData, Organizer } from "../types";

interface EventDetailsProps {
  event: EventData;
  organizer: Organizer;
  onImageUpdate: (eventId: string, newImageUrl: string) => void;
  rating?: {
    average: string;
    count: number;
  } | null;
  onOrganizerClick?: (organizerId: string) => void;
}

export default function EventDetails({ event, organizer, onImageUpdate, rating, onOrganizerClick }: EventDetailsProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const eventUrl = window.location.href;
  const shareText = `Check out this event: ${event.name} at ${event.venue}!`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.name,
          text: shareText,
          url: eventUrl,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      setShowShareMenu(!showShareMenu);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(eventUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        onImageUpdate(event.id, result);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden relative">
      <div className="h-48 w-full overflow-hidden relative group">
        <img 
          src={event.image || EVENT_PLACEHOLDER_IMAGE} 
          alt={event.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = EVENT_PLACEHOLDER_IMAGE;
          }}
        />
        
        {/* Image Upload Overlay */}
        <div 
          onClick={handleImageClick}
          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white backdrop-blur-sm"
        >
          {isUploading ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : (
            <>
              <Camera className="w-8 h-8 mb-2" />
              <span className="text-xs font-bold uppercase tracking-wider">Change Cover Image</span>
            </>
          )}
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />
      </div>
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold font-display text-neutral-900">{event.name}</h2>
              {rating && (
                <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-100">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-black text-amber-700">{rating.average}</span>
                  <span className="text-[10px] text-amber-500 font-bold ml-0.5">({rating.count})</span>
                </div>
              )}
            </div>
            <p className="text-neutral-500">{event.description}</p>
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-dotted border-neutral-100">
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mr-1">Share Event</span>
              <a 
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(eventUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center text-neutral-400 hover:bg-blue-50 hover:text-blue-400 transition-all"
                title="Share on Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a 
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center text-neutral-400 hover:bg-blue-50 hover:text-blue-700 transition-all"
                title="Share on LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a 
                href={`mailto:?subject=${encodeURIComponent(event.name)}&body=${encodeURIComponent(shareText + "\n\n" + eventUrl)}`}
                className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center text-neutral-400 hover:bg-red-50 hover:text-red-400 transition-all"
                title="Share via Email"
              >
                <Mail className="w-4 h-4" />
              </a>
              <button 
                onClick={copyToClipboard}
                className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-all"
                title="Copy Link"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 relative">
            <a 
              href={generateGoogleCalendarUrl(event)}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all border border-blue-100 flex items-center justify-center"
              title="Add to Google Calendar"
            >
              <CalendarPlus className="w-5 h-5" />
            </a>
            <button 
              onClick={handleShare}
              className="p-2.5 rounded-full bg-neutral-50 text-neutral-600 hover:bg-neutral-100 transition-all border border-neutral-100"
              title="Share event"
            >
              <Share2 className="w-5 h-5" />
            </button>

            <AnimatePresence>
              {showShareMenu && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-neutral-100 py-2 z-20"
                >
                  <a 
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(eventUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50 hover:text-blue-500 transition-colors"
                  >
                    <Twitter className="w-4 h-4" /> Twitter
                  </a>
                  <a 
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50 hover:text-blue-700 transition-colors"
                  >
                    <Linkedin className="w-4 h-4" /> LinkedIn
                  </a>
                  <a 
                    href={`mailto:?subject=${encodeURIComponent(event.name)}&body=${encodeURIComponent(shareText + "\n\n" + eventUrl)}`}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50 hover:text-red-500 transition-colors"
                  >
                    <Mail className="w-4 h-4" /> Email
                  </a>
                  <button 
                    onClick={copyToClipboard}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50 transition-colors border-t border-neutral-50 mt-1 pt-2"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied!" : "Copy Link"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="flex items-center gap-3 text-neutral-700">
            <Building2 className="w-5 h-5 text-neutral-400" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Department</p>
              <p className="font-medium">{event.department}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-neutral-700">
            <Calendar className="w-5 h-5 text-neutral-400" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Date & Time</p>
              <p className="font-medium">{event.dateTime}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-neutral-700">
            <MapPin className="w-5 h-5 text-neutral-400" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Venue</p>
              <p className="font-medium">{event.venue}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-neutral-700">
            <Ticket className="w-5 h-5 text-neutral-400" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Availability</p>
              <p className="font-medium">
                <span className={event.availableTickets < 10 ? "text-red-600 font-bold" : "text-emerald-600"}>
                  {event.availableTickets}
                </span> / {event.totalTickets} Tickets left
              </p>
            </div>
          </div>
        </div>

        {/* Google Calendar Quick Add Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/10 dark:to-indigo-950/10 border border-blue-100/50 dark:border-blue-900/20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white dark:bg-neutral-900 rounded-xl flex items-center justify-center shadow-sm shrink-0">
              <CalendarPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100">Add to your schedule</p>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400">Save details directly to Google Calendar</p>
            </div>
          </div>
          <a 
            href={generateGoogleCalendarUrl(event)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-sm flex items-center gap-1.5 select-none cursor-pointer text-center whitespace-nowrap"
          >
            Add Event
          </a>
        </div>

        {/* Map View */}
        <div className="pt-2">
          <div className="w-full h-48 rounded-2xl overflow-hidden border border-neutral-100 bg-neutral-50 group relative">
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
              src={`https://maps.google.com/maps?q=${encodeURIComponent(event.venue)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
              title="Event Location"
              className="grayscale group-hover:grayscale-0 transition-all duration-700"
            />
            <div className="absolute inset-0 pointer-events-none border-2 border-transparent group-hover:border-blue-500/10 rounded-2xl transition-all" />
          </div>
        </div>

        {/* Organizer Section */}
        <div className="pt-4 border-t border-neutral-100">
          <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-3">Event Organizer</p>
          <div 
            onClick={() => onOrganizerClick?.(organizer.id)}
            className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-100 cursor-pointer hover:border-blue-200 transition-all group"
          >
            <img src={organizer.photo} alt={organizer.name} className="w-12 h-12 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
            <div className="flex-1">
              <h4 className="text-sm font-black text-neutral-900 leading-tight group-hover:text-blue-600 transition-colors uppercase tracking-tight">{organizer.name}</h4>
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide">{organizer.department}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-neutral-400 group-hover:text-blue-600 transition-colors shadow-sm">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
          <span className="text-sm text-neutral-500 font-medium">Ticket Price</span>
          <span className="text-3xl font-bold font-display text-neutral-900">
            ₹{event.price}
          </span>
        </div>
      </div>
    </div>
  );
}
