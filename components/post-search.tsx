"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PostSearchProps {
  onSearch: (searchTerm: string) => void
  onClear: () => void
  className?: string
}

export function PostSearch({ onSearch, onClear, className }: PostSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    if (value.trim()) {
      onSearch(value.trim())
    } else {
      onClear()
    }
  }

  const handleClear = () => {
    setSearchTerm("")
    onClear()
  }

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-charcoal-300" />
      <Input
        type="text"
        placeholder="猫の名前や翻訳内容で検索..."
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        className="pl-10 pr-10"
      />
      {searchTerm && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
          onClick={handleClear}
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  )
}












