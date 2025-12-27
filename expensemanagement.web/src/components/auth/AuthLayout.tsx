import { Card } from "@/components/ui/card";

type AuthLayoutProps = {
    children: React.ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted">
            <Card className="grid w-full max-w-5xl min-h-[620px] grid-cols-1 overflow-hidden rounded-3xl shadow-xl md:grid-cols-2">
                {/* LEFT SIDE */}
                {children}

                {/* RIGHT SIDE */}

                <div className="relative hidden md:block">
                    <img
                        src="/images/login-illustration.svg"
                        alt="Expense Management Illustration"
                        className="max-h-full w-auto object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-black/20 to-black/40" />


                    {/* floating card */}
                    <div className="absolute bottom-8 left-8 rounded-xl bg-background/90 p-4 shadow-md">
                        <p className="text-sm font-medium">Manage Your Expense</p>
                        <p className="text-xs text-muted-foreground capitalize">
                            in one place
                        </p>
                    </div>
                </div>

            </Card>
        </div>
    );
}
