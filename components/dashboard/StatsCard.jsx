import { Card, CardContent } from "@/components/ui/card";

export default function StatsCard({ icon: Icon, label, value, trend }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-3 rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              {label}
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-xl sm:text-2xl font-bold">{value}</p>
              {trend && (
                <span className="text-xs text-green-600 font-medium">
                  {trend}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
