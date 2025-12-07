import React from 'react'
import { Input } from "@/components/ui/input"
import { FilterInterface } from '@/app/page';

interface SearchBarProps {
  filters: FilterInterface;
  setFilters: React.Dispatch<React.SetStateAction<FilterInterface>>;
}

const Search = ({ filters, setFilters }: SearchBarProps) => {
  return (
    <div>
        <div className='w-full h-12 flex justify-between items-center px-3 text-accent-foreground border-b-2'>
            <div className='text-base font-sans font-medium'>Sales Management System</div>
            <Input id="search" type="search" className='max-w-96 border-2' placeholder='Name, Phone no.'/>
        </div>
    </div>
  )
}

export default Search;