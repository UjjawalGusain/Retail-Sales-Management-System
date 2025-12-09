"use client"
import { useState, useCallback } from 'react'
import Search from '@/components/Search'
import FilterBar from '@/components/FilterBar'
import TableView from '@/components/TableView'

export interface FilterInterface {
    customerRegion?: string[];
    gender?: string[];
    productCategory?: string[];
    paymentMethod?: string[];

    customerNamePrefix?: string;
    phonePrefix?: string;
    minAge?: string;
    maxAge?: string;
    startDate?: string;
    endDate?: string;
    tags?: string[];
}

export interface PaginationInterface {
    page: string;
    limit: string;
    orderBy: string;
    orderByType: string;
    forceHeavy?: boolean;
}

interface KpiMetrics {
    totalUnitsSold?: number;
    totalAmount?: number;
    totalDiscount?: number;
    salesRecords?: number;
    discountRecords?: number;
}

const Dashboard = () => {
    const [pagination, setPagination] = useState<PaginationInterface>({
        page: '1',
        limit: '10',
        orderBy: 'customerName',
        orderByType: 'asc'
    });

    const [kpiFilters, setKpiFilters] = useState<FilterInterface>({
        customerRegion: [],
        gender: [],
        productCategory: [],
        paymentMethod: [],
        tags: [],
        customerNamePrefix: '',
        minAge: '',
        maxAge: '',
        startDate: '',
        endDate: '',
    });

    const [kpis, setKpis] = useState<KpiMetrics | null>(null);

    const filters = { ...pagination, ...kpiFilters } as FilterInterface & PaginationInterface;

    const updateFilter = useCallback((updates: Record<string, any>) => {
        console.log("Update filter called?", updates);

        const paginationKeys = new Set(['page', 'limit', 'orderBy', 'orderByType']);
        const hasPaginationChange = Object.keys(updates).some(key =>
            paginationKeys.has(key)
        );

        console.log("hasPaginationChange:", hasPaginationChange, Object.keys(updates));

        if (hasPaginationChange) {
            console.log("Pagination changed");
            const paginationUpdates = Object.fromEntries(
                Object.entries(updates).filter(([k]) => paginationKeys.has(k))
            );
            setPagination(prev => ({ ...prev, ...paginationUpdates }));

            const kpiUpdates = Object.fromEntries(
                Object.entries(updates).filter(([k]) => !paginationKeys.has(k))
            );
            if (Object.keys(kpiUpdates).length > 0) {
                setKpiFilters(prev => ({ ...prev, ...kpiUpdates }));
            }
            return;
        }

        console.log("KPI filters changed");
        setKpiFilters(prev => ({ ...prev, ...updates }));
        setPagination(prev => ({ ...prev, page: '1' }));
    }, []);


    const handleKpisUpdate = useCallback((metrics: KpiMetrics) => {
        setKpis(metrics);
    }, []);

    return (
        <div>
            <Search filters={filters} setFilters={updateFilter} />
            <FilterBar filters={filters} setFilters={updateFilter} kpis={kpis} onResetKpis={() => setKpis(null)}/>
            <TableView
                filters={filters}
                setFilters={updateFilter}
                onKpisUpdate={handleKpisUpdate}
            />
        </div>
    )
}

export default Dashboard
