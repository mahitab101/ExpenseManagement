import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link } from '@tanstack/react-router'

export default function LoginForm() {
    return (
        <div className="flex flex-col justify-center px-14 py-16 max-w-md">
            <span className="mb-10 inline-flex w-fit rounded-full border px-4 py-1 text-sm">
                ExpenseManagement
            </span>

            <h1 className="text-4xl font-semibold tracking-tight">
                Welcome Back
            </h1>

            <p className="mb-8 text-muted-foreground">
                Sign in to your account
            </p>

            <form className="space-y-6">
                <div className="space-y-2">
                    <Label>Email</Label>
                    <Input placeholder="you@example.com" />
                </div>

                <div className="space-y-2">
                    <Label>Password</Label>
                    <Input type="password" />
                </div>

                <Button className="mt-4 w-full text-base">
                    Login
                </Button>
            </form>

            <p className="mt-8 text-sm text-muted-foreground">
                Don’t have an account?{" "}
                <Link
                    to="/account/register"
                    className="text-primary underline underline-offset-4 hover:text-primary/80"
                >
                    Sign up
                </Link>
            </p>

        </div>
    )
}
