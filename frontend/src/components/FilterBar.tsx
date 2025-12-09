import {
    NativeSelect,
    NativeSelectOption,
} from "@/components/ui/native-select"
import { IoReload } from "react-icons/io5";
import { CiCircleInfo } from "react-icons/ci";
import { FilterInterface, PaginationInterface } from '@/app/page';
import AgeRange from './FilterBar/AgeRange';
import Calendar from './FilterBar/Calendar';
import Tags from './FilterBar/Tags';
import { Checkbox } from './ui/checkbox';
import { Label } from "@/components/ui/label"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from 'lucide-react';

interface KpiMetrics {
    totalUnitsSold?: number;
    totalAmount?: number;
    totalDiscount?: number;
    salesRecords?: number;
    discountRecords?: number;
}

export interface FilterBarProps {
    filters: FilterInterface & PaginationInterface;
    setFilters: (updates: Partial<FilterInterface & PaginationInterface>) => void;
    kpis?: KpiMetrics | null;
    onResetKpis?: () => void;
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

type ArrayFilterKeys = 'customerRegion' | 'gender' | 'productCategory' | 'paymentMethod';

const FilterBar = ({ filters, setFilters, kpis, onResetKpis }: FilterBarProps) => {

    const resetAllFilters = () => {
        onResetKpis?.();
        setFilters({
            page: '1',
            limit: '10',
            customerRegion: undefined,
            gender: undefined,
            productCategory: undefined,
            paymentMethod: undefined,
            tags: undefined,
            customerNamePrefix: undefined,
            phonePrefix: undefined,
            minAge: undefined,
            maxAge: undefined,
            startDate: undefined,
            endDate: undefined,
            orderBy: 'customerName',
            orderByType: 'asc',
            forceHeavy: true,
        });

    };


    const renderSelect = (
        field: keyof typeof nativeSelectConfig,
        key: ArrayFilterKeys
    ) => {
        const config = nativeSelectConfig[field];
        const currentValues = (filters[key] as string[]) || [];

        const toggleValue = (value: string) => {
            console.log("toggleValue called with:", value);
            console.log("currentValues:", currentValues);

            const newValues = currentValues.includes(value)
                ? currentValues.filter(v => v !== value)
                : [...currentValues, value];

            console.log("newValues:", newValues);

            const updates = {
                [key]: newValues.length ? newValues : undefined,
                page: "1"
            };

            console.log("sending to setFilters:", updates);
            setFilters(updates);
            console.log("setFilters called");
        };


        return (
            <DropdownMenu>
                <DropdownMenuTrigger className="border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 dark:hover:bg-input/50 h-9 min-w-0 appearance-none rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed flex items-center justify-between gap-2">
                    {config.label || field} <ChevronDown className="size-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-52 max-h-48 overflow-y-auto p-2">
                    <div className="flex flex-col gap-2">
                        {config.options.map(option =>
                            option.value ? (
                                <div key={option.value} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`${field}-${option.value}`}
                                        checked={currentValues.includes(option.value)}
                                        onCheckedChange={() => toggleValue(option.value)}
                                    />
                                    <Label
                                        htmlFor={`${field}-${option.value}`}
                                        className="cursor-pointer text-sm hover:text-accent-foreground"
                                    >
                                        {option.label}
                                    </Label>
                                </div>
                            ) : null
                        )}
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    };

    return (
        <div className='w-full flex flex-col gap-3 px-3'>
            <div className='py-4 flex justify-between items-center'>
                <div className='flex gap-3 items-center'>
                    <button
                        type="button"
                        className="p-3 bg-muted rounded-sm hover:bg-muted-foreground transition-colors"
                        onClick={resetAllFilters}
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
                        setFilters({
                            orderBy: orderBy as any,
                            orderByType: orderByType as any
                        });
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
                        {kpis?.totalUnitsSold ?? '—'}
                    </div>
                </div>

                <div className='flex flex-col w-fit px-3 py-2 border-2 rounded-md'>
                    <div className='flex items-center gap-1 text-sm'>
                        Total amount <CiCircleInfo />
                    </div>
                    <div className='text-base font-semibold'>
                        ₹{Number(kpis?.totalAmount || 0).toLocaleString()} ({kpis?.salesRecords || 0} SRs)
                    </div>
                </div>

                <div className='flex flex-col w-fit px-3 py-2 border-2 rounded-md'>
                    <div className='flex items-center gap-1 text-sm'>
                        Total Discount <CiCircleInfo />
                    </div>
                    <div className='text-base font-semibold'>
                        ₹{Number(kpis?.totalDiscount || 0).toLocaleString()} ({kpis?.salesRecords || 0} SRs)
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FilterBar
