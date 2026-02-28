import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

export default function StudyHours() {
  const weeklyData = [
    { day: "Mon", hours: 3 },
    { day: "Tue", hours: 2.5 },
    { day: "Wed", hours: 4 },
    { day: "Thu", hours: 2 },
    { day: "Fri", hours: 3.5 },
    { day: "Sat", hours: 5 },
    { day: "Sun", hours: 4.5 },
  ];

  const maxHours = Math.max(...weeklyData.map((d) => d.hours));

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Study Hours
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            <span className="font-bold text-foreground">24.5h</span> this week
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-1.5 sm:gap-2 h-16">
          {weeklyData.map((data) => (
            <div
              key={data.day}
              className="flex flex-col items-center flex-1 gap-1"
            >
              <div className="w-full flex items-end justify-center h-10">
                <div
                  className="w-full bg-primary/80 rounded-t transition-all hover:bg-primary"
                  style={{
                    height: `${(data.hours / maxHours) * 100}%`,
                    minHeight: "4px",
                  }}
                />
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                {data.day}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
