import { useState } from "react";

export default function LoginCard({ onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = () => {
        setError("");

        // Validate credentials and determine role
        let role = null;

        if (email === "staff@gmail.com" && password === "1234") {
            role = "Staff";
        } else if (email === "volunteer@gmail.com" && password === "1234") {
            role = "Volunteer";
        } else if (email === "participant@gmail.com" && password === "1234") {
            role = "Participant";
        } else {
            setError("Invalid email or password");
            return;
        }

        // Save role to localStorage
        localStorage.setItem("role", role);
        onLogin();
    };

    return (
      <div className="login-card">
        <h2 className="login-card-title">Login</h2>

        {error && (
          <div style={{ 
            color: "red", 
            marginBottom: "10px", 
            fontSize: "14px",
            textAlign: "center" 
          }}>
            {error}
          </div>
        )}

        <input
          type="email"
          placeholder="Email"
          className="login-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="login-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="login-btn" onClick={handleLogin}>
          Login
        </button>
      </div>
    );
}