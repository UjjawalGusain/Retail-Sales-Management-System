'use client'
import { AlertCircle, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorPageProps {
  message: string
  type: 'error' | 'empty'
  onClear: () => void
}

export default function ErrorPage({ message, type = 'error' }: ErrorPageProps) {
  const isError = type === 'error'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${isError ? 'bg-destructive/10 text-destructive' : 'bg-accent-foreground/10 text-accent-foreground'}`}>
        {isError ? (
          <AlertCircle className="w-12 h-12" />
        ) : (
          <AlertTriangle className="w-12 h-12" />
        )}
      </div>

      <h1 className={`text-3xl font-bold mb-4 ${isError ? 'text-foreground' : 'text-accent-foreground'}`}>
        {isError ? 'Something went wrong' : 'No results found'}
      </h1>

      <p className="text-lg mb-8 max-w-md mx-auto">
        {message}
      </p>
    </div>
  )
}
