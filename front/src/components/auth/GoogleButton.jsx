import { GoogleLogin } from "@react-oauth/google";

export default function GoogleButton({ onCredential }) {
  return (
    <div style={{ width: "100%" }}>
      <GoogleLogin
        onSuccess={(res) => onCredential(res.credential)}
        onError={() => console.log("Google Login Failed")}
        useOneTap={false}
        width="400"
      />
    </div>
  );
}