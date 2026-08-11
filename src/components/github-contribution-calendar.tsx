import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export type ContributionLevel =
  | "NONE"
  | "FIRST_QUARTILE"
  | "SECOND_QUARTILE"
  | "THIRD_QUARTILE"
  | "FOURTH_QUARTILE";

export interface ContributionDay {
  contributionCount: number;
  contributionLevel: ContributionLevel;
  date: string;
  weekday: number;
}

export interface ContributionWeek {
  contributionDays: ContributionDay[];
  firstDay: string;
}

export interface ContributionRange {
  /** Inclusive calendar dates in YYYY-MM-DD format. */
  from: string;
  to: string;
  /** The last date for which contribution data was fetched. */
  asOf: string;
}

export interface ContributionCalendarData {
  range: ContributionRange;
  totalContributions: number;
  weeks: ContributionWeek[];
}

export type ContributionRangePreset = "current-year" | "rolling-year";
export type ContributionDateInput = string | Date;
export interface ContributionDateRange {
  /** Inclusive UTC calendar date as YYYY-MM-DD or a Date. */
  from: ContributionDateInput;
  /** Inclusive UTC calendar date as YYYY-MM-DD or a Date. */
  to: ContributionDateInput;
}
export type ContributionRangeInput =
  | ContributionRangePreset
  | ContributionDateRange;
export type ContributionLabelSize = "sm" | "md" | "lg";
export type ContributionCellSize = "sm" | "md" | "lg";
export type ContributionCellColors = readonly [
  string,
  string,
  string,
  string,
  string,
];
export type ContributionTooltipSize = "sm" | "md" | "lg";
export type ContributionTooltipBorderSize = "none" | "sm" | "md" | "lg";
export type ContributionDateFormat =
  | "MM-DD-YYYY"
  | "DD-MM-YYYY"
  | "YYYY-MM-DD"
  | Intl.DateTimeFormatOptions;

export interface GithubContributionCalendarProps {
  /** Calendar data supplied by the consuming application. Omit while loading. */
  calendar?: ContributionCalendarData;
  /** Show an empty calendar while data is loading. */
  isLoading?: boolean;
  /** Optional username used only for the accessible grid label. */
  username?: string;
  /** Used to choose the human-readable range label. */
  range?: ContributionRangeInput;
  /** Show the week-label rail that appears to the left of the graph. */
  showWeekLabel?: boolean;
  /** Show the month labels above the graph. */
  showMonthLabels?: boolean;
  /** Show the contribution total below the graph. */
  showContributionLabel?: boolean;
  /** Show the Less-to-More contribution color legend. */
  showGradientLabel?: boolean;
  /** Allow the graph, its month labels, and week labels to scroll together. */
  allowScroll?: boolean;
  /** Tailwind text scale for graph labels and the contribution total. */
  labelSize?: ContributionLabelSize;
  /** CSS font family applied to every calendar label. */
  labelFont?: CSSProperties["fontFamily"];
  /** CSS color applied to every calendar label. */
  labelColor?: CSSProperties["color"];
  /** Compactness preset. Cells stay responsive to the available width. */
  cellSize?: ContributionCellSize;
  /** Colors for empty through highest-intensity cells. */
  cellColors?: ContributionCellColors;
  /** Optional SVG/React content that replaces the default square cell shape. */
  cellSvg?: ReactNode;
  /** BCP 47 locale used by Intl-based date formats. */
  locale?: string | string[];
  /** Date formatting for tooltips and multi-year range labels. */
  dateFormat?: ContributionDateFormat;
  /** Show a date and contribution-count tooltip when a cell is hovered or focused. */
  showTooltip?: boolean;
  /** CSS background color for the tooltip. */
  tooltipBgColor?: string;
  /** CSS text color for the tooltip. */
  tooltipTextColor?: string;
  /** CSS font family used by tooltip text. */
  tooltipTextFont?: CSSProperties["fontFamily"];
  /** Tailwind size preset for tooltip padding and text. */
  tooltipSize?: ContributionTooltipSize;
  /** Tailwind width preset for the tooltip border. */
  tooltipBorderSize?: ContributionTooltipBorderSize;
  /** CSS color for the tooltip border. */
  tooltipBorderColor?: string;
  /** Render a shadow behind the tooltip. */
  tooltipShadow?: boolean;
  /** Tailwind size preset for the tooltip shadow. */
  tooltipShadowSize?: ContributionTooltipSize;
  /** Additional classes applied to the calendar root element. */
  className?: string;
}

