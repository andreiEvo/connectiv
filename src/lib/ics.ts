function toIcsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

/** Builds a downloadable .ics calendar file for an event post — no external calendar service needed. */
export function downloadEventIcs(event: {
  id: string;
  title: string;
  description: string;
  startsAt: string;
  location?: string;
}) {
  const start = new Date(event.startsAt);
  const end = new Date(start.getTime() + 60 * 60 * 1000);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//connectiv//eveniment//RO",
    "BEGIN:VEVENT",
    `UID:${event.id}@connectiv`,
    `DTSTAMP:${toIcsDate(new Date())}`,
    `DTSTART:${toIcsDate(start)}`,
    `DTEND:${toIcsDate(end)}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `DESCRIPTION:${escapeIcsText(event.description)}`,
    event.location ? `LOCATION:${escapeIcsText(event.location)}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);

  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${event.title.slice(0, 40).replace(/[^\w\- ]/g, "") || "eveniment"}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

function escapeIcsText(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n");
}
