export interface IDateBounds {
  start: Date;
  end: Date;
}

export function getDayBounds(date = new Date()): IDateBounds {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return {
    start,
    end,
  };
}
