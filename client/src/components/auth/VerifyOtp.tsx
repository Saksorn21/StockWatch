import { useState } from "react";
import API from "../../lib/axios"

export default function VerifyOtp() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const verify = async () => {
    try {
      await API.post("/verify-otp", { email, otp });
      alert("Verified! Please login.");
    } catch (err) {
      alert("Invalid OTP");
    }
  };

  return (
    <div>
      <h2>Verify OTP</h2>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="OTP" value={otp} onChange={e => setOtp(e.target.value)} />
      <button onClick={verify}>Verify</button>
    </div>
  );
}