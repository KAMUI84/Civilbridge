import { writeLS } from "../../utils/storage.js";

export default function generateOtp(target) {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  writeLS("cb_otp", { target, code, createdAt: Date.now() });

  // MVP: show OTP in alert. Later backend sends email/SMS
  alert(`MVP OTP for ${target}: ${code}`);
  return code;
}