interface DisplayDay extends ContributionDay {
  isFuture: boolean;
  isOutsideRange: boolean;
}

interface ActiveTooltip {
  bottom: number;
  day: DisplayDay;
  x: number;
  y: number;
}

interface TooltipPosition {
  left: number;
  placement: "above" | "below";
  top: number;
}

interface MonthPosition {
  index: number;
  name: string;
}

const levelIndex: Record<ContributionLevel, number> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const labelSizeClasses: Record<ContributionLabelSize, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

const cellGaps: Record<ContributionCellSize, number> = {
  sm: 4,
  md: 3,
  lg: 2,
};

const cellPixels: Record<ContributionCellSize, number> = {
  sm: 10,
  md: 12,
  lg: 14,
};

const weekLabelWidths: Record<ContributionLabelSize, number> = {
  sm: 28,
  md: 32,
  lg: 38,
};

const tooltipSizeClasses: Record<ContributionTooltipSize, string> = {
  sm: "px-1.5 py-1 text-[10px]",
  md: "px-2 py-1.5 text-xs",
  lg: "px-3 py-2 text-sm",
};

const tooltipBorderClasses: Record<ContributionTooltipBorderSize, string> = {
  none: "border-0",
  sm: "border",
  md: "border-2",
  lg: "border-4",
};

const tooltipBorderRadiusClasses: Record<
  ContributionTooltipBorderSize,
  string
> = {
  none: "rounded-md",
  sm: "rounded-md",
  md: "rounded-lg",
  lg: "rounded-xl",
};

const tooltipShadowClasses: Record<ContributionTooltipSize, string> = {
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
};

function isContributionLabelSize(
  value: unknown,
): value is ContributionLabelSize {
  return value === "sm" || value === "md" || value === "lg";
}

function isContributionCellSize(value: unknown): value is ContributionCellSize {
  return value === "sm" || value === "md" || value === "lg";
}

function isContributionTooltipSize(
  value: unknown,
): value is ContributionTooltipSize {
  return value === "sm" || value === "md" || value === "lg";
}

function isContributionTooltipBorderSize(
  value: unknown,
): value is ContributionTooltipBorderSize {
  return value === "none" || value === "sm" || value === "md" || value === "lg";
}

const defaultDateFormat: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
};

function parseDate(date: string) {
  return new Date(`${date}T00:00:00.000Z`);
}

function toDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate;
}

function createEmptyCalendar(
  range: ContributionRangeInput,
): ContributionCalendarData {
  const to = new Date();
  const from = new Date(to);

  if (range === "current-year") {
    from.setUTCMonth(0, 1);
  } else if (range === "rolling-year") {
    from.setUTCDate(from.getUTCDate() - 364);
  } else {
    return {
      range: {
        asOf: toDateString(to),
        from:
          typeof range.from === "string" ? range.from : toDateString(range.from),
        to: typeof range.to === "string" ? range.to : toDateString(range.to),
      },
      totalContributions: 0,
      weeks: [],
    };
  }

  return {
    range: {
      asOf: toDateString(to),
      from: toDateString(from),
      to: toDateString(to),
    },
    totalContributions: 0,
    weeks: [],
  };
}

