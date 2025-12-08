"use client"

import * as React from "react"
import { Trash } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface ImageMaskCanvasHandle {
    getMaskedImageBlob: () => Promise<Blob | null>
    hasMask: () => boolean
}

interface ImageMaskCanvasProps {
    imageSrc: string
    isDrawingEnabled: boolean
    onMaskChange?: (hasMask: boolean) => void
}

export const ImageMaskCanvas = React.forwardRef<ImageMaskCanvasHandle, ImageMaskCanvasProps>(
    ({ imageSrc, isDrawingEnabled, onMaskChange }, ref) => {
        const containerRef = React.useRef<HTMLDivElement>(null)
        const canvasRef = React.useRef<HTMLCanvasElement>(null)
        const imageRef = React.useRef<HTMLImageElement>(null)
        const [isDrawing, setIsDrawing] = React.useState(false)
        const [hasMask, setHasMask] = React.useState(false)
        const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 })

        // Initialize Canvas Size when image loads
        const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
            const img = e.currentTarget
            // IMPORTANT: Set canvas to match the DISPLAYED size of the image, 
            // but for resolution clarity, we could match natural size?
            // Prompt says: "ensure internal canvas width/height to match the *displayed* image size... to prevent blurry line"
            // Actually, if we match displayed size (clientWidth), we get 1:1 pixel mapping for mouse events.

            setDimensions({ width: img.clientWidth, height: img.clientHeight })

            // Reset canvas
            const canvas = canvasRef.current
            if (canvas) {
                canvas.width = img.clientWidth
                canvas.height = img.clientHeight
                const ctx = canvas.getContext('2d')
                if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
            }
        }

        // Handle Window Resize (simple observer could be better, but effect is okay for now)
        React.useEffect(() => {
            const handleResize = () => {
                if (imageRef.current && canvasRef.current) {
                    const img = imageRef.current
                    const canvas = canvasRef.current
                    // Note: Resizing clears the canvas. In a real app we might want to scale the paths.
                    // Keep dimensions sync.
                    setDimensions({ width: img.clientWidth, height: img.clientHeight })
                    canvas.width = img.clientWidth
                    canvas.height = img.clientHeight
                }
            }
            window.addEventListener('resize', handleResize)
            return () => window.removeEventListener('resize', handleResize)
        }, [])

        React.useImperativeHandle(ref, () => ({
            hasMask: () => hasMask,
            getMaskedImageBlob: async () => {
                if (!hasMask || !imageRef.current || !canvasRef.current) return null

                const sourceImg = imageRef.current
                const maskCanvas = canvasRef.current

                // Create a temporary canvas for the final composition
                const tempCanvas = document.createElement('canvas')
                // Use natural dimensions for highest quality
                tempCanvas.width = sourceImg.naturalWidth
                tempCanvas.height = sourceImg.naturalHeight
                const ctx = tempCanvas.getContext('2d')
                if (!ctx) return null

                // Drawing Strategy:
                // 1. Draw the mask onto the temp canvas, SCALING it from display size to natural size

                ctx.drawImage(maskCanvas, 0, 0, tempCanvas.width, tempCanvas.height)

                // Composite mode: Only keep source pixels where destination (mask) is non-transparent
                ctx.globalCompositeOperation = 'source-in'

                ctx.drawImage(sourceImg, 0, 0)

                return new Promise<Blob | null>(resolve => {
                    tempCanvas.toBlob(resolve, 'image/png')
                })
            }
        }))

        const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
            if (!isDrawingEnabled || !canvasRef.current) return
            setIsDrawing(true)

            const canvas = canvasRef.current
            const ctx = canvas.getContext('2d')
            if (!ctx) return

            const rect = canvas.getBoundingClientRect()
            const x = ('touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX) - rect.left
            const y = ('touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY) - rect.top

            ctx.beginPath()
            ctx.moveTo(x, y)
            ctx.lineCap = 'round'
            ctx.lineJoin = 'round'
            ctx.lineWidth = 10
            // Opaque Yellow for solid mask (alpha accumulation prevented)
            ctx.strokeStyle = '#FFE600'
        }

        const draw = (e: React.MouseEvent | React.TouchEvent) => {
            if (!isDrawing || !isDrawingEnabled || !canvasRef.current) return
            e.preventDefault() // Prevent scrolling on touch

            const canvas = canvasRef.current
            const ctx = canvas.getContext('2d')
            if (!ctx) return

            const rect = canvas.getBoundingClientRect()
            const x = ('touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX) - rect.left
            const y = ('touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY) - rect.top

            ctx.lineTo(x, y)
            ctx.stroke()

            if (!hasMask) {
                setHasMask(true)
                onMaskChange?.(true)
            }
        }

        const stopDrawing = () => {
            if (isDrawing) {
                setIsDrawing(false)
                const ctx = canvasRef.current?.getContext('2d')
                ctx?.closePath()
            }
        }

        const clearMask = () => {
            const canvas = canvasRef.current
            if (canvas) {
                const ctx = canvas.getContext('2d')
                if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
            }
            setHasMask(false)
            onMaskChange?.(false)
        }

        return (
            <div ref={containerRef} className="relative w-full h-full flex items-center justify-center bg-black/5 rounded-md overflow-hidden group">
                {/* Base Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {imageSrc && (
                    <img
                        ref={imageRef}
                        crossOrigin="anonymous"
                        src={imageSrc}
                        alt="Analysis Target"
                        className="max-w-full max-h-full object-contain select-none pointer-events-none z-0"
                        onLoad={handleImageLoad}
                    />
                )}

                {/* Dimming Layer */}
                <div className={`absolute inset-0 bg-black/60 z-10 pointer-events-none transition-opacity duration-300 ${isDrawingEnabled ? 'opacity-100' : 'opacity-0'}`} />

                {/* Canvas Overlay */}
                <canvas
                    ref={canvasRef}
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 touch-none z-20 opacity-40 ${isDrawingEnabled ? 'cursor-crosshair' : 'pointer-events-none'}`}
                    width={dimensions.width}
                    height={dimensions.height}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />

                {/* Clear Button */}
                {hasMask && isDrawingEnabled && (
                    <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 z-10 h-8 w-8 shadow-md"
                        onClick={clearMask}
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                )}
            </div>
        )
    }
)

ImageMaskCanvas.displayName = "ImageMaskCanvas"
