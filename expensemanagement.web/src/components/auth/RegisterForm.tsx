

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthActions } from "@/hooks/useAuthActions";
import type { RegisterFormInputs } from "@/Types";
import { Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
export default function RegisterForm() {
    const navigate = useNavigate();
   const { register: registerUser , isRegistering } = useAuthActions();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormInputs>();

    const onSubmit = (data: RegisterFormInputs) => {
        registerUser (data, {
            onSuccess: (res) => {
                if (!res.success) return;

                navigate({
                    to: "/verify-email",
                    search: {
                        email: data.email,
                    },
                });
            },
        });
    };


    return (
        <div className="flex flex-col justify-center px-14 py-8">

            <h1 className="text-2xl font-bold tracking-tight text-on-surface mb-2">
                Create account
            </h1>

            <p className="mb-8 text-muted-foreground">
                Start managing your expenses today
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                {/* Full name */}
                <div className="space-y-2">
                    <Label>Full name</Label>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Input
                                placeholder="First name"
                                {...register("firstName", { required: "First name is required" })}
                            />
                            {errors.firstName && (
                                <p className="text-sm text-red-500">
                                    {errors.firstName.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <Input
                                placeholder="Last name"
                                {...register("lastName", { required: "Last name is required" })}
                            />
                            {errors.lastName && (
                                <p className="text-sm text-red-500">
                                    {errors.lastName.message}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                        type="email"
                        placeholder="you@example.com"
                        {...register("email", {
                            required: "Email is required",
                            pattern: {
                                value: /^\S+@\S+$/i,
                                message: "Invalid email",
                            },
                        })}
                    />
                    {errors.email && (
                        <p className="text-sm text-red-500">
                            {errors.email.message}
                        </p>
                    )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                    <Label>Password</Label>
                    <Input
                        type="password"
                        {...register("password", {
                            required: "Password is required",
                            minLength: {
                                value: 6,
                                message: "Minimum 6 characters",
                            },
                        })}
                    />
                    {errors.password && (
                        <p className="text-sm text-red-500">
                            {errors.password.message}
                        </p>
                    )}
                </div>

                <Button type="submit" className="mt-4 w-full text-base" 
                disabled={isRegistering}>
                    {isRegistering ? "Creating..." : "Register"}
                </Button>
            </form>

            <p className="mt-8 text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                    to="/login"
                    className="text-primary underline underline-offset-4 hover:text-primary/80"
                >
                    Login
                </Link>
            </p>
        </div>
    );
}
