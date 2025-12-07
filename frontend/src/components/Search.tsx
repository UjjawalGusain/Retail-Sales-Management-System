import React, { useState, useCallback } from 'react'
import { Input } from "@/components/ui/input"
import { FilterInterface } from '@/app/page';
import { SidebarTrigger } from "@/components/ui/sidebar"

interface SearchBarProps {
  filters: FilterInterface;
  setFilters: React.Dispatch<React.SetStateAction<FilterInterface>>;
}

const Search = ({ filters, setFilters }: SearchBarProps) => {
  const [searchValue, setSearchValue] = useState(
    filters.customerNamePrefix || filters.phonePrefix || ''
  )

  const handleSearch = useCallback((value: string) => {
    const trimmed = value.trim()

    if (!trimmed) {
      setFilters(prev => ({
        ...prev,
        customerNamePrefix: undefined,
        phonePrefix: undefined,
        page: '1'
      }))
    } else if (/^\d+$/.test(trimmed)) {
      setFilters(prev => ({
        ...prev,
        phonePrefix: trimmed.slice(0, 4),
        customerNamePrefix: undefined,
        page: '1'
      }))
    } else {
      setFilters(prev => ({
        ...prev,
        customerNamePrefix: trimmed.slice(0, 4),
        phonePrefix: undefined,
        page: '1'
      }))
    }
    setSearchValue(value)
  }, [setFilters])


  const clearSearch = () => {
    setSearchValue('')
    setFilters(prev => ({
      ...prev,
      customerNamePrefix: undefined,
      phonePrefix: undefined,
      page: '1'
    }))
  }

  return (
    <div>
      <div className='w-full h-12 flex justify-between items-center px-3 text-accent-foreground border-b-2'>
        
        <div className='text-base font-sans font-medium flex justify-center items-center'>
          <SidebarTrigger/>
          Sales Management System</div>
        <div className='relative max-w-96'>
          <Input
            id="search"
            type="search"
            className='border-2 pr-10'
            placeholder='Name, Phone no.'
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSearch(searchValue)
              }
            }}
          />
          {searchValue && (
            <button
              className='absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1'
              onClick={clearSearch}
              type="button"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Search
