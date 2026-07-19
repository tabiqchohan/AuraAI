"use client"

import { useCallback, useMemo, useState } from "react"

type UsePaginationOptions = {
  totalItems: number
  itemsPerPage?: number
  initialPage?: number
  maxVisiblePages?: number
}

export function usePagination({
  totalItems,
  itemsPerPage = 12,
  initialPage = 1,
  maxVisiblePages = 5,
}: UsePaginationOptions) {
  const [currentPage, setCurrentPage] = useState(initialPage)

  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
  const safePage = Math.min(currentPage, totalPages)
  const from = (safePage - 1) * itemsPerPage
  const to = Math.min(safePage * itemsPerPage - 1, totalItems - 1)

  const pageNumbers = useMemo(() => {
    const pages: (number | "ellipsis")[] = []
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
      return pages
    }

    const leftSiblingIndex = Math.max(safePage - 1, 1)
    const rightSiblingIndex = Math.min(safePage + 1, totalPages)
    const showLeftEllipsis = leftSiblingIndex > 2
    const showRightEllipsis = rightSiblingIndex < totalPages - 1

    if (!showLeftEllipsis && showRightEllipsis) {
      for (let i = 1; i <= 3; i++) pages.push(i)
      pages.push("ellipsis")
      pages.push(totalPages)
    } else if (showLeftEllipsis && !showRightEllipsis) {
      pages.push(1)
      pages.push("ellipsis")
      for (let i = totalPages - 2; i <= totalPages; i++) pages.push(i)
    } else if (showLeftEllipsis && showRightEllipsis) {
      pages.push(1)
      pages.push("ellipsis")
      for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) pages.push(i)
      pages.push("ellipsis")
      pages.push(totalPages)
    }

    return pages
  }, [totalPages, safePage, maxVisiblePages])

  const goToPage = useCallback(
    (page: number) => {
      setCurrentPage(Math.max(1, Math.min(page, totalPages)))
    },
    [totalPages]
  )

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1)
  }, [currentPage, totalPages])

  const prevPage = useCallback(() => {
    if (currentPage > 1) setCurrentPage((p) => p - 1)
  }, [currentPage])

  const isFirstPage = currentPage === 1
  const isLastPage = currentPage === totalPages

  return {
    currentPage: safePage,
    totalPages,
    from,
    to,
    pageNumbers,
    isFirstPage,
    isLastPage,
    goToPage,
    nextPage,
    prevPage,
  }
}