function formatDate(
  dateString: string,
  dateFormat: ContributionDateFormat,
  locale?: string | string[],
) {
  const date = parseDate(dateString);
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const year = String(date.getUTCFullYear());

  if (dateFormat === "MM-DD-YYYY") return `${month}-${day}-${year}`;
  if (dateFormat === "DD-MM-YYYY") return `${day}-${month}-${year}`;
  if (dateFormat === "YYYY-MM-DD") return `${year}-${month}-${day}`;

  return new Intl.DateTimeFormat(locale, {
    ...defaultDateFormat,
    ...dateFormat,
    timeZone: "UTC",
  }).format(date);
}

function formatContributionLabel(
  day: DisplayDay,
  dateFormat: ContributionDateFormat,
  locale?: string | string[],
) {
  const date = formatDate(day.date, dateFormat, locale);

  if (day.isFuture) {
    return `Future date: ${date}`;
  }

  if (day.isOutsideRange) {
    return `Outside the selected date range: ${date}`;
  }

  return `${day.contributionCount} ${day.contributionCount === 1 ? "contribution" : "contributions"} on ${date}`;
}

function buildDisplayWeeks(calendar: ContributionCalendarData) {
  const contributionsByDate = new Map(
    calendar.weeks.flatMap((week) =>
      week.contributionDays.map((day) => [day.date, day] as const),
    ),
  );
  const from = parseDate(calendar.range.from);
  const to = parseDate(calendar.range.to);
  const asOf = calendar.range.asOf;
  const firstCell = addDays(from, -from.getUTCDay());
  const lastCell = addDays(to, 6 - to.getUTCDay());
  const weeks: DisplayDay[][] = [];

  for (let date = firstCell; date <= lastCell; date = addDays(date, 1)) {
    const week = weeks.at(-1);
    const dateString = toDateString(date);
    const isOutsideRange = date < from || date > to;
    const isFuture = !isOutsideRange && dateString > asOf;
    const contribution = contributionsByDate.get(dateString);
    const day: DisplayDay = {
      contributionCount:
        isFuture || isOutsideRange ? 0 : (contribution?.contributionCount ?? 0),
      contributionLevel:
        isFuture || isOutsideRange
          ? "NONE"
          : (contribution?.contributionLevel ?? "NONE"),
      date: dateString,
      isFuture,
      isOutsideRange,
      weekday: date.getUTCDay(),
    };

    if (week?.length === 7) {
      weeks.push([day]);
    } else if (week) {
      week.push(day);
    } else {
      weeks.push([day]);
    }
  }

  return weeks;
}

function getMonthPositions(
  weeks: DisplayDay[][],
  locale?: string | string[],
): MonthPosition[] {
  return weeks.flatMap((week, index) => {
    const firstDayOfMonth = week.find(
      (day) => parseDate(day.date).getUTCDate() === 1,
    );

    if (!firstDayOfMonth) {
      return [];
    }

    return [
      {
        index,
        name: new Intl.DateTimeFormat(locale, {
          month: "short",
          timeZone: "UTC",
        }).format(parseDate(firstDayOfMonth.date)),
      },
    ];
  });
}

function formatRangeLabel(
  range: ContributionRange,
  dateFormat: ContributionDateFormat,
  locale?: string | string[],
) {
  const from = parseDate(range.from);
  const to = parseDate(range.to);

  if (from.getUTCFullYear() === to.getUTCFullYear()) {
    return String(from.getUTCFullYear());
  }

  return `${formatDate(range.from, dateFormat, locale)} – ${formatDate(range.to, dateFormat, locale)}`;
}

function formatContributionRangeLabel(
  range: ContributionRange,
  rangeInput: ContributionRangeInput,
  dateFormat: ContributionDateFormat,
  locale?: string | string[],
) {
  if (rangeInput === "rolling-year") {
    return "the last year";
  }

  return formatRangeLabel(range, dateFormat, locale);
}

