import * as React from "react"
import { cn } from "@/lib/utils"

export type ChartConfig = {
  [k: string]: { label?: string; color?: string }
}

type ChartContextType = { config: ChartConfig }
export const ChartContext = React.createContext<ChartContextType>({ config: {} })
export const useChart = () => React.useContext(ChartContext)

export const ChartContainer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { config?: ChartConfig; id?: string }>(
  ({ id, className, children, config = {}, ...props }, ref) => {
    const uid = React.useId()
    const chartId = `chart-${id || uid.replace(/:/g, "")}`
    return (
      <ChartContext.Provider value={{ config }}>
        <div
          data-chart={chartId}
          ref={ref}
          dir="rtl"
          className={cn(
            "flex aspect-video justify-center rounded-xl border bg-card/50 p-3 text-xs",
            "[&_.recharts-surface]:outline-none [&_.recharts-sector]:outline-none [&_.recharts-curve]:outline-none",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </ChartContext.Provider>
    )
  }
)
ChartContainer.displayName = "ChartContainer"

export function ChartTooltipContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-lg border bg-popover px-3 py-2 text-popover-foreground shadow-lg rtl:text-right", className)}
      {...props}
    />
  )
}
