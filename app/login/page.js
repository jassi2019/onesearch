import AuthForm from "../../components/AuthForm";

export const metadata = { title: "Log in — OneSearch" };

export default function LoginPage() {
  return (
    <main className="auth-wrap">
      <AuthForm mode="login" />
    </main>
  );
}
