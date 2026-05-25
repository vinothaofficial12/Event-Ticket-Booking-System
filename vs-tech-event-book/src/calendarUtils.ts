import type { EventData } from "./types";

export const generateGoogleCalendarUrl = (event: EventData | { name: string; description: string; venue: string; dateTime: string }) => {
  try {
    // Expected format: "2026-05-15 10:00 AM"
    const parts = event.dateTime.split(" ");
    if (parts.length < 3) return "#";
    
    const [datePart, timePart, ampm] = parts;
    const dateParts = datePart.split("-");
    if (dateParts.length < 3) return "#";
    
    const [year, month, day] = dateParts;
    const timeParts = timePart.split(":");
    if (timeParts.length < 2) return "#";
    
    const [hours, minutes] = timeParts;
    
    let h = parseInt(hours);
    if (ampm === "PM" && h < 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;
    
    // Format: YYYYMMDDTHHMMSSZ
    // Note: This treats the local time as UTC for simplicity in this demo, 
    // real apps would handle timezones properly.
    const startTime = `${year}${month}${day}T${h.toString().padStart(2, '0')}${minutes}00Z`;
    
    // Assume 2 hour duration
    const endH = (h + 2) % 24;
    const endTime = `${year}${month}${day}T${endH.toString().padStart(2, '0')}${minutes}00Z`;

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.name,
      details: event.description,
      location: event.venue,
      dates: `${startTime}/${endTime}`,
    });

    return `https://www.google.com/calendar/render?${params.toString()}`;
  } catch (e) {
    console.error("Error generating calendar URL:", e);
    return "#";
  }
};
