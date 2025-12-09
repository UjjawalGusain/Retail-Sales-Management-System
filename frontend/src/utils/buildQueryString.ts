import { FilterInterface } from "@/app/page";

export const buildQueryString = (
  // filters: Partial<FilterInterface>
  filters: any
): string => {
  const {
    page,
    limit,
    orderBy,
    orderByType,
    ...onlyFilters
  } = filters;

  const params = new URLSearchParams();

  Object.entries(onlyFilters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;

    if (typeof value === 'string') {
      params.append(key, value);
    }
    else if (Array.isArray(value)) {
      value.forEach((val) => {
        if (val && typeof val === 'string') {
          params.append(key, val);
        }
      });
    }
  });

  if (page) params.append('page', page.toString());
  if (limit) params.append('limit', limit.toString());
  if (orderBy) params.append('orderBy', orderBy);
  if (orderByType) params.append('orderByType', orderByType);

  return params.toString();
};

