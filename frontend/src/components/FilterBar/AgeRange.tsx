"use client"
import { Button } from './../ui/button';
import { Input } from './../ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { FilterBarProps } from '../FilterBar';


const AgeRange = ({ filters, setFilters }: FilterBarProps) => {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className={`border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 dark:hover:bg-input/50 h-9 min-w-0 appearance-none rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive`}
                >
                    Age Range: {filters.minAge || '0'} - {filters.maxAge || '∞'}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-4">
                <div className="space-y-3">
                    <label className="text-xs font-medium uppercase text-muted-foreground">
                        Min Age
                    </label>
                    <Input
                        type="number"
                        min="0"
                        max="120"
                        value={filters.minAge || ''}
                        onChange={(e) => setFilters(prev => ({
                            ...prev,
                            minAge: e.target.value || undefined,
                            page: '1'
                        }))}
                        className="h-9"
                        placeholder="0"
                    />

                    <label className="text-xs font-medium uppercase text-muted-foreground">
                        Max Age
                    </label>
                    <Input
                        type="number"
                        min="0"
                        max="120"
                        value={filters.maxAge || ''}
                        onChange={(e) => setFilters(prev => ({
                            ...prev,
                            maxAge: e.target.value || undefined,
                            page: '1'
                        }))}
                        className="h-9"
                        placeholder="∞"
                    />

                    <div className="flex justify-end pt-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setFilters(prev => ({
                                ...prev,
                                minAge: undefined,
                                maxAge: undefined,
                                page: '1'
                            }))}
                            className="h-8 px-3 text-xs"
                        >
                            Clear
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}

export default AgeRange