function MonthLabels({
  positions,
  weekCount,
  labelSize,
  labelFont,
  labelColor,
  offset,
}: {
  positions: MonthPosition[];
  weekCount: number;
  labelSize: ContributionLabelSize;
  labelFont?: CSSProperties["fontFamily"];
  labelColor?: CSSProperties["color"];
  offset: number;
}) {
  return (
    <div
      className={cn(
        "relative mb-2 h-[1.5em] leading-none text-muted-foreground",
        labelSizeClasses[labelSize],
      )}
      style={{ color: labelColor, fontFamily: labelFont, marginLeft: offset }}
    >
      {positions.map((month) => (
        <span
          key={`${month.name}-${month.index}`}
          className="absolute"
          style={{ left: `${(month.index / weekCount) * 100}%` }}
        >
          {month.name}
        </span>
      ))}
    </div>
  );
}

function WeekLabels({
  labelSize,
  labelFont,
  labelColor,
}: {
  labelSize: ContributionLabelSize;
  labelFont?: CSSProperties["fontFamily"];
  labelColor?: CSSProperties["color"];
}) {
  return (
    <>
      {weekdayLabels.map((label, index) => (
        <span
          key={label}
          aria-hidden={index % 2 === 0 || undefined}
          className={cn(
            "relative min-h-0 min-w-0 text-muted-foreground",
            index % 2 === 0 && "invisible",
          )}
          style={{
            color: labelColor,
            fontFamily: labelFont,
            gridColumn: 1,
            gridRow: index + 1,
          }}
        >
          <span
            className={cn(
              "absolute inset-0 grid place-items-center leading-none",
              labelSizeClasses[labelSize],
            )}
          >
            {label}
          </span>
        </span>
      ))}
    </>
  );
}

function ContributionCell({
  day,
  column,
  cellColors,
  cellSvg,
  dateFormat,
  locale,
  showTooltip,
  isLoading,
  onActivate,
  onDeactivate,
}: {
  day: DisplayDay;
  column: number;
  cellColors?: ContributionCellColors;
  cellSvg?: ReactNode;
  dateFormat: ContributionDateFormat;
  locale?: string | string[];
  showTooltip: boolean;
  isLoading: boolean;
  onActivate: (day: DisplayDay, element: HTMLElement) => void;
  onDeactivate: () => void;
}) {
  const gridPosition = { gridColumn: column, gridRow: day.weekday + 1 };

  if (day.isOutsideRange) {
    return (
      <span
        aria-hidden="true"
        className="aspect-square w-full"
        style={gridPosition}
      />
    );
  }

  const level = levelIndex[day.contributionLevel];
  const style = {
    ...gridPosition,
    "--contribution-color":
      cellColors?.[level] ?? `var(--github-contribution-${level})`,
  } as CSSProperties;
  const label = formatContributionLabel(day, dateFormat, locale);

  return (
    <span
      aria-hidden={isLoading || undefined}
      aria-label={isLoading ? undefined : label}
      className={cn(
        "group relative aspect-square w-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring",
        !isLoading && "cursor-pointer",
        cellSvg
          ? "text-[var(--contribution-color)] [&_svg]:size-full"
          : "rounded-[2px] bg-[var(--contribution-color)]",
      )}
      data-future={day.isFuture || undefined}
      onBlur={isLoading ? undefined : onDeactivate}
      onFocus={
        isLoading
          ? undefined
          : (event) => onActivate(day, event.currentTarget)
      }
      onMouseEnter={
        isLoading
          ? undefined
          : (event) => onActivate(day, event.currentTarget)
      }
      onMouseLeave={isLoading ? undefined : onDeactivate}
      role={isLoading ? undefined : "gridcell"}
      style={style}
      tabIndex={isLoading ? undefined : 0}
      title={isLoading || showTooltip ? undefined : label}
    >
      {cellSvg && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 grid place-items-center"
        >
          {cellSvg}
        </span>
      )}
    </span>
  );
}

function ContributionGrid({
  username,
  displayWeeks,
  showWeekLabel,
  labelSize,
  labelFont,
  labelColor,
  cellGap,
  cellPixelSize,
  allowScroll,
  calendarColumns,
  cellColors,
  cellSvg,
  dateFormat,
  locale,
  showTooltip,
  isLoading,
  onActivate,
  onDeactivate,
}: {
  username: string;
  displayWeeks: DisplayDay[][];
  showWeekLabel: boolean;
  labelSize: ContributionLabelSize;
  labelFont?: CSSProperties["fontFamily"];
  labelColor?: CSSProperties["color"];
  cellGap: number;
  cellPixelSize: number;
  allowScroll: boolean;
  calendarColumns: string;
  cellColors?: ContributionCellColors;
  cellSvg?: ReactNode;
  dateFormat: ContributionDateFormat;
  locale?: string | string[];
  showTooltip: boolean;
  isLoading: boolean;
  onActivate: (day: DisplayDay, element: HTMLElement) => void;
  onDeactivate: () => void;
}) {
  return (
    <div
      className="grid"
      role="grid"
      aria-label={`GitHub contributions for ${username}`}
      style={{
        columnGap: cellGap,
        gridTemplateColumns: calendarColumns,
        gridTemplateRows: allowScroll
          ? `repeat(7, ${cellPixelSize}px)`
          : undefined,
        rowGap: cellGap,
      }}
    >
      {showWeekLabel && (
        <WeekLabels
          labelColor={labelColor}
          labelFont={labelFont}
          labelSize={labelSize}
        />
      )}
      {displayWeeks.flatMap((week, weekIndex) =>
        week.map((day) => (
          <ContributionCell
            key={day.date}
            cellColors={cellColors}
            cellSvg={cellSvg}
            column={weekIndex + (showWeekLabel ? 2 : 1)}
            dateFormat={dateFormat}
            day={day}
            locale={locale}
            onActivate={onActivate}
            onDeactivate={onDeactivate}
            showTooltip={showTooltip}
            isLoading={isLoading}
          />
        )),
      )}
    </div>
  );
}

function ContributionSummary({
  calendar,
  range,
  dateFormat,
  locale,
  labelSize,
  labelFont,
  labelColor,
  cellColors,
  cellSvg,
  showContributionLabel,
  showGradientLabel,
}: {
  calendar: ContributionCalendarData;
  range: ContributionRangeInput;
  dateFormat: ContributionDateFormat;
  locale?: string | string[];
  labelSize: ContributionLabelSize;
  labelFont?: CSSProperties["fontFamily"];
  labelColor?: CSSProperties["color"];
  cellColors?: ContributionCellColors;
  cellSvg?: ReactNode;
  showContributionLabel: boolean;
  showGradientLabel: boolean;
}) {
  if (!showContributionLabel && !showGradientLabel) return null;

  return (
    <div
      className={cn(
        "mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-muted-foreground",
        labelSizeClasses[labelSize],
      )}
      style={{ color: labelColor, fontFamily: labelFont }}
    >
      {showContributionLabel ? (
        <span className="leading-none">
          {calendar.totalContributions.toLocaleString()}{" "}
          {calendar.totalContributions === 1 ? "contribution" : "contributions"}{" "}
          in {formatContributionRangeLabel(calendar.range, range, dateFormat, locale)}
        </span>
      ) : (
        <span />
      )}
      {showGradientLabel && (
        <div className="flex items-center gap-1.5 leading-none">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <span
              key={level}
              aria-hidden="true"
              className={cn(
                "relative h-[1em] w-[1em] shrink-0",
                cellSvg
                  ? "text-[var(--contribution-color)] [&_svg]:size-full"
                  : "rounded-[2px] bg-[var(--contribution-color)]",
              )}
              style={
                {
                  "--contribution-color":
                    cellColors?.[level] ??
                    `var(--github-contribution-${level})`,
                } as CSSProperties
              }
            >
              {cellSvg && (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 grid place-items-center"
                >
                  {cellSvg}
                </span>
              )}
            </span>
          ))}
          <span>More</span>
        </div>
      )}
    </div>
  );
}

