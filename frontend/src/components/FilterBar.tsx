import React from 'react'
import {
    NativeSelect,
    NativeSelectOptGroup,
    NativeSelectOption,
} from "@/components/ui/native-select"
import { IoReload } from "react-icons/io5";
import { CiCircleInfo } from "react-icons/ci";
import { FilterInterface } from '@/app/page';


interface FilterBarProps {
  filters: FilterInterface;
  setFilters: React.Dispatch<React.SetStateAction<FilterInterface>>;
}

const FilterBar = ({ filters, setFilters }: FilterBarProps) => {
    return (
        <div className='w-full flex flex-col gap-3 px-3'>
            <div className='py-4 flex justify-between items-center'>
                <div className='flex gap-3'>
                    <button className='p-3 bg-muted rounded-sm'><IoReload /></button>
                    <NativeSelect>
                        <NativeSelectOption value="">Customer Region</NativeSelectOption>
                    </NativeSelect>
                    <NativeSelect>
                        <NativeSelectOption value="">Gender</NativeSelectOption>
                    </NativeSelect>
                    <NativeSelect>
                        <NativeSelectOption value="">Age Range</NativeSelectOption>
                    </NativeSelect>
                    <NativeSelect>
                        <NativeSelectOption value="">Product Category</NativeSelectOption>
                    </NativeSelect>
                    <NativeSelect>
                        <NativeSelectOption value="">Tags</NativeSelectOption>
                    </NativeSelect>
                    <NativeSelect>
                        <NativeSelectOption value="">Payment Method</NativeSelectOption>
                    </NativeSelect>
                    <NativeSelect>
                        <NativeSelectOption value="">Date</NativeSelectOption>
                    </NativeSelect>
                </div>
                <div>
                    <NativeSelect>
                        <NativeSelectOption value="">Sort By: Customer Name(A-Z)</NativeSelectOption>
                    </NativeSelect>
                </div>
            </div>
            <div className='flex gap-3'>
                <div className='flex flex-col w-fit px-3 py-2 border-2 rounded-md'>
                    <div className='flex items-center  gap-1 text-sm'>Total units sold <CiCircleInfo/></div>
                    <div className='text-base font-semibold'>10</div>
                </div>
                <div className='flex flex-col w-fit px-3 py-2 border-2 rounded-md'>
                    <div className='flex items-center gap-1 text-sm'>Total amount <CiCircleInfo/></div>
                    <div className='text-base font-semibold'>₹89,000 (19 SRs)</div>
                </div>
                <div className='flex flex-col w-fit px-3 py-2 border-2 rounded-md'>
                    <div className='flex items-center gap-1 text-sm'>Total Discount <CiCircleInfo/></div>
                    <div className='text-base font-semibold'>₹15,000 (45 SRs)</div>
                </div>
            </div>
        </div>
    )
}

export default FilterBar