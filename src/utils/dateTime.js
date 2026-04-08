export const getNowParts = () => {
  const now = new Date();

  return {
    iso: now.toISOString(),
    date: `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`,
    time: now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
  };
};

export const formatDisplayDateTime = (isoString) => {
  if (!isoString) return "N/A";

  const date = new Date(isoString);
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatDisplayDate = (isoString) => {
  if (!isoString) return "N/A";

  const date = new Date(isoString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatDisplayTime = (isoString) => {
  if (!isoString) return "N/A";

  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const calculateDuration = (entryIso, exitIso) => {
  if (!entryIso || !exitIso) return "N/A";

  const entryTime = new Date(entryIso).getTime();
  const exitTime = new Date(exitIso).getTime();
  const diffMs = Math.max(0, exitTime - entryTime);

  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes} mins`;
  return `${hours} hrs ${minutes} mins`;
};
