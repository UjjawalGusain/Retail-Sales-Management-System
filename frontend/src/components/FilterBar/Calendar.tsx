"use client"
import React, { useState } from 'react'
import { FilterInterface, PaginationInterface } from '@/app/page';
import type { DateRange } from "react-day-picker"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { CalendarIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface CalendarProps {
  filters: FilterInterface & PaginationInterface;
  setFilters: (updates: Partial<FilterInterface & PaginationInterface>) => void;
}

const CalendarDatePicker = ({ filters, setFilters }: CalendarProps) => {
  const [dateRangeOpen, setDateRangeOpen] = useState(false)
  
  const dateRange = {
    from: filters.startDate ? new Date(filters.startDate) : undefined,
    to: filters.endDate ? new Date(filters.endDate) : undefined
  }

  const handleDateSelect = (range: DateRange | undefined) => {
    setFilters({
      startDate: range?.from ? range.from.toISOString().split('T')[0] : undefined,
      endDate: range?.to ? range.to.toISOString().split('T')[0] : undefined,
      page: '1'
    })
    setDateRangeOpen(false)
  }

  const clearDate = () => {
    setFilters({
      startDate: undefined,
      endDate: undefined,
      page: '1'
    })
  }

  return (
    <Popover open={dateRangeOpen} onOpenChange={setDateRangeOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 dark:hover:bg-input/50 h-9 min-w-0 appearance-none rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateRange.from ? (
            dateRange.to ? (
              `${format(dateRange.from, "PPP")} - ${format(dateRange.to, "PPP")}`
            ) : (
              format(dateRange.from, "PPP")
            )
          ) : (
            <span>Date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4">
          <Calendar
            mode="range"
            defaultMonth={dateRange.from}
            selected={dateRange}
            onSelect={handleDateSelect}
            numberOfMonths={2}
            className="rounded-lg border-0 shadow-sm"
          />
          <div className="flex justify-end pt-2 gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearDate}
              className="h-8 px-3 text-xs"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default CalendarDatePicker
