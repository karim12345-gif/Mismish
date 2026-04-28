const fmt = (iso, offset = 0) => {
  const d = new Date(iso);
  d.setDate(d.getDate() + offset);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatTimeRange = (start, end, offset = 0) => {
  const s = new Date(start);
  const e = new Date(end);
  const sHours = s.getHours() * 60 + s.getMinutes();
  const eHours = e.getHours() * 60 + e.getMinutes();

  if (sHours > eHours) {
    return `${fmt(end, offset)} – ${fmt(start, offset)}`;
  }
  return `${fmt(start, offset)} – ${fmt(end, offset)}`;
};

console.log(formatTimeRange("2024-04-27T21:50:00.000Z", "2024-04-27T21:00:00.000Z"));
console.log(formatTimeRange("2024-04-27T21:00:00.000Z", "2024-04-27T21:50:00.000Z"));
