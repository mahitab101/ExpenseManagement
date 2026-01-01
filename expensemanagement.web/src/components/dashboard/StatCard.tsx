export default function StatCard({
    title,
    value,
    icon: Icon,
}: {
    title: string;
    value: string;
    icon: any;
}) {
    return (
        <div className="flex items-center gap-4 rounded-xl bg-background p-6 shadow">
            <div className="rounded-lg p-3 bg-primary/5 text-primary border border-primary/20">
                <Icon className="h-5 w-5" />
            </div>

            <div>
                <p className="text-sm text-muted-foreground">
                    {title}
                </p>
                <p className="text-2xl font-bold">
                    {value}
                </p>
            </div>
        </div>
    );
}