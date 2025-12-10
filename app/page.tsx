"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { StudioShell } from "@/components/layout/StudioShell"
import { useStudioStore } from "@/stores/useStudioStore"

export default function Home() {
  const { currentProjectId } = useStudioStore()
  const router = useRouter()

  useEffect(() => {
    // If no project is active, redirect to dashboard
    if (!currentProjectId) {
      router.push('/dashboard')
    }
  }, [currentProjectId, router])

  // If we're redirecting, don't render the studio
  if (!currentProjectId) {
    return null
  }

  return <StudioShell />
}
