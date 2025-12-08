import React from 'react'
import useSWR from 'swr'
import {
    NativeSelect,
    NativeSelectOption,
} from "@/components/ui/native-select"
import { IoReload } from "react-icons/io5";
import { CiCircleInfo } from "react-icons/ci";
import { FilterInterface } from '@/app/page';
import AgeRange from './FilterBar/AgeRange';
import Calendar from './FilterBar/Calendar';
import Tags from './FilterBar/Tags';
import {buildKPIQueryString} from "./../utils/buildQueryString"

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

const BASE_API_URL = "https://retail-sales-management-system-back.vercel.app";

const fetcher = (url: string) =>
    fetch(url).then((r) => {
        if (!r.ok) throw new Error("Failed to fetch");
        return r.json();
    });

const FilterBar = ({ filters, setFilters }: FilterBarProps) => {
    const qs = buildKPIQueryString(filters);

    const { data: unitsData } = useSWR(
        `${BASE_API_URL}/api/query/totalUnits?${qs}`,
        fetcher
    );

    const { data: amountData } = useSWR(
        `${BASE_API_URL}/api/query/totalAmount?${qs}`,
        fetcher
    );

    const { data: discountData } = useSWR(
        `${BASE_API_URL}/api/query/totalDiscount?${qs}`,
        fetcher
    );

    const updateFilter = (field: keyof FilterInterface, value: string) => {
        setFilters(prev => ({
            ...prev,
            [field]: value || undefined,
            page: '1'
        }));
    };

    const renderSelect = (field: keyof typeof nativeSelectConfig, key: keyof FilterInterface) => {
        const config = nativeSelectConfig[field];
        const currentValue = filters[key] || '';

        return (
            <NativeSelect
                key={field}
                value={currentValue}
                onChange={(e) => updateFilter(key, e.target.value)}
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

                    <AgeRange filters={filters} setFilters={setFilters} />
                    {renderSelect('productCategory', 'productCategory')}

                    <Tags filters={filters} setFilters={setFilters} />
                    {renderSelect('paymentMethod', 'paymentMethod')}

                    <Calendar filters={filters} setFilters={setFilters} />
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
                    <div className='flex items-center gap-1 text-sm'>
                        Total units sold <CiCircleInfo />
                    </div>
                    <div className='text-base font-semibold'>
                        {unitsData?.totalUnitsSold ?? '—'}
                    </div>
                </div>

                <div className='flex flex-col w-fit px-3 py-2 border-2 rounded-md'>
                    <div className='flex items-center gap-1 text-sm'>
                        Total amount <CiCircleInfo />
                    </div>
                    <div className='text-base font-semibold'>
                        ₹{Number(amountData?.totalAmount || 0).toLocaleString()} ({amountData?.salesRecords || 0} SRs)
                    </div>
                </div>

                <div className='flex flex-col w-fit px-3 py-2 border-2 rounded-md'>
                    <div className='flex items-center gap-1 text-sm'>
                        Total Discount <CiCircleInfo />
                    </div>
                    <div className='text-base font-semibold'>
                        ₹{Number(discountData?.totalDiscount || 0).toLocaleString()} ({discountData?.discountRecords || 0} SRs)
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FilterBar
