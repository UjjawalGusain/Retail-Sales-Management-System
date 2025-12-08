'use client'
import React from 'react'
import axios from 'axios'
import useSWR from 'swr'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from './ui/button'
import CopyButton from './TableView/CopyButton'
import { FilterInterface } from '@/app/page'
import { buildQueryString } from '@/utils/buildQueryString'
import type { TransactionsApiResponse, TransactionResponse } from '@/utils/types/queryResponse'
import Loading from '@/app/loading'
import ErrorPage from './TableView/ErrorPage'

interface TableViewProps {
  filters: FilterInterface;
  setFilters: React.Dispatch<React.SetStateAction<FilterInterface>>;
}

const API_BASE = 'https://retail-sales-management-system-back.vercel.app/api/query'
const fetcher = (url: string) => axios.get<TransactionsApiResponse>(url).then(res => res.data)

const TableView = ({ filters, setFilters }: TableViewProps) => {
  const queryString = buildQueryString(filters)
  const { data, error, isLoading } = useSWR(`${API_BASE}?${queryString}`, fetcher, {
    dedupingInterval: 1000,
    revalidateOnFocus: false,
    keepPreviousData: true
  })

  if (error) return <ErrorPage type="error" message='Failed to load transactions' onClear={() => setFilters({ page: '1' })}/>
  if (isLoading) return <div><Loading/></div>
  

  const transactions: TransactionResponse[] = data?.data || []
  const pagination = data?.pagination
  const currentPage = parseInt(filters.page || '1')
  const totalPages = pagination?.totalPages || 1

  if(transactions.length === 0) return <ErrorPage type="empty" message='No such transaction!' onClear={() => setFilters({ page: '1' })}/>

  const goToPage = (page: number) => {
    setFilters(prev => ({ ...prev, page: page.toString() }))
  }

  const getVisiblePages = () => {
    const maxVisible = 5
    const halfWindow = Math.floor((maxVisible - 1) / 2)
    
    let start = Math.max(1, currentPage - halfWindow)
    let end = Math.min(totalPages, currentPage + halfWindow)
    
    if (end - start + 1 < maxVisible) {
      if (start === 1) {
        end = Math.min(totalPages, maxVisible)
      } else {
        start = Math.max(1, totalPages - maxVisible + 1)
      }
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }

  const visiblePages = getVisiblePages()

  return (
    <div className='px-3 py-4'>
      <Table>
        <TableHeader className='bg-muted'>
          <TableRow>
            <TableHead>Transaction ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Customer ID</TableHead>
            <TableHead>Customer name</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Product Category</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Total Amount</TableHead>
            <TableHead>Customer region</TableHead>
            <TableHead>Product ID</TableHead>
            <TableHead>Employee name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.transactionId}>
              <TableCell className="font-medium">{transaction.transactionId}</TableCell>
              <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
              <TableCell>{transaction.customerId}</TableCell>
              <TableCell>{transaction.customer.customerName}</TableCell>
              <TableCell className='flex justify-start items-center'>
                {transaction.customer.phoneNumber} 
                <CopyButton text={transaction.customer.phoneNumber} />
              </TableCell>
              <TableCell>{transaction.customer.gender}</TableCell>
              <TableCell>{transaction.customer.age}</TableCell>
              <TableCell>{transaction.product.productCategory}</TableCell>
              <TableCell>{transaction.quantity}</TableCell>
              <TableCell className="text-right">₹{transaction.totalAmount.toLocaleString()}</TableCell>
              <TableCell>{transaction.customer.customerRegion}</TableCell>
              <TableCell>{transaction.productId || 'N/A'}</TableCell>
              <TableCell>{transaction.employeeName}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {pagination && totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={!pagination.hasPrev}
            className="p-2"
          >
            Previous
          </Button>

          {currentPage > 3 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(1)}
                className=""
              >
                1
              </Button>
              {currentPage > 4 && <span className="px-2 text-muted-foreground">...</span>}
            </>
          )}

          {visiblePages.map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => goToPage(page)}
              className="bg-black"
            >
              {page}
            </Button>
          ))}

          {currentPage < totalPages - 2 && (
            <>
              {currentPage < totalPages - 3 && <span className="px-2 text-muted-foreground">...</span>}
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(totalPages)}
                className=""
              >
                {totalPages}
              </Button>
            </>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={!pagination.hasNext}
            className=""
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}

export default TableView
