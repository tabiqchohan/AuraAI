import { Suspense } from "react"
import { LoginForm } from "@/components/auth/LoginForm"
import { AuthLayout } from "@/components/auth/AuthLayout"

function LoginPageContent() {
  return <LoginForm />
}

export default function LoginPage() {
  return (
    <AuthLayout>
      <Suspense fallback={null}>
        <LoginPageContent />
      </Suspense>
    </AuthLayout>
  )
}
