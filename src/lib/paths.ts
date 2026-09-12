export const base = import.meta.env.BASE_URL.replace(/\/$/, "");
/** A root-local URL, respecting the GitHub project Pages prefix. */
export function url(path: string): string {
  return path.startsWith("/") && !path.startsWith("//")
    ? `${base}${path}`
    : path;
}
export const asset = (name: string) => url(`/assets/${name}`);
export function routePath(path: string): string {
  const local =
    base && path.startsWith(`${base}/`) ? path.slice(base.length) : path;
  return local.replace(/\/index\.html$/, "/").replace(/\/?$/, "/");
}
