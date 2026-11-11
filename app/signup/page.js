import AuthForm from "../../components/AuthForm";

export const metadata = { title: "Sign up — OneSearch" };

export default function SignupPage() {
  return (
    <main className="auth-wrap">
      <AuthForm mode="signup" />
    </main>
  );
}
