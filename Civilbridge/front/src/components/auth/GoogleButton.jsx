import { GoogleLogin } from "@react-oauth/google";

export default function GoogleButton({ onCredential, onError }) {
  return (
    <div style={{ width: "100%" }}>
      <GoogleLogin
        onSuccess={(res) => onCredential(res.credential)}
        onError={() => {
          if (onError) onError();
          else console.log("Google Login Failed");
        }}
        useOneTap={false}
        width="400"
      />
    </div>
  );
}