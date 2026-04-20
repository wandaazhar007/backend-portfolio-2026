export function getSingleString(value: unknown): string {
  if (Array.isArray(value)) {
    return String(value[0] ?? "");
  }

  if (typeof value === "string") {
    return value;
  }

  return "";
}

export function getOptionalString(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    const first = value[0];
    return typeof first === "string" && first.trim() ? first : undefined;
  }

  if (typeof value === "string" && value.trim()) {
    return value;
  }

  return undefined;
}