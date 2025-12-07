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
  TableRow
} from "@/components/ui/table"
import CopyButton from './TableView/CopyButton'
import { FilterInterface } from '@/app/page'
import { buildQueryString } from '@/utils/buildQueryString'
import type { TransactionsApiResponse, TransactionResponse } from '@/utils/types/queryResponse'

interface TableViewProps {
  filters: FilterInterface;
}

const API_BASE = 'http://localhost:5000/api/query'
const fetcher = (url: string) => axios.get<TransactionsApiResponse>(url).then(res => res.data)

const TableView = ({ filters }: TableViewProps) => {
  const queryString = buildQueryString(filters)
  const { data, error, isLoading } = useSWR(`${API_BASE}?${queryString}`, fetcher)

  if (error) return <div>Error loading transactions</div>
  if (isLoading) return <div>Loading...</div>

  const transactions: TransactionResponse[] = data?.data || []

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
    </div>
  )
}

export default TableView
