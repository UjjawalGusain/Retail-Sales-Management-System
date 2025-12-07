import React from 'react'
import Search from '@/components/Search'
import FilterBar from '@/components/FilterBar'
import TableView from '@/components/TableView'

const Dashboard = () => {
    return (
        <div>
            <Search/>
            <FilterBar/>
            <TableView/>
        </div>
    )
}

export default Dashboard