function ContributionTooltip({
  tooltip,
  dateFormat,
  locale,
  backgroundColor,
  textColor,
  textFont,
  size,
  borderSize,
  borderColor,
  shadow,
  shadowSize,
}: {
  tooltip?: ActiveTooltip;
  dateFormat: ContributionDateFormat;
  locale?: string | string[];
  backgroundColor: string;
  textColor: string;
  textFont?: CSSProperties["fontFamily"];
  size: ContributionTooltipSize;
  borderSize: ContributionTooltipBorderSize;
  borderColor: string;
  shadow: boolean;
  shadowSize: ContributionTooltipSize;
}) {
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const [position, setPosition] = useState<TooltipPosition>();

  useLayoutEffect(() => {
    const tooltipElement = tooltipRef.current;
    if (!tooltip || !tooltipElement) return;

    const updatePosition = () => {
      const { height, width } = tooltipElement.getBoundingClientRect();
      const gutter = 8;
      const minLeft = Math.min(width / 2 + gutter, window.innerWidth / 2);
      const maxLeft = Math.max(minLeft, window.innerWidth - width / 2 - gutter);
      const placement =
        tooltip.y - height - gutter >= 0 ? "above" : "below";
      const top =
        placement === "above"
          ? tooltip.y - 2
          : Math.max(
              gutter,
              Math.min(tooltip.bottom + 2, window.innerHeight - height - gutter),
            );

      setPosition({
        left: Math.min(Math.max(tooltip.x, minLeft), maxLeft),
        placement,
        top,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, [tooltip, size, borderSize]);

  if (!tooltip || typeof document === "undefined") return null;

  return createPortal(
    <span
      ref={tooltipRef}
      className={cn(
        "pointer-events-none fixed z-[100] box-border w-max -translate-x-1/2 border-solid text-center",
        position?.placement !== "below" && "-translate-y-full",
        tooltipBorderClasses[borderSize],
        tooltipBorderRadiusClasses[borderSize],
        tooltipSizeClasses[size],
        shadow && tooltipShadowClasses[shadowSize],
      )}
      role="tooltip"
      style={{
        backgroundColor,
        borderColor,
        color: textColor,
        fontFamily: textFont,
        left: position?.left ?? tooltip.x,
        top: position?.top ?? tooltip.y - 2,
      }}
    >
      {formatDate(tooltip.day.date, dateFormat, locale)} : {" "}
      {tooltip.day.contributionCount}{" "}
      {tooltip.day.contributionCount === 1 ? "contribution" : "contributions"}
    </span>,
    document.body,
  );
}

/**
 * A GitHub-style contribution graph. Its rendering layer works with supplied
 * calendar data, so it can later be extracted from this site's API and reused.
 */
export function GithubContributionCalendar({
  username = "user",
  calendar,
  isLoading = false,
  range = "rolling-year",
  showWeekLabel = true,
  showMonthLabels = true,
  showContributionLabel = true,
  showGradientLabel = true,
  allowScroll = true,
  labelSize = "md",
  labelFont,
  labelColor,
  cellSize = "md",
  cellColors,
  cellSvg,
  locale,
  dateFormat = defaultDateFormat,
  showTooltip = true,
  tooltipBgColor = "var(--popover)",
  tooltipTextColor = "var(--popover-foreground)",
  tooltipTextFont,
  tooltipSize = "md",
  tooltipBorderSize = "md",
  tooltipBorderColor = "var(--border)",
  tooltipShadow = false,
  tooltipShadowSize = "md",
  className,
}: GithubContributionCalendarProps) {
  const [activeTooltip, setActiveTooltip] = useState<ActiveTooltip>();
  const displayCalendar = useMemo(
    () => calendar ?? createEmptyCalendar(range),
    [calendar, range],
  );
  const displayWeeks = useMemo(
    () => buildDisplayWeeks(displayCalendar),
    [displayCalendar],
  );
  const monthPositions = useMemo(
    () => getMonthPositions(displayWeeks, locale),
    [displayWeeks, locale],
  );
  const resolvedLabelSize = isContributionLabelSize(labelSize)
    ? labelSize
    : "md";
  const resolvedCellSize = isContributionCellSize(cellSize) ? cellSize : "md";
  const resolvedTooltipSize = isContributionTooltipSize(tooltipSize)
    ? tooltipSize
    : "md";
  const resolvedTooltipBorderSize = isContributionTooltipBorderSize(
    tooltipBorderSize,
  )
    ? tooltipBorderSize
    : "md";
  const resolvedTooltipShadowSize = isContributionTooltipSize(tooltipShadowSize)
    ? tooltipShadowSize
    : "md";
  const cellGap = cellGaps[resolvedCellSize];
  const cellPixelSize = cellPixels[resolvedCellSize];
  const weekLabelWidth = weekLabelWidths[resolvedLabelSize];
  const weekLabelColumnWidth = weekLabelWidth + 8;
  const calendarOffset = showWeekLabel ? weekLabelColumnWidth + cellGap : 0;
  const calendarWidth =
    displayWeeks.length * cellPixelSize +
    Math.max(displayWeeks.length - 1, 0) * cellGap;
  const scrollContentWidth = calendarWidth + calendarOffset;
  const contributionColumns = allowScroll
    ? `repeat(${displayWeeks.length}, ${cellPixelSize}px)`
    : `repeat(${displayWeeks.length}, minmax(0, 1fr))`;
  const calendarColumns = showWeekLabel
    ? `${weekLabelColumnWidth}px ${contributionColumns}`
    : contributionColumns;

  return (
    <section
      aria-busy={isLoading || undefined}
      className={cn(
        "mx-auto flex w-full max-w-4xl flex-col gap-5 px-5 pb-10",
        className,
      )}
    >
      <div className="w-full pb-1">
        <div
          className={cn(
            "w-full",
            allowScroll && "overflow-x-auto overflow-y-hidden py-1",
          )}
          onScroll={() => setActiveTooltip(undefined)}
        >
          <div
            className="w-full"
            style={allowScroll ? { minWidth: scrollContentWidth } : undefined}
          >
            {showMonthLabels && (
              <MonthLabels
                labelColor={labelColor}
                labelFont={labelFont}
                labelSize={resolvedLabelSize}
                offset={calendarOffset}
                positions={monthPositions}
                weekCount={displayWeeks.length}
              />
            )}

            <ContributionGrid
              allowScroll={allowScroll}
              calendarColumns={calendarColumns}
              cellColors={cellColors}
              cellGap={cellGap}
              cellPixelSize={cellPixelSize}
              cellSvg={cellSvg}
              dateFormat={dateFormat}
              displayWeeks={displayWeeks}
              labelColor={labelColor}
              labelFont={labelFont}
              labelSize={resolvedLabelSize}
              locale={locale}
              onActivate={(day, element) => {
                const rect = element.getBoundingClientRect();
                setActiveTooltip({
                  bottom: rect.bottom,
                  day,
                  x: rect.left + rect.width / 2,
                  y: rect.top,
                });
              }}
              onDeactivate={() => setActiveTooltip(undefined)}
              showTooltip={showTooltip && !isLoading}
              isLoading={isLoading}
              showWeekLabel={showWeekLabel}
              username={username}
            />
          </div>
        </div>

        <ContributionSummary
          calendar={displayCalendar}
          cellColors={cellColors}
          cellSvg={cellSvg}
          dateFormat={dateFormat}
          labelColor={labelColor}
          labelFont={labelFont}
          labelSize={resolvedLabelSize}
          locale={locale}
          range={range}
          showContributionLabel={showContributionLabel}
          showGradientLabel={showGradientLabel}
        />
      </div>
      {showTooltip && !isLoading && (
        <ContributionTooltip
          backgroundColor={tooltipBgColor}
          borderColor={tooltipBorderColor}
          borderSize={resolvedTooltipBorderSize}
          dateFormat={dateFormat}
          locale={locale}
          size={resolvedTooltipSize}
          shadow={tooltipShadow === true}
          shadowSize={resolvedTooltipShadowSize}
          textColor={tooltipTextColor}
          textFont={tooltipTextFont}
          tooltip={activeTooltip}
        />
      )}
    </section>
  );
}
