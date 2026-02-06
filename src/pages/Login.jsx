import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F7FB] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 border border-black/5 shadow-md">
        <h2 className="text-2xl font-semibold text-[#1F1F1F] mb-2">Admin Login</h2>
        <p className="text-sm text-gray-400 mb-6">Sign in to manage Mentora.</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm text-gray-500">Email</label>
            <input
              className="mt-1 w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-200"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">Password</label>
            <input
              className="mt-1 w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-200"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-xl py-3 font-medium bg-gradient-to-r from-[#C613C1] to-[#902FED] text-white hover:opacity-95 transition"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
