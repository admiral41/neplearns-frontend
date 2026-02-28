import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Ban } from "lucide-react";

export default function RecentActivity() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Ban className="h-12 w-12 text-muted-foreground/50 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">Not Available</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Activity tracking coming soon
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
