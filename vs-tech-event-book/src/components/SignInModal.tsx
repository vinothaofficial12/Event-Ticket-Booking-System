import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Mail, Lock, LogIn, AlertCircle, User } from "lucide-react";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string, name: string) => void;
  initialEmail?: string;
  initialName?: string;
  initialMode?: "signin" | "signup";
}

export default function SignInModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  initialEmail = "", 
  initialName = "",
  initialMode = "signin"
}: SignInModalProps) {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [email, setEmail] = useState(initialEmail);
  const [name, setName] = useState(initialName);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      if (initialEmail) setEmail(initialEmail);
      if (initialName) setName(initialName);
      setMode(initialMode);
    }
  }, [isOpen, initialEmail, initialName, initialMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (mode === "signup" && (!email || !password || !name)) {
      setError("Please fill in all fields");
      return;
    }

    if (mode === "signin" && (!email || !password)) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onSuccess(email, mode === "signup" ? name : email.split("@")[0]);
      onClose();
    }, 1500);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!resetEmail) {
      setError("Please enter your email");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setResetSent(true);
      // Simulate email sending
      console.log(`Reset link sent to ${resetEmail}`);
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-8">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl mb-4">
                    <LogIn className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-black font-display text-neutral-900">
                    {showForgotPassword ? "Reset Password" : (mode === "signin" ? "Welcome Back" : "Create Account")}
                  </h2>
                  <p className="text-neutral-500 font-medium mt-1">
                    {showForgotPassword 
                      ? "Enter your email to receive a reset link" 
                      : (mode === "signin" 
                          ? "Sign in to manage your university bookings" 
                          : "Sign up to start participating in events")}
                  </p>
                </div>

                {!showForgotPassword && (
                  <div className="flex p-1 bg-neutral-100 rounded-xl mb-6">
                    <button
                      onClick={() => setMode("signin")}
                      className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === "signin" ? "bg-white text-blue-600 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => setMode("signup")}
                      className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === "signup" ? "bg-white text-blue-600 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}
                    >
                      Sign Up
                    </button>
                  </div>
                )}

                {!showForgotPassword ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                      {mode === "signup" && (
                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                            <User className="w-4 h-4" /> Full Name
                          </label>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                          />
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                          <Mail className="w-4 h-4" /> Email Address
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="vtu24362@veltech.edu.in"
                          className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                            <Lock className="w-4 h-4" /> Password
                          </label>
                          {mode === "signin" && (
                            <button 
                              type="button"
                              onClick={() => setShowForgotPassword(true)}
                              className="text-xs font-bold text-blue-600 hover:underline"
                            >
                              Forgot Password?
                            </button>
                          )}
                        </div>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                        />
                      </div>

                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-red-50 text-red-600 p-3 rounded-xl flex items-center gap-2 text-sm font-medium"
                        >
                          <AlertCircle className="w-4 h-4" />
                          {error}
                        </motion.div>
                      )}

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:bg-neutral-300 disabled:shadow-none"
                      >
                        {isLoading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                          />
                        ) : (
                          mode === "signin" ? "Sign In" : "Sign Up"
                        )}
                      </button>
                    </form>
                ) : (
                  <div className="space-y-6">
                    {!resetSent ? (
                      <form onSubmit={handleForgotPassword} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                            <Mail className="w-4 h-4" /> Email Address
                          </label>
                          <input
                            type="email"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            placeholder="vtu24362@veltech.edu.in"
                            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                          />
                        </div>

                        {error && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-50 text-red-600 p-3 rounded-xl flex items-center gap-2 text-sm font-medium"
                          >
                            <AlertCircle className="w-4 h-4" />
                            {error}
                          </motion.div>
                        )}

                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:bg-neutral-300 disabled:shadow-none"
                        >
                          {isLoading ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                            />
                          ) : (
                            "Send Reset Link"
                          )}
                        </button>

                        <button 
                          type="button"
                          onClick={() => setShowForgotPassword(false)}
                          className="w-full text-sm font-bold text-neutral-500 hover:text-neutral-700 hover:underline"
                        >
                          Back to Sign In
                        </button>
                      </form>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-4 space-y-4"
                      >
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                          <Mail className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold text-neutral-900">Check your email!</p>
                          <p className="text-sm text-neutral-500">We've sent a password reset link to {resetEmail}</p>
                        </div>
                        <button 
                          onClick={() => {
                            setShowForgotPassword(false);
                            setResetSent(false);
                          }}
                          className="text-blue-600 font-bold hover:underline text-sm"
                        >
                          Return to Sign In
                        </button>
                      </motion.div>
                    )}
                  </div>
                )}

                <div className="mt-8 pt-6 border-t border-neutral-100 text-center">
                  <p className="text-sm text-neutral-500 font-medium">
                    {mode === "signin" ? (
                      <>
                        Don't have an account?{" "}
                        <button 
                          onClick={() => setMode("signup")}
                          className="text-blue-600 font-bold hover:underline"
                        >
                          Sign Up
                        </button>
                      </>
                    ) : (
                      <>
                        Already have an account?{" "}
                        <button 
                          onClick={() => setMode("signin")}
                          className="text-blue-600 font-bold hover:underline"
                        >
                          Sign In
                        </button>
                      </>
                    )}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
