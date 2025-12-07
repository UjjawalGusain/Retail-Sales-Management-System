"use client"
import React from 'react'
import { FilterBarProps } from '../FilterBar'
import {
    Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

const allTags = [
  "makeup", "fragrance-free", "formal", "organic", "gadgets",
  "casual", "unisex", "skincare", "portable", "fashion",
  "accessories", "cotton", "smart", "beauty", "wireless"
] as const

type Tag = typeof allTags[number]

const Tags = ({ filters, setFilters }: FilterBarProps) => {
  const selectedTags = filters.tags ? filters.tags.split(',') as Tag[] : []
  
  const toggleTag = (tag: Tag) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag]
    
    const tagsString = newTags.length > 0 ? newTags.join(',') : undefined
    
    setFilters(prev => ({ ...prev, tags: tagsString, page: '1' }))
  }

  const clearAll = () => {
    setFilters(prev => ({ ...prev, tags: undefined, page: '1' }))
  }

  return (
    <Popover>
      <PopoverTrigger className='border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 dark:hover:bg-input/50 h-9 min-w-0 appearance-none rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive'>
        Tags ({selectedTags.length})
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-sm">Select Tags</h3>
          {selectedTags.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="h-6 px-2 text-xs"
            >
              Clear All
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-64 pr-2">
          <div className="grid grid-cols-2 gap-2">
            {allTags.map((tag) => (
              <div
                key={tag}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted cursor-pointer group"
                onClick={() => toggleTag(tag)}
              >
                <Checkbox
                  id={`tag-${tag}`}
                  checked={selectedTags.includes(tag)}
                  onCheckedChange={() => toggleTag(tag)}
                  className="h-4 w-4"
                />
                <label
                  htmlFor={`tag-${tag}`}
                  className="text-sm group-hover:font-medium cursor-pointer select-none"
                >
                  {tag.charAt(0).toUpperCase() + tag.slice(1)}
                </label>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        {selectedTags.length > 0 && (
          <div className="mt-4 pt-4 border-t flex flex-wrap gap-1">
            {selectedTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5">
                {tag}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive" 
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleTag(tag)
                  }}
                />
              </Badge>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

export default Tags
