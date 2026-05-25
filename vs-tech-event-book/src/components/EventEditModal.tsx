import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Pencil, Plus, Save, Image as ImageIcon, MapPin, Calendar, BookOpen, IndianRupee, Users, School, Upload, Camera, Trash2, Loader2 } from "lucide-react";
import { DEPARTMENTS, EVENT_PLACEHOLDER_IMAGE } from "../constants";
import type { EventData } from "../types";

interface EventEditModalProps {
  event: EventData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedEvent: EventData) => void;
}

const DEFAULT_EVENT: Omit<EventData, "id"> = {
  name: "",
  description: "",
  department: DEPARTMENTS[0],
  dateTime: new Date().toISOString().split("T")[0] + " 10:00 AM",
  venue: "Main Auditorium",
  price: 0,
  totalTickets: 100,
  availableTickets: 100,
  image: EVENT_PLACEHOLDER_IMAGE,
  organizerId: "org-1", // Default for demo
};

export default function EventEditModal({ event, isOpen, onClose, onSave }: EventEditModalProps) {
  const [formData, setFormData] = useState<EventData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (event) {
        setFormData({ ...event });
      } else {
        setFormData({
          id: `EVT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          ...DEFAULT_EVENT
        });
      }
    } else {
      setFormData(null);
    }
  }, [event, isOpen]);

  if (!formData) return null;

  const isCreating = !event;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      // Simulate real upload latency
      setTimeout(() => {
        setFormData(prev => prev ? { ...prev, image: reader.result as string } : null);
        setIsUploading(false);
      }, 800);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      onSave(formData);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-neutral-900/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-neutral-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${isCreating ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"}`}>
                  {isCreating ? <Plus className="w-5 h-5" /> : <Pencil className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-xl font-black text-neutral-900 font-display">
                    {isCreating ? "Create New Event" : "Edit Event Details"}
                  </h3>
                  <p className="text-xs text-neutral-500 font-medium tracking-wide">
                    {isCreating ? "Drafting standard event" : `ID: ${formData.id}`}
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-400 hover:text-neutral-900"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-bold text-neutral-700 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-500" /> Event Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium"
                    placeholder="Enter event name"
                  />
                </div>

                {/* Department Selection */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-bold text-neutral-700 flex items-center gap-2">
                    <School className="w-4 h-4 text-blue-500" /> Department
                  </label>
                  <select
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium appearance-none bg-white"
                  >
                    {DEPARTMENTS.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-bold text-neutral-700 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-500" /> Description
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium resize-none"
                    placeholder="Describe the event"
                  />
                </div>

                {/* Date/Time */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-neutral-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500" /> Date & Time
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.dateTime}
                    onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium"
                    placeholder="e.g. 2026-05-15 10:00 AM"
                  />
                </div>

                {/* Venue */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-neutral-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-500" /> Venue
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium"
                    placeholder="Venue location"
                  />
                </div>

                {/* Pricing & Tickets */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-neutral-700 flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-blue-500" /> Entry Price
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={0}
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-neutral-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-black"
                      placeholder="0"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">₹</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-neutral-700 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" /> Total Capacity
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.totalTickets}
                    onChange={(e) => {
                      const total = Number(e.target.value);
                      setFormData({ 
                        ...formData, 
                        totalTickets: total,
                        availableTickets: isCreating ? total : formData.availableTickets
                      });
                    }}
                    className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-black"
                    placeholder="100"
                  />
                </div>

                {/* Image Upload/Management */}
                <div className="space-y-4 md:col-span-2">
                  <label className="text-sm font-bold text-neutral-700 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-blue-500" /> Event Cover Image
                  </label>
                  
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    {/* Preview */}
                    <div className="relative group w-full md:w-48 h-32 rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0">
                      <img 
                        src={formData.image} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                      {isUploading && (
                        <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm flex items-center justify-center">
                          <Loader2 className="w-8 h-8 text-white animate-spin" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-neutral-900/0 group-hover:bg-neutral-900/20 transition-colors pointer-events-none" />
                    </div>

                    <div className="flex-1 space-y-4 w-full">
                      <div className="flex flex-wrap gap-2">
                        <input 
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                        >
                          <Upload className="w-4 h-4" /> Upload Image
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, image: EVENT_PLACEHOLDER_IMAGE })}
                          className="flex items-center gap-2 px-4 py-2.5 bg-white text-neutral-600 border border-neutral-200 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-neutral-50 transition-all"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" /> Reset
                        </button>
                      </div>
                      
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Or Use Remote URL</p>
                        <input
                          type="text"
                          required
                          value={formData.image}
                          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium text-xs text-neutral-500"
                          placeholder="https://images.unsplash.com/..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-neutral-100 flex gap-4 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-4 rounded-2xl bg-neutral-100 text-neutral-600 font-bold hover:bg-neutral-200 transition-all font-display"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-[2] px-6 py-4 rounded-2xl text-white font-black uppercase tracking-widest text-xs transition-all shadow-xl flex items-center justify-center gap-2 font-display ${isCreating ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100" : "bg-blue-600 hover:bg-blue-700 shadow-blue-100"}`}
                >
                  <Save className="w-4 h-4" /> {isCreating ? "Deploy Event" : "Save Changes"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
