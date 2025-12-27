

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@tanstack/react-router";
export default function RegisterForm() {
    return (
        <div className="flex flex-col justify-center px-14 py-16 max-w-md">
            <span className="mb-10 inline-flex w-fit rounded-full border px-4 py-1 text-sm">
                ExpenseManagement
            </span>

            <h1 className="text-4xl font-semibold tracking-tight">
                Create account
            </h1>

            <p className="mb-8 text-muted-foreground">
                Start managing your expenses today
            </p>

            <form className="space-y-6">
                <div className="space-y-2">
                    <Label>Full name</Label>

                    <div className="grid grid-cols-2 gap-3">
                        <Input placeholder="First name" />
                        <Input placeholder="Last name" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" placeholder="you@example.com" />
                </div>

                <div className="space-y-2">
                    <Label>Password</Label>
                    <Input type="password" />
                </div>

                <Button className="mt-4 w-full text-base">
                    Register
                </Button>
            </form>

            <p className="mt-8 text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                    to="/account/login"
                    className="text-primary underline underline-offset-4 hover:text-primary/80"
                >
                    Login
                </Link>
            </p>

        </div>

    )
}
