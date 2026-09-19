import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  BookOpen, 
  AlertTriangle, 
  X, 
  Lock, 
  Copyright,
  EyeOff,
  Cookie,
  Baby,
  Mail,
  FileText,
  CheckCircle2,
  Scale
} from 'lucide-react';

export type TermsTab = 'all' | 'privacy' | 'terms' | 'copyright';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSuggestForm?: () => void;
  initialTab?: TermsTab;
}

export const TermsModal: React.FC<TermsModalProps> = ({ 
  isOpen, 
  onClose, 
  onOpenSuggestForm,
  initialTab = 'all' 
}) => {
  const [activeTab, setActiveTab] = useState<TermsTab>(initialTab);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const email1 = "ishaany83@gmail.com";
  const email2 = "ishaan.yadav@franklinsabers.org";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-950/60 flex flex-col max-h-[92vh] overflow-hidden"
        id="terms-modal-container"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Privacy Policy & Terms of Service</span>
              </h2>
              <p className="text-xs text-slate-400">
                GameLand By Pebbles The Penguin • Updated for 2026
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            id="close-terms-modal-btn"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-slate-950/40 border-b border-slate-800 overflow-x-auto text-xs scrollbar-none">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            id="tab-all-policies"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Complete Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'privacy'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            id="tab-privacy-policy"
          >
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Privacy Policy & COPPA</span>
          </button>

          <button
            onClick={() => setActiveTab('terms')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'terms'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            id="tab-terms-of-service"
          >
            <Scale className="w-3.5 h-3.5 text-cyan-400" />
            <span>Terms of Service</span>
          </button>

          <button
            onClick={() => setActiveTab('copyright')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'copyright'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            id="tab-copyright-dmca"
          >
            <Copyright className="w-3.5 h-3.5 text-purple-400" />
            <span>DMCA & Copyright</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 bg-slate-950/70 p-5 sm:p-7 overflow-y-auto space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed custom-scrollbar">

          {/* PRIVACY POLICY SECTION */}
          {(activeTab === 'all' || activeTab === 'privacy') && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-black text-sm sm:text-base border-b border-slate-800/80 pb-2">
                <Lock className="w-5 h-5" />
                <h3>Privacy Policy & Student Data Protection</h3>
              </div>

              {/* Privacy Badges Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                    <EyeOff className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200 text-xs">Zero Personal Tracking</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      No real names, phone numbers, addresses, or credit cards required.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
                    <Cookie className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200 text-xs">No Data Sales</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      We never sell, rent, or monetize your gaming data or activity.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
                    <Baby className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200 text-xs">COPPA Compliant</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Safe for students and minors. Zero personal profile profiling.
                    </p>
                  </div>
                </div>
              </div>

              {/* Privacy Details */}
              <div className="space-y-3 bg-slate-900/40 p-4 rounded-xl border border-slate-800/60 text-xs">
                <div>
                  <h4 className="font-bold text-slate-100 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>1. Information Collection & Storage</span>
                  </h4>
                  <p className="text-slate-300 mt-1 pl-5">
                    GameLand is built as a privacy-first web application. High scores, favorite games, points, and theme preferences are saved locally inside your web browser via <code>localStorage</code>. They do not transmit private identifiable information to external tracking databases.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-100 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>2. Sandboxed Safe Play</span>
                  </h4>
                  <p className="text-slate-300 mt-1 pl-5">
                    All games run inside isolated sandboxes. Games do not have access to your device camera, microphone, local files, or contacts.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-100 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>3. Children's Online Privacy (COPPA)</span>
                  </h4>
                  <p className="text-slate-300 mt-1 pl-5">
                    In compliance with the Children's Online Privacy Protection Act (COPPA), GameLand does not knowingly collect, store, or solicit personal data from children under 13. Any user accounts created use self-chosen pseudonyms/nicknames without email verification requirement.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TERMS OF SERVICE SECTION */}
          {(activeTab === 'all' || activeTab === 'terms') && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-cyan-400 font-black text-sm sm:text-base border-b border-slate-800/80 pb-2">
                <Scale className="w-5 h-5" />
                <h3>Terms of Service & Rules</h3>
              </div>

              <div className="space-y-3 bg-slate-900/40 p-4 rounded-xl border border-slate-800/60 text-xs">
                <div>
                  <h4 className="font-bold text-slate-100 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <span>1. Acceptable Community Use</span>
                  </h4>
                  <p className="text-slate-300 mt-1 pl-5">
                    GameLand provides recreational gameplay for players and students. Users agree not to attempt automated denial-of-service, DDoS attacks, malicious script injections, or harassment against other players in chat or suggestion forms.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-100 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <span>2. Game Availability & "As-Is" Service</span>
                  </h4>
                  <p className="text-slate-300 mt-1 pl-5">
                    Games and proxies are provided on an "as-is" and "as-available" basis. We continuously verify URLs, but upstream server changes or school network firewalls may affect individual game availability.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-100 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>3. Limitation of Liability</span>
                  </h4>
                  <p className="text-slate-300 mt-1 pl-5">
                    GameLand and its operators shall not be held liable for any lost browser save data, unintended browser caching issues, or school policy violations resulting from unapproved gameplay during academic hours.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* DMCA & COPYRIGHT SECTION */}
          {(activeTab === 'all' || activeTab === 'copyright') && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-purple-400 font-black text-sm sm:text-base border-b border-slate-800/80 pb-2">
                <Copyright className="w-5 h-5" />
                <h3>DMCA & Intellectual Property</h3>
              </div>

              <div className="space-y-3 bg-slate-900/40 p-4 rounded-xl border border-slate-800/60 text-xs">
                <p className="text-slate-300">
                  GameLand respects the intellectual property rights of all game creators and publishers. All games hosted, framed, or indexed belong to their respective creators, developers, or distributors.
                </p>
                <p className="text-slate-300">
                  If you are a copyright owner or authorized representative and believe any content hosted on this site infringes upon your copyright, please contact us immediately for swift removal within 24–48 hours.
                </p>
              </div>
            </div>
          )}

          {/* DIRECT CONTACT & SUPPORT */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-indigo-950/60 border border-cyan-500/25 space-y-3">
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
              <Mail className="w-4 h-4" />
              <span>Contact Administrators & Privacy Inquiries</span>
            </div>
            <p className="text-xs text-slate-300">
              For any questions regarding our Privacy Policy, COPPA, game removals, or general feedback:
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <a 
                href={`mailto:${email1}`}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{email1}</span>
              </a>
              <a 
                href={`mailto:${email2}`}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{email2}</span>
              </a>
            </div>
            {onOpenSuggestForm && (
              <div className="pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenSuggestForm();
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all"
                  id="terms-open-suggest-form-btn"
                >
                  Or Open Support / Suggestion Form
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:px-6 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="truncate">GameLand • Fast, Private & Unblocked</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black transition-all shadow-md active:scale-95"
            id="close-terms-footer-btn"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
