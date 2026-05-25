import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Phone, Linkedin, Building2, MapPin, Calendar, ArrowLeft, ExternalLink, User, Pencil, Save, X, Camera, Upload, Loader2, Trash2, GraduationCap, CalendarPlus, MessageSquare } from "lucide-react";
import type { Organizer, EventData } from "../types";

interface OrganizerProfileProps {
  organizer: Organizer;
  events: EventData[];
  onBack: () => void;
  isEditingEnabled?: boolean;
  onSave?: (updatedOrganizer: Organizer) => void;
}

export default function OrganizerProfile({ organizer, events, onBack, isEditingEnabled = false, onSave }: OrganizerProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Organizer>(organizer);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"about" | "events" | "contact">("about");
  const [selectedInquiryEvent, setSelectedInquiryEvent] = useState<string>("General Inquiry");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const organizerEvents = events.filter(e => e.organizerId === organizer.id);

  const handleInquiry = (eventName: string) => {
    setSelectedInquiryEvent(eventName);
    setActiveTab('contact');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setTimeout(() => {
        setFormData(prev => ({ ...prev, photo: reader.result as string }));
        setIsUploading(false);
      }, 1000);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }
    setIsEditing(false);
  };

  const currentOrg = isEditing ? formData : organizer;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-4xl mx-auto"
    >
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-neutral-500 font-bold text-sm uppercase tracking-widest hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Portal
        </button>

        {isEditingEnabled && !isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
          >
            <Pencil className="w-4 h-4" /> Edit Profile
          </button>
        )}
      </div>

      <div className="bg-white rounded-[3rem] shadow-2xl border border-neutral-100 overflow-hidden">
        {/* Header/Cover */}
        <div className="h-48 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        </div>

        <div className="px-8 pb-12 -mt-20 relative">
          <div className="flex flex-col md:flex-row items-end gap-6 mb-8">
            <div className="relative group">
              <div className="absolute -inset-2 bg-white rounded-[2.5rem] shadow-lg" />
              <div className="relative w-40 h-40 group/photo">
                <img 
                  src={currentOrg.photo} 
                  alt={currentOrg.name}
                  className="w-full h-full object-cover rounded-[2rem] border-4 border-white shadow-xl"
                />
                {isEditing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-[2rem] backdrop-blur-sm opacity-100 md:opacity-0 md:group-hover/photo:opacity-100 transition-all duration-300">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-4 bg-white/20 hover:bg-white/40 rounded-full text-white transition-all transform hover:scale-110 active:scale-95 mb-2"
                      title="Upload New Photo"
                    >
                      {isUploading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Camera className="w-8 h-8" />}
                    </button>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Change Photo</span>
                    <input 
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 pb-4">
              {isEditing ? (
                <div className="space-y-4">
                  <input 
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="text-4xl font-black text-neutral-900 tracking-tight bg-neutral-50 px-4 py-2 rounded-2xl border border-neutral-200 outline-none w-full"
                  />
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <input 
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="font-bold text-sm uppercase tracking-wider text-blue-600 bg-neutral-50 px-3 py-1 rounded-xl border border-neutral-200 outline-none flex-1"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-4xl font-black text-neutral-900 tracking-tight mb-1">{currentOrg.name}</h1>
                  <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-wider">
                    <Building2 className="w-4 h-4" />
                    {currentOrg.department}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex border-b border-neutral-100 mb-8">
            {(['about', 'events', 'contact'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-4 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${
                  activeTab === tab ? "text-blue-600" : "text-neutral-400 hover:text-neutral-600"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div 
                    layoutId="activeTab" 
                    className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full" 
                  />
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'about' && (
              <motion.div 
                key="about"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-12"
              >
                {/* Bio Info */}
                <div className="space-y-6">
                  <section className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Professional Bio</h3>
                    {isEditing ? (
                      <textarea 
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        className="w-full h-40 p-6 rounded-3xl bg-neutral-50 border border-neutral-200 outline-none text-sm text-neutral-600 leading-relaxed font-medium resize-none shadow-sm focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all"
                      />
                    ) : (
                      <p className="text-sm text-neutral-600 leading-relaxed font-medium">
                        {currentOrg.bio}
                      </p>
                    )}
                  </section>

                  <section className="p-6 rounded-3xl bg-blue-50 border border-blue-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 transform group-hover:scale-110 transition-transform">
                      <GraduationCap className="w-16 h-16" />
                    </div>
                    <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-3 italic">"Building the future of campus culture, one event at a time."</h4>
                    <p className="text-[10px] text-blue-400 font-bold uppercase tracking-tight">— Mission Statement</p>
                  </section>
                </div>

                {/* Sidebar/Contact Info */}
                <div className="space-y-8">
                  <section className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Public Records</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-4 rounded-2xl bg-neutral-50 border border-transparent">
                        <Mail className="w-5 h-5 text-blue-500" />
                        <div className="flex-1">
                          <p className="text-[10px] font-black text-neutral-400 uppercase leading-none mb-1">Public Email</p>
                          {isEditing ? (
                            <input 
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              className="text-xs font-bold text-neutral-900 bg-white border border-neutral-200 rounded-lg px-2 py-1 flex-1 w-full focus:ring-4 focus:ring-blue-50 outline-none"
                            />
                          ) : (
                            <p className="text-xs font-bold text-neutral-900">{currentOrg.email}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 rounded-2xl bg-neutral-50 border border-transparent">
                        <Phone className="w-5 h-5 text-emerald-500" />
                        <div className="flex-1">
                          <p className="text-[10px] font-black text-neutral-400 uppercase leading-none mb-1">Contact Office</p>
                          {isEditing ? (
                            <input 
                              type="text"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              className="text-xs font-bold text-neutral-900 bg-white border border-neutral-200 rounded-lg px-2 py-1 flex-1 w-full focus:ring-4 focus:ring-blue-50 outline-none"
                            />
                          ) : (
                            <p className="text-xs font-bold text-neutral-900">{currentOrg.phone}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </section>

                  {isEditing && (
                    <div className="flex gap-4 pt-4">
                      <button 
                        onClick={() => {
                          setIsEditing(false);
                          setFormData(organizer);
                        }}
                        className="flex-1 px-6 py-3 bg-neutral-100 text-neutral-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-neutral-200 transition-all font-display"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleSave}
                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 font-display flex items-center justify-center gap-2"
                      >
                        <Save className="w-4 h-4" /> Save changes
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'events' && (
              <motion.div 
                key="events"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {organizerEvents.map((event) => (
                    <div key={event.id} className="p-4 rounded-3xl bg-neutral-50 border border-neutral-100 group hover:border-blue-200 transition-all">
                      <div className="flex gap-4">
                        <img src={event.image} className="w-20 h-20 rounded-2xl object-cover shrink-0" alt="" />
                        <div className="flex-1">
                          <h4 className="font-bold text-neutral-900 mb-1 group-hover:text-blue-600 transition-colors uppercase tracking-tight text-sm">{event.name}</h4>
                          <div className="flex items-center gap-2 text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                            <Calendar className="w-3 h-3" /> {event.dateTime}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest mt-2 bg-white w-fit px-2 py-1 rounded-lg">
                            <MapPin className="w-3 h-3" /> {event.venue}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button 
                         onClick={() => handleInquiry(event.name)}
                         className="flex-1 py-2 bg-white text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-50 hover:bg-blue-50 transition-all"
                        >
                          Inquire about this
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {organizerEvents.length === 0 && (
                  <div className="text-center py-12 bg-neutral-50 rounded-[2rem] border-2 border-dashed border-neutral-200">
                    <CalendarPlus className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                    <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest">No active events hosted yet</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'contact' && (
              <motion.div 
                key="contact"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="max-w-xl mx-auto space-y-8"
              >
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-black text-neutral-900 tracking-tight">Direct Correspondence</h3>
                  <p className="text-sm text-neutral-500 font-medium">Ask {currentOrg.name} about upcoming workshops or academic collaborations.</p>
                </div>

                <div className="bg-neutral-50 p-8 rounded-[2rem] border border-neutral-100 space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Your Academic Email</label>
                      <input type="email" placeholder="student@vstech.edu" className="w-full px-5 py-3 rounded-2xl border border-neutral-200 outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-medium text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Regarding Event (Optional)</label>
                      <select 
                        value={selectedInquiryEvent}
                        onChange={(e) => setSelectedInquiryEvent(e.target.value)}
                        className="w-full px-5 py-3 rounded-2xl border border-neutral-200 outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-medium text-sm bg-white"
                      >
                        <option>General Inquiry</option>
                        {organizerEvents.map(e => <option key={e.id} value={e.name}>{e.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Your Message</label>
                      <textarea placeholder="Type your inquiry here..." className="w-full h-32 px-5 py-4 rounded-3xl border border-neutral-200 outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-medium text-sm resize-none"></textarea>
                    </div>
                  </div>
                  <button className="w-full py-4 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3">
                    <MessageSquare className="w-4 h-4" /> Send Dispatch
                  </button>
                </div>

                <div className="flex justify-center gap-8 pt-4">
                  <a href={organizer.linkedin} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-[#0077b5] transition-colors"><Linkedin className="w-6 h-6" /></a>
                  <a href={`mailto:${organizer.email}`} className="text-neutral-400 hover:text-blue-600 transition-colors"><Mail className="w-6 h-6" /></a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
