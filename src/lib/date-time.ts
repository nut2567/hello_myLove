import dayjs, { type ConfigType } from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

const THAI_TIME_ZONE = "Asia/Bangkok";
const THAI_DATE_TIME_FORMAT = "YYYY-MM-DD HH:mm:ss";

type DailyTimeOptions = {
  hour: number;
  millisecond?: number;
  minute?: number;
  second?: number;
};

export function getCurrentDate(): Date {
  return dayjs().toDate();
}

export function getCurrentTimestamp(): number {
  return dayjs().valueOf();
}

export function formatThaiDateTimeString(date: ConfigType = dayjs()): string {
  return dayjs(date).tz(THAI_TIME_ZONE).format(THAI_DATE_TIME_FORMAT);
}

export function getCurrentThaiDateTimeString(): string {
  return formatThaiDateTimeString();
}

export function getNextThaiDailyDate(
  { hour, millisecond = 0, minute = 0, second = 0 }: DailyTimeOptions,
  now: ConfigType = dayjs(),
): Date {
  const currentDate = dayjs(now).tz(THAI_TIME_ZONE);
  let nextDate = currentDate
    .hour(hour)
    .minute(minute)
    .second(second)
    .millisecond(millisecond);

  if (!currentDate.isBefore(nextDate)) {
    nextDate = nextDate.add(1, "day");
  }

  return nextDate.toDate();
}
