import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
const { login } = useAuth();

  async function handleLogin(event) {
  event.preventDefault();

  try {
    setIsLoading(true);
    setMessage("");

    const profile = await login(
      email,
      password,
    );

    if (profile.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/framer");
    }
  } catch (error) {
    console.error("Login error:", error);

    setMessage(
      error.message || "Unable to log in.",
    );
  } finally {
    setIsLoading(false);
  }
}

  return (
    <div>
      <h1>RAS Safety Forms</h1>

      <h2>Sign In</h2>

      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="email">Email</label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

export default Login;