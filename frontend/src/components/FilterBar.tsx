import React from 'react'
import {
    NativeSelect,
    NativeSelectOptGroup,
    NativeSelectOption,
} from "@/components/ui/native-select"
import { IoReload } from "react-icons/io5";
import { CiCircleInfo } from "react-icons/ci";
import { FilterInterface } from '@/app/page';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import AgeRange from './FilterBar/AgeRange';
import Calendar from './FilterBar/Calendar';
import Tags from './FilterBar/Tags';


export interface FilterBarProps {
    filters: FilterInterface;
    setFilters: React.Dispatch<React.SetStateAction<FilterInterface>>;
}

const nativeSelectConfig = {
    customerRegion: {
        label: "Customer Region",
        options: [
            { value: "", label: "All Regions" },
            { value: "South", label: "South" },
            { value: "North", label: "North" },
            { value: "East", label: "East" },
            { value: "West", label: "West" },
            { value: "Central", label: "Central" }
        ]
    },
    gender: {
        label: "Gender",
        options: [
            { value: "", label: "All Gender" },
            { value: "Female", label: "Female" },
            { value: "Male", label: "Male" },
            { value: "Other", label: "Other" }
        ]
    },
    productCategory: {
        label: "Product Category",
        options: [
            { value: "", label: "All Categories" },
            { value: "Clothing", label: "Clothing" },
            { value: "Electronics", label: "Electronics" },
            { value: "Beauty", label: "Beauty" },
        ]
    },
    paymentMethod: {
        label: "Payment Method",
        options: [
            { value: "", label: "Payment Methods" },
            { value: "Cash", label: "Cash" },
            { value: "Credit Card", label: "Credit Card" },
            { value: "Debit Card", label: "Debit Card" },
            { value: "UPI", label: "UPI" },
            { value: "Net Banking", label: "Net Banking" },
            { value: "Wallet", label: "Wallet" },
        ]
    },
} as const;

const FilterBar = ({ filters, setFilters }: FilterBarProps) => {
    const updateFilter = (field: keyof FilterInterface, value: string) => {
        setFilters(prev => ({ ...prev, [field]: value || undefined, page: '1' }));
    };

    const renderSelect = (field: keyof typeof nativeSelectConfig, key: keyof FilterInterface) => {
        const config = nativeSelectConfig[field];
        const currentValue = filters[key as keyof FilterInterface] as string || '';

        return (
            <NativeSelect
                key={field}
                value={currentValue}
                onChange={(e) => updateFilter(key as keyof FilterInterface, e.target.value)}
            >
                {config.options.map((option) => (
                    <NativeSelectOption key={option.value} value={option.value}>
                        {option.label}
                    </NativeSelectOption>
                ))}
            </NativeSelect>
        );
    };

    return (
        <div className='w-full flex flex-col gap-3 px-3'>
            <div className='py-4 flex justify-between items-center'>
                <div className='flex gap-3 items-center'>
                    <button
                        className='p-3 bg-muted rounded-sm hover:bg-muted-foreground transition-colors'
                        onClick={() => setFilters({ page: '1' })}
                    >
                        <IoReload />
                    </button>

                    {renderSelect('customerRegion', 'customerRegion')}
                    {renderSelect('gender', 'gender')}
                    <AgeRange filters={filters} setFilters={setFilters}/>
                    

                    {renderSelect('productCategory', 'productCategory')}

                    <Tags filters={filters} setFilters={setFilters}/>

                    {renderSelect('paymentMethod', 'paymentMethod')}
                    <Calendar filters={filters} setFilters={setFilters}/>
                </div>

                <NativeSelect
                    value={`${filters.orderBy || 'customerName'}-${filters.orderByType || 'asc'}`}
                    onChange={(e) => {
                        const [orderBy, orderByType] = e.target.value.split('-');
                        setFilters(prev => ({
                            ...prev,
                            orderBy: orderBy as any,
                            orderByType: orderByType as any,
                            page: '1'
                        }));
                    }}
                >
                    <NativeSelectOption value="customerName-asc">Customer Name (A-Z)</NativeSelectOption>
                    <NativeSelectOption value="totalAmount-desc">Amount (High → Low)</NativeSelectOption>
                    <NativeSelectOption value="date-desc">Date (Newest)</NativeSelectOption>
                    <NativeSelectOption value="quantity-desc">Quantity (High → Low)</NativeSelectOption>
                </NativeSelect>
            </div>

            <div className='flex gap-3'>
                <div className='flex flex-col w-fit px-3 py-2 border-2 rounded-md'>
                    <div className='flex items-center gap-1 text-sm'>Total units sold <CiCircleInfo /></div>
                    <div className='text-base font-semibold'>10</div>
                </div>
                <div className='flex flex-col w-fit px-3 py-2 border-2 rounded-md'>
                    <div className='flex items-center gap-1 text-sm'>Total amount <CiCircleInfo /></div>
                    <div className='text-base font-semibold'>₹89,000</div>
                </div>
                <div className='flex flex-col w-fit px-3 py-2 border-2 rounded-md'>
                    <div className='flex items-center gap-1 text-sm'>Total Discount <CiCircleInfo /></div>
                    <div className='text-base font-semibold'>₹15,000</div>
                </div>
            </div>
        </div>
    )
}

export default FilterBar
