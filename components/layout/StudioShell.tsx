"use client"

import * as React from "react"
import Link from "next/link"
import { Image as ImageIcon, Video as VideoIcon, Settings, User, BookOpen, LayoutGrid } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { ImageStudio } from "@/components/studios/ImageStudio"
import { VideoStudio } from "@/components/studios/VideoStudio"

import { usePathname, useRouter } from "next/navigation"
import { useStudioStore } from "@/stores/useStudioStore"

export function StudioShell({ children }: { children?: React.ReactNode }) {
    const { currentProjectId } = useStudioStore()
    const [activeStudio, setActiveStudio] = React.useState<"image" | "video">("image")
    const pathname = usePathname()
    const router = useRouter()

    const isSettings = pathname === '/settings'
    const isGuide = pathname === '/guide'

    const handleStudioChange = (studio: "image" | "video") => {
        setActiveStudio(studio)
        if (isSettings || isGuide) {
            router.push('/')
        }
    }

    return (
        <div className="flex h-screen w-full bg-background text-foreground">
            {/* Left Navigation Rail */}
            <aside className="w-20 border-r flex flex-col items-center py-4 gap-4 bg-background z-50 relative">
                {/* Top: Logo */}
                <div className="font-bold tracking-widest text-xs mb-4">SYNTH</div>

                {/* Center: Logic Nav */}
                <div className="flex flex-col gap-2 flex-1 w-full px-2">
                    <Link href="/dashboard">
                        <Button
                            variant={pathname === '/dashboard' ? "secondary" : "ghost"}
                            size="icon"
                            className={cn(
                                "w-full h-12 rounded-xl transition-all",
                                pathname === '/dashboard' && "bg-primary text-primary-foreground shadow-md"
                            )}
                            title="Dashboard"
                        >
                            <LayoutGrid className="h-5 w-5" />
                        </Button>
                    </Link>

                    {currentProjectId && pathname !== '/dashboard' && (
                        <>
                            <div className="h-px bg-border my-2 mx-2" />

                            <Button
                                variant={(!isSettings && !isGuide && pathname !== '/dashboard' && activeStudio === "image") ? "secondary" : "ghost"}
                                size="icon"
                                className={cn(
                                    "w-full h-12 rounded-xl transition-all",
                                    !isSettings && !isGuide && pathname !== '/dashboard' && activeStudio === "image" && "bg-primary text-primary-foreground shadow-md"
                                )}
                                onClick={() => {
                                    if (pathname === '/dashboard') router.push('/')
                                    handleStudioChange("image")
                                }}
                            >
                                <ImageIcon className="h-5 w-5" />
                            </Button>

                            <Button
                                variant={(!isSettings && !isGuide && pathname !== '/dashboard' && activeStudio === "video") ? "secondary" : "ghost"}
                                size="icon"
                                className={cn(
                                    "w-full h-12 rounded-xl transition-all",
                                    !isSettings && !isGuide && pathname !== '/dashboard' && activeStudio === "video" && "bg-primary text-primary-foreground shadow-md"
                                )}
                                onClick={() => {
                                    if (pathname === '/dashboard') router.push('/')
                                    handleStudioChange("video")
                                }}
                            >
                                <VideoIcon className="h-5 w-5" />
                            </Button>
                        </>
                    )}
                </div>

                {/* Bottom: User & Settings */}
                <div className="flex flex-col gap-4 items-center mb-4">
                    <Link href="/guide">
                        <Button
                            variant={isGuide ? "secondary" : "ghost"}
                            size="icon"
                            className={cn(
                                "h-10 w-10 text-muted-foreground hover:text-foreground transition-all",
                                isGuide && "bg-secondary text-foreground shadow-sm"
                            )}
                            title="User Guide"
                        >
                            <BookOpen className="h-5 w-5" />
                        </Button>
                    </Link>
                    <Link href="/settings">
                        <Button
                            variant={isSettings ? "secondary" : "ghost"}
                            size="icon"
                            className={cn(
                                "h-10 w-10 text-muted-foreground hover:text-foreground transition-all",
                                isSettings && "bg-secondary text-foreground shadow-sm"
                            )}
                        >
                            <Settings className="h-5 w-5" />
                        </Button>
                    </Link>
                    <Avatar>
                        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                {children ? children : (activeStudio === "image" ? <ImageStudio /> : <VideoStudio />)}
            </main>
        </div>
    )
}
