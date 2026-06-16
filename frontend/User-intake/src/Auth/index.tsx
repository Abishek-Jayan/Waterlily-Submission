import { useState } from "react";
import toast from "react-hot-toast";
import { fetchJSON } from "../api";
import type { User } from "../App";

type Mode = "login" | "register";

interface AuthProps {
  onAuthed: (user: User) => void;
}

const Auth = ({ onAuthed }: AuthProps) => {
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const path = mode === "login" ? "/login/" : "/register/";
      const data = await fetchJSON(path, {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      toast.success(mode === "login" ? "Welcome back!" : "Account created!");
      onAuthed(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Auth failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{mode === "login" ? "Log in" : "Register"}</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit" disabled={submitting}>
        {mode === "login" ? "Log in" : "Register"}
      </button>
      <button
        type="button"
        onClick={() => setMode(mode === "login" ? "register" : "login")}
      >
        {mode === "login" ? "Don't have an account? Register here" : "Already a member? Log in"}
      </button>
    </form>
  );
};

export default Auth;
