import React from 'react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter
} from "@/components/ui/table"
import CopyButton from './TableView/CopyButton'


const transactions = [
  {
    transactionId: 1234567,
    date: "2025-12-01",
    customerId: "CUST12016",
    customerName: "Neha Yadav",
    phoneNumber: "+91 9123456789",
    gender: "Female",
    age: 25,
    productCategory: "Clothing",
    quantity: 1,
    totalAmount: 1000,
    customerRegion: "South",
    productId: "PROD0001",
    employeeName: "Harsh Agarwal",
  },
  {
    transactionId: 1234568,
    date: "2025-12-02",
    customerId: "CUST12017",
    customerName: "Rahul Sharma",
    phoneNumber: "+91 9876543210",
    gender: "Male",
    age: 32,
    productCategory: "Electronics",
    quantity: 2,
    totalAmount: 25000,
    customerRegion: "North",
    productId: "PROD0002",
    employeeName: "Priya Singh",
  },
  {
    transactionId: 1234569,
    date: "2025-12-03",
    customerId: "CUST12018",
    customerName: "Aisha Khan",
    phoneNumber: "+91 8765432109",
    gender: "Female",
    age: 28,
    productCategory: "Books",
    quantity: 3,
    totalAmount: 750,
    customerRegion: "West",
    productId: "PROD0003",
    employeeName: "Vikram Desai",
  },
  {
    transactionId: 1234570,
    date: "2025-12-04",
    customerId: "CUST12019",
    customerName: "Arjun Patel",
    phoneNumber: "+91 7654321098",
    gender: "Male",
    age: 41,
    productCategory: "Home & Garden",
    quantity: 1,
    totalAmount: 3500,
    customerRegion: "East",
    productId: "PROD0004",
    employeeName: "Sneha Roy",
  },
  {
    transactionId: 1234571,
    date: "2025-12-05",
    customerId: "CUST12020",
    customerName: "Meera Joshi",
    phoneNumber: "+91 6543210987",
    gender: "Female",
    age: 19,
    productCategory: "Sports",
    quantity: 4,
    totalAmount: 8000,
    customerRegion: "South",
    productId: "PROD0005",
    employeeName: "Rohan Gupta",
  },
  {
    transactionId: 1234572,
    date: "2025-12-06",
    customerId: "CUST12021",
    customerName: "Karan Malhotra",
    phoneNumber: "+91 5432109876",
    gender: "Male",
    age: 35,
    productCategory: "Electronics",
    quantity: 1,
    totalAmount: 15000,
    customerRegion: "North",
    productId: "PROD0006",
    employeeName: "Anita Verma",
  },
  {
    transactionId: 1234573,
    date: "2025-12-07",
    customerId: "CUST12022",
    customerName: "Divya Nair",
    phoneNumber: "+91 4321098765",
    gender: "Female",
    age: 27,
    productCategory: "Clothing",
    quantity: 2,
    totalAmount: 2200,
    customerRegion: "West",
    productId: "PROD0007",
    employeeName: "Suresh Kumar",
  },
  {
    transactionId: 1234574,
    date: "2025-12-08",
    customerId: "CUST12023",
    customerName: "Vikash Reddy",
    phoneNumber: "+91 3210987654",
    gender: "Male",
    age: 29,
    productCategory: "Books",
    quantity: 5,
    totalAmount: 1250,
    customerRegion: "South",
    productId: "PROD0008",
    employeeName: "Lakshmi Menon",
  },
]


const TableView = () => {
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
              <TableCell>{transaction.date}</TableCell>
              <TableCell>{transaction.customerId}</TableCell>
              <TableCell>{transaction.customerName}</TableCell>
              <TableCell className=' flex justify-start items-center'>{transaction.phoneNumber} <CopyButton text={transaction.phoneNumber}/></TableCell>
              <TableCell>{transaction.gender}</TableCell>
              <TableCell>{transaction.age}</TableCell>
              <TableCell>{transaction.productCategory}</TableCell>
              <TableCell>{transaction.quantity}</TableCell>
              <TableCell className="text-right">₹{transaction.totalAmount.toLocaleString()}</TableCell>
              <TableCell>{transaction.customerRegion}</TableCell>
              <TableCell>{transaction.productId}</TableCell>
              <TableCell>{transaction.employeeName}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default TableView