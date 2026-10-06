import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, CheckCircle2, HeartHandshake } from 'lucide-react';

export const AboutContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    industry: 'Healthcare',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="py-16 bg-white dark:bg-[#070D18] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Brand Mission */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            <HeartHandshake className="w-3.5 h-3.5" />
            Our Core Mission
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-950 dark:text-white tracking-tight">
            Technology That Feels Human and Natural
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            At Auris, we design high-precision conversational voice systems that honor human connection, eliminate friction from routine phone operations, and help businesses scale with sub-100ms response intelligence.
          </p>
        </motion.div>

        {/* Contact Form & Office Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Info Column */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <h3 className="text-2xl font-black text-slate-950 dark:text-white mb-2">Speak With Our Team</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Whether you're exploring high-volume healthcare triage or setting up your first AI receptionist, our solutions architects are here to guide you.
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#EEF8FC] text-[#2189C8] flex items-center justify-center">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-[#82919A]">Direct Line (AI Assisted)</div>
                    <div className="font-semibold text-[#123047]">+1 (800) 459-AURIS</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#EFFAF1] text-[#38A85B] flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-[#82919A]">Enterprise Inquiries</div>
                    <div className="font-semibold text-[#123047]">hello@auris.ai</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#EEF8FC] text-[#2189C8] flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-[#82919A]">Global Presence</div>
                    <div className="font-semibold text-[#123047]">San Francisco, CA & Bengaluru, India</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Contact Form */}
            <div className="lg:col-span-7">
              {submitted ? (
                <div className="p-8 rounded-2xl bg-[#EFFAF1] border border-[#65C978]/40 text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-[#38A85B] mx-auto" />
                  <h4 className="text-xl font-bold text-[#123047]">Thank You!</h4>
                  <p className="text-sm text-[#52636D]">
                    Your inquiry has been received. One of our voice deployment specialists will call you shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1.5">Full Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Venkat Karthik"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-emerald-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1.5">Work Email</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="karthikvenkat316@gmail.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-emerald-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1.5">Company / Practice</label>
                      <input
                        type="text"
                        required
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Acme Global Enterprise"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-emerald-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1.5">Primary Industry</label>
                      <select
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-emerald-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      >
                        <option value="Healthcare">Healthcare & Clinics</option>
                        <option value="Fitness">Fitness & Wellness</option>
                        <option value="Real Estate">Real Estate</option>
                        <option value="Hospitality">Hospitality & Hotels</option>
                        <option value="Restaurants">Restaurants</option>
                        <option value="Education">Education</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1.5">Expected Call Volume or Use Case</label>
                    <textarea
                      rows={3}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us about your call volume, current front-desk challenges, or integration requirements..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-emerald-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Submit Inquiry
                  </button>
                </form>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
