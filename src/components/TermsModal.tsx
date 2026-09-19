import React from 'react';
import { X, ShieldCheck, FileText, Scale, AlertTriangle, ExternalLink, Mail, Lock } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSuggestForm?: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose, onOpenSuggestForm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        id="terms-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:px-6 sm:py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                <span>Terms of Service, Privacy & Website Rules</span>
              </h2>
              <p className="text-xs text-slate-400">Last Updated: August 2026</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            id="close-terms-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 bg-slate-950/70 p-5 sm:p-8 overflow-y-auto space-y-6 text-sm text-slate-300 leading-relaxed custom-scrollbar">
          
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 text-slate-200">
            <p className="font-medium">
              Welcome to our gaming platform! By using this website, playing our games, or submitting content, you agree to follow the simple rules and conditions listed below.
            </p>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-base border-b border-slate-800/80 pb-1.5">
              <Scale className="w-4 h-4" />
              <h3>1. Acceptable Use & Player Rules</h3>
            </div>
            <p className="text-xs text-slate-400">
              Our platform is meant to provide a fun, safe, and fair gaming environment for everyone. When using this site, you agree <strong className="text-slate-200">NOT</strong> to:
            </p>
            <ul className="space-y-2 pl-2">
              <li className="flex items-start gap-2.5 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/40">
                <span className="text-rose-400 font-bold text-xs mt-0.5">•</span>
                <div>
                  <strong className="text-slate-100">Cheat or Exploit:</strong> Use hacks, bots, automated scripts, or glitches to gain unfair scores or manipulate leaderboards.
                </div>
              </li>
              <li className="flex items-start gap-2.5 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/40">
                <span className="text-rose-400 font-bold text-xs mt-0.5">•</span>
                <div>
                  <strong className="text-slate-100">Be Toxic or Mean:</strong> Engage in harassment, hate speech, spamming, or inappropriate behavior in public chat boxes, forums, or comments.
                </div>
              </li>
              <li className="flex items-start gap-2.5 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/40">
                <span className="text-rose-400 font-bold text-xs mt-0.5">•</span>
                <div>
                  <strong className="text-slate-100">Protect Your Privacy:</strong> Never share personal passwords, phone numbers, addresses, or private details in public chat or comment areas.
                </div>
              </li>
              <li className="flex items-start gap-2.5 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/40">
                <span className="text-rose-400 font-bold text-xs mt-0.5">•</span>
                <div>
                  <strong className="text-slate-100">Disrupt the Platform:</strong> Attempt to upload viruses, overload servers, or bypass security features and content blocks.
                </div>
              </li>
            </ul>
            <p className="text-xs text-amber-400/90 font-semibold pt-1">
              Failure to follow these rules may result in account suspension or a permanent ban from the website.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-base border-b border-slate-800/80 pb-1.5">
              <FileText className="w-4 h-4" />
              <h3>2. Games & Intellectual Property</h3>
            </div>
            <div className="space-y-2 text-xs text-slate-300">
              <p>
                <strong className="text-slate-100">Game Ownership:</strong> Games hosted on this site belong to their respective creators, developers, or publishers. They are hosted through direct permissions, open-source licenses, or public embedding frameworks.
              </p>
              <p>
                <strong className="text-slate-100">Platform Rights:</strong> The website design, layout, custom code, and logos belong exclusively to us. You may not copy, re-host, or redistribute our site assets without permission.
              </p>
              <p>
                <strong className="text-slate-100">Copyright Requests (DMCA):</strong> If you are a rights owner and believe your material is hosted without permission, please reach out via our contact page for immediate review and removal.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-base border-b border-slate-800/80 pb-1.5">
              <Lock className="w-4 h-4" />
              <h3>3. Site Availability & Game Saves</h3>
            </div>
            <div className="space-y-2 text-xs text-slate-300">
              <p>
                <strong className="text-slate-100">As-Is Service:</strong> We work hard to keep the site fast and bug-free, but all games and services are provided on an "AS IS" and "AS AVAILABLE" basis.
              </p>
              <p>
                <strong className="text-slate-100">Game Removal & Updates:</strong> We reserve the right to add, update, pause, or permanently remove games from our catalog at any time without prior notice.
              </p>
              <p>
                <strong className="text-slate-100">Save Data:</strong> Game progress and high scores are often saved locally within your web browser. Clearing your browser cache or history may erase this saved data. We cannot restore lost local save files.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-base border-b border-slate-800/80 pb-1.5">
              <ShieldCheck className="w-4 h-4" />
              <h3>4. Privacy & Data Use</h3>
            </div>
            <div className="space-y-2 text-xs text-slate-300">
              <p>
                <strong className="text-slate-100">Information We May Collect:</strong> We may collect technical information such as browser type, device details, IP address, usage patterns, game activity, support messages, and locally saved profile data needed to improve gameplay and site reliability.
              </p>
              <p>
                <strong className="text-slate-100">How We Use It:</strong> Data is used to maintain security, diagnose bugs, improve site performance, support users, prevent abuse, and personalize the gaming experience where applicable.
              </p>
              <p>
                <strong className="text-slate-100">No Sale of Personal Data:</strong> We do not sell your personal information to third parties. We may share limited technical data with trusted service providers, analytics tools, or advertisers only as needed to run and improve the platform.
              </p>
              <p>
                <strong className="text-slate-100">Your Responsibility:</strong> Please do not share passwords, personal addresses, phone numbers, or other private information in public comments, forums, or in-game chats. We are not responsible for information you voluntarily post publicly.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-base border-b border-slate-800/80 pb-1.5">
              <ExternalLink className="w-4 h-4" />
              <h3>5. Links & Advertisements</h3>
            </div>
            <div className="space-y-2 text-xs text-slate-300">
              <p>
                <strong className="text-slate-100">External Links:</strong> Some games contain links to third-party developer websites or external servers. We do not control and are not responsible for the content or security of external websites.
              </p>
              <p>
                <strong className="text-slate-100">Ads:</strong> Advertisements shown on the site help keep our games free to play. Interactions with third-party advertisers are governed by their own respective policies.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-base border-b border-slate-800/80 pb-1.5">
              <AlertTriangle className="w-4 h-4" />
              <h3>6. Limitation of Liability</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              To the fullest extent permitted by law, our website team and operators are not liable for any direct, indirect, or accidental technical issues, lost save data, privacy breaches caused by user-shared information, or server downtime resulting from your use of the site.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-base border-b border-slate-800/80 pb-1.5">
              <ShieldCheck className="w-4 h-4" />
              <h3>7. Updates to These Terms</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              We may update these terms and privacy practices from time to time. Continuing to use the website means you accept and agree to the current version of these rules.
            </p>
          </section>

          {/* Contact Box */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 to-indigo-950/40 border border-cyan-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                <Mail className="w-4 h-4" />
                <span>Contact Us</span>
              </div>
              <p className="text-xs text-slate-400">
                If you run into technical issues, find a broken game, have privacy questions, or have questions about these terms, please send us a message through our Contact / Suggestion form.
              </p>
            </div>
            {onOpenSuggestForm && (
              <button
                onClick={() => {
                  onClose();
                  onOpenSuggestForm();
                }}
                className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all whitespace-nowrap shrink-0"
              >
                Open Form
              </button>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 sm:px-6 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>GameLand By Pebbles The Penguin</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors"
          >
            I Agree
          </button>
        </div>
      </div>
    </div>
  );
};
