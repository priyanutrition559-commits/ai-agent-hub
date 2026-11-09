import { searchConnectors } from "./catalogue";
export type CatalogueSort = "featured" | "name-asc" | "name-desc";
export function cataloguePage(
  query: string,
  category: string,
  sort: CatalogueSort,
  page: number,
  pageSize = 6,
) {
  const results = searchConnectors(query, category);
  if (sort !== "featured")
    results.sort((a, b) =>
      sort === "name-asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name),
    );
  const size = Number.isFinite(pageSize) ? Math.max(1, Math.min(50, Math.floor(pageSize))) : 6;
  const pages = Math.max(1, Math.ceil(results.length / size));
  const current = Number.isFinite(page) ? Math.max(1, Math.min(Math.floor(page), pages)) : 1;
  return {
    items: results.slice((current - 1) * size, current * size),
    total: results.length,
    page: current,
    pages,
  };
}
