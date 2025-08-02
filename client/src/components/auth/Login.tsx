import { useContext, useState } from "react";
import API from "../../lib/axios";
import { AuthContext } from "../../contexts/AuthContext";

export default function Login() {
  const { setUser } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    try {
      const res = await API.post("/login", { email, password }, { withCredentials: true });
      setUser(res.data.user);
    } catch (err) {
      alert("Login failed");
    }
  };

  const googleLogin = () => {
    window.location.href = "/api/auth/google"; // redirect to backend
  };

  return (
    <div>
      <h2>Login</h2>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={login}>Login</button>
      <button onClick={googleLogin}>Login with Google</button>
    </div>
  );
}