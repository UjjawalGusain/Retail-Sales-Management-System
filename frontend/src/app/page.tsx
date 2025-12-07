"use client"
import React, { useState } from 'react'
import Search from '@/components/Search'
import FilterBar from '@/components/FilterBar'
import TableView from '@/components/TableView'


export interface FilterInterface {
    page?: string;
    limit?: string;
    startDate?: string;
    endDate?: string;
    paymentMethod?: string;
    gender?: string;
    customerRegion?: string;
    minAge?: string;
    maxAge?: string;
    customerNamePrefix?: string;
    phonePrefix?: string;
    productCategory?: string;
    tags?: string;
    orderBy?: string;
    orderByType?: 'asc' | 'desc';
}

const Dashboard = () => {

    const [filters, setFilters] = useState<FilterInterface>({
        page: '1',
        limit: '10'
    });

    return (
        <div>
            <Search filters={filters} setFilters={setFilters} />
            <FilterBar filters={filters} setFilters={setFilters} />
            <TableView filters={filters} setFilters={setFilters}/>
        </div>
    )
}

export default Dashboard