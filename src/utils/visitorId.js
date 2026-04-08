const STORAGE_KEY = "vms_visitor_sequence_by_date";

const getDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
};

const getRandomPart = () => {
  const array = new Uint32Array(1);

  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    crypto.getRandomValues(array);
    return (array[0] % 46656).toString(36).toUpperCase().padStart(3, "0");
  }

  return Math.floor(Math.random() * 46656)
    .toString(36)
    .toUpperCase()
    .padStart(3, "0");
};

export const generateVisitorId = () => {
  const now = new Date();
  const dateKey = getDateKey(now);

  let sequenceByDate = {};
  try {
    sequenceByDate = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    sequenceByDate = {};
  }

  const nextSequence = Number(sequenceByDate[dateKey] || 0) + 1;
  sequenceByDate[dateKey] = nextSequence;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sequenceByDate));

  const sequence = String(nextSequence).padStart(4, "0");
  const randomPart = getRandomPart();

  return `AMU-${dateKey}-${sequence}${randomPart}`;
};
