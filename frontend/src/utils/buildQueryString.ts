import { FilterInterface } from "@/app/page";
export const buildQueryString = (filters: Partial<FilterInterface>): string => {
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, value]) => 
      value !== undefined && 
      value !== null && 
      value !== ''
    )
  ) as Record<string, string>;

  return new URLSearchParams(cleanFilters).toString();
};

export const buildKPIQueryString = (
  filters: Partial<FilterInterface>
): string => {
  const {
    page,
    limit,
    orderBy,
    orderByType,
    ...onlyFilters
  } = filters;

  const cleanFilters = Object.fromEntries(
    Object.entries(onlyFilters).filter(([_, value]) =>
      value !== undefined &&
      value !== null &&
      value !== ""
    )
  ) as Record<string, string>;

  return new URLSearchParams(cleanFilters).toString();
};
