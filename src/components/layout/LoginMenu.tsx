import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, User as UserIcon, Mail, Lock, Chrome, AlertCircle, Trash2 } from 'lucide-react';
import { 
  auth, db, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, signOut, User, doc, deleteDoc 
} from '../../lib/dbAdapter';

export function triggerOpenLoginModal() {
  window.dispatchEvent(new CustomEvent('geo_open_login_modal'));
}

interface Props {
  user: User | null;
  theme: 'dark' | 'light';
  onShowProgress: () => void;
}

export default function LoginMenu({ user, theme, onShowProgress }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('geo_open_login_modal', handleOpen);
    return () => window.removeEventListener('geo_open_login_modal', handleOpen);
  }, []);
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isDark = theme === 'dark';

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setIsOpen(false);
    } catch (err: any) {
      setError(err.message || 'Inloggen met Google mislukt.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isLoginView) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      setIsOpen(false);
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setError(err.message || 'Authenticatie mislukt.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setIsOpen(false);
  };
  
  const handleDeleteAccount = async () => {
     if (window.confirm("Weet je zeker dat je je account en alle opgeslagen voortgang wilt verwijderen? Dit kan niet ongedaan worden gemaakt.")) {
         try {
             if (auth.currentUser) {
                 const uid = auth.currentUser.uid;
                 // Delete the Firestore document first since rules require auth
                 await deleteDoc(doc(db, 'users', uid));
                 // Then delete the user account
                 await auth.currentUser.delete();
             }
         } catch (err: any) {
             if (err?.code === 'auth/requires-recent-login') {
               alert("Voor je veiligheid moet je eerst uitloggen en opnieuw inloggen om je account te kunnen verwijderen.");
             } else {
               alert(err.message || "Fout bij verwijderen account. Log opnieuw in en probeer opnieuw.");
             }
         }
     }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
          user 
            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
            : isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
        }`}
      >
        {user ? (
          <>
            <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold overflow-hidden">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
            <span className="text-sm font-bold max-w-[100px] truncate hidden sm:inline-block">
              {user.displayName || user.email?.split('@')[0]}
            </span>
          </>
        ) : (
          <>
            <UserIcon className="w-4 h-4" />
            <span className="text-sm font-bold hidden sm:inline-block">Inloggen</span>
          </>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={`absolute right-0 top-full mt-2 w-80 rounded-2xl shadow-xl z-50 overflow-hidden border ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              {user ? (
                <div className="p-4 space-y-2">
                  <div className="pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
                    <p className="text-sm font-bold">{user.displayName}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                  <button
                    onClick={() => { onShowProgress(); setIsOpen(false); }}
                    className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Mijn Voortgang
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                  >
                    <LogOut className="w-4 h-4" />
                    Uitloggen
                  </button>
                  <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800">
                      <button
                        onClick={handleDeleteAccount}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                        Account verwijderen
                      </button>
                  </div>
                </div>
              ) : (
                <div className="p-5 space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="font-bold text-lg mb-1">{isLoginView ? 'Inloggen' : 'Account aanmaken'}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Sla je instellingen en voortgang op. Gastmodus is ook altijd mogelijk zonder account!
                    </p>
                  </div>

                  <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
                  >
                    <Chrome className="w-4 h-4 text-blue-500" />
                    Inloggen met Google
                  </button>

                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                    <span className="flex-shrink-0 mx-4 text-xs text-slate-400">of</span>
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                  </div>

                  <form onSubmit={handleEmailAuth} className="space-y-3">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="E-mailadres"
                        required
                        className={`w-full pl-9 pr-3 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                        }`}
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Wachtwoord"
                        required
                        className={`w-full pl-9 pr-3 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                        }`}
                      />
                    </div>

                    {error && (
                      <div className="flex items-start gap-2 text-rose-500 text-xs bg-rose-50 dark:bg-rose-500/10 p-2 rounded-lg">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50 flex justify-center items-center"
                    >
                      {loading ? (
                         <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      ) : isLoginView ? 'Inloggen' : 'Registreren'}
                    </button>
                  </form>

                  <div className="text-center pt-2">
                    <button
                      onClick={() => setIsLoginView(!isLoginView)}
                      className="text-xs text-blue-500 hover:underline"
                    >
                      {isLoginView ? 'Nog geen account? Maak er een aan' : 'Al een account? Log in'}
                    </button>
                  </div>
                  
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 mt-2">
                    <p className="text-[10px] text-slate-400 text-center leading-tight">
                      <strong>Privacyverklaring:</strong> Wij slaan enkel je e-mailadres, gekozen leerstofvoorkeuren en oefenstatistieken op, puur om je voorkeuren en voortgang te onthouden. Er worden geen gegevens gedeeld met derden.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
