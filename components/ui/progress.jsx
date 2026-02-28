"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"
import { getProgressColor, getProgressBgColor } from "@/lib/utils/progress"

const Progress = React.forwardRef(({ className, value, colorByProgress = false, ...props }, ref) => {
  const indicatorColor = colorByProgress ? getProgressColor(value || 0) : "bg-primary";
  const bgColor = colorByProgress ? getProgressBgColor(value || 0) : "bg-primary/20";

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full",
        bgColor,
        className
      )}
      {...props}>
      <ProgressPrimitive.Indicator
        className={cn("h-full w-full flex-1 transition-all duration-300", indicatorColor)}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }} />
    </ProgressPrimitive.Root>
  );
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
