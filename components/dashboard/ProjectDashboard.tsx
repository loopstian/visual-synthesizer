"use client"

import * as React from "react"
import { Plus, FolderOpen, Trash2, Clock, Sparkles, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useStudioStore } from "@/stores/useStudioStore"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export function ProjectDashboard() {
    const { 
        projects, 
        createProject, 
        loadProject, 
        deleteProject, 
        currentProjectId, 
        assets, 
        components, 
        addAsset,
        setMainSubject,
        addComponent,
        updateAssetAnalysis,
        setLabTextBlocks,
        setLabMode,
        setLabJsonNodes
    } = useStudioStore()
    const [newProjectName, setNewProjectName] = React.useState("")
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)
    const router = useRouter()

    const handleCreateProject = async () => {
        if (!newProjectName.trim()) return
        
        setIsLoading(true)
        try {
            createProject(newProjectName)

            if (newProjectName.toLowerCase() === "example") {
                await loadExampleAssets()
            }

            setNewProjectName("")
            setIsDialogOpen(false)
            router.push("/")
        } catch (error) {
            console.error("Error creating project:", error)
            setIsLoading(false)
        }
    }

    const loadExampleAssets = async () => {
        try {
            // Set dummy project data
            setMainSubject("Cyberpunk City Street at Night")
            
            // Mock Lab Data
            setLabMode('text')
            setLabTextBlocks([
                {
                    id: "block-1",
                    instruction: "Describe the lighting and atmosphere based on the provided keywords.",
                    sources: [
                        { id: "src-1", label: "Lighting", content: "Neon Lights, Volumetric Fog, Night" },
                        { id: "src-2", label: "Mood", content: "Cyberpunk, Moody, Cinematic" }
                    ],
                    generatedOutput: "The scene is bathed in the glow of neon lights cutting through the volumetric fog of a dark night, creating a moody, cinematic cyberpunk atmosphere."
                },
                {
                    id: "block-2",
                    instruction: "Describe the main subject and their appearance.",
                    sources: [
                        { id: "src-3", label: "Subject", content: "Futuristic City, Skyscrapers, Flying Cars" },
                        { id: "src-4", label: "Style", content: "Photorealistic, Unreal Engine 5, Detailed" }
                    ],
                    generatedOutput: "A futuristic city rises with towering skyscrapers and flying cars weaving between them, rendered in a detailed, photorealistic style reminiscent of Unreal Engine 5."
                }
            ])

            setLabJsonNodes([
                {
                    id: "root",
                    key: "root",
                    type: "object",
                    instruction: "Generate a cinematic shot definition",
                    children: [
                        {
                            id: "node-1",
                            key: "shot_config",
                            type: "object",
                            instruction: "Define camera and composition settings",
                            children: [
                                {
                                    id: "node-2",
                                    key: "camera_settings",
                                    type: "object",
                                    instruction: "Specify technical camera details",
                                    children: [
                                        {
                                            id: "node-3",
                                            key: "focal_length",
                                            type: "string",
                                            instruction: "Choose appropriate focal length",
                                            children: [],
                                            generatedOutput: "35mm"
                                        },
                                        {
                                            id: "node-4",
                                            key: "aperture",
                                            type: "string",
                                            instruction: "Set aperture for depth of field",
                                            children: [],
                                            generatedOutput: "f/2.8"
                                        }
                                    ],
                                    generatedOutput: null
                                },
                                {
                                    id: "node-5",
                                    key: "composition",
                                    type: "string",
                                    instruction: "Describe the framing and angle",
                                    children: [],
                                    generatedOutput: "Low angle shot looking up at the towering structures, emphasizing their scale."
                                }
                            ],
                            generatedOutput: null
                        },
                        {
                            id: "node-6",
                            key: "visual_elements",
                            type: "array",
                            instruction: "List key visual elements in the scene",
                            children: [
                                {
                                    id: "node-7",
                                    key: "element",
                                    type: "object",
                                    instruction: "Describe a single visual element",
                                    children: [
                                        {
                                            id: "node-8",
                                            key: "description",
                                            type: "string",
                                            instruction: "What is this element?",
                                            children: [],
                                            generatedOutput: "Neon signs reflecting on wet pavement"
                                        },
                                        {
                                            id: "node-9",
                                            key: "prominence",
                                            type: "string",
                                            instruction: "How prominent is it? (High/Medium/Low)",
                                            children: [],
                                            generatedOutput: "High"
                                        }
                                    ],
                                    generatedOutput: null
                                }
                            ],
                            generatedOutput: null
                        }
                    ],
                    generatedOutput: null
                }
            ])
            
            const { data, error } = await supabase
                .storage
                .from('uploads')
                .list('example', {
                    limit: 100,
                    offset: 0,
                    sortBy: { column: 'name', order: 'asc' },
                })

            if (data) {
                data.forEach((file, index) => {
                    if (file.name === '.emptyFolderPlaceholder') return

                    const { data: { publicUrl } } = supabase
                        .storage
                        .from('uploads')
                        .getPublicUrl(`example/${file.name}`)

                    const assetId = addAsset(publicUrl)

                    // Mark some images as analyzed (e.g., every other image)
                    if (index % 2 === 0) {
                        // Vary the data slightly based on index to make it look realistic
                        const variant = (index / 2) % 3;
                        
                        let analysisData = {};
                        
                        if (variant === 0) {
                            analysisData = {
                                "Subject": ["Futuristic City", "Skyscrapers", "Flying Cars"],
                                "Style": ["Cyberpunk", "Photorealistic", "Unreal Engine 5"],
                                "Lighting": ["Neon Lights", "Volumetric Fog", "Night"],
                                "Color": ["Cyan", "Magenta", "Dark Blue"]
                            };
                        } else if (variant === 1) {
                            analysisData = {
                                "Subject": ["Cybernetic Character", "Street Vendor", "Rainy Street"],
                                "Style": ["Digital Painting", "Concept Art", "Detailed"],
                                "Lighting": ["Cinematic", "Rim Lighting", "Moody"],
                                "Color": ["Purple", "Gold", "Black"]
                            };
                        } else {
                            analysisData = {
                                "Subject": ["Holographic Signs", "Crowded Market", "Tech Noir"],
                                "Style": ["Anime Style", "Cel Shaded", "Vibrant"],
                                "Lighting": ["Soft Glow", "Artificial Light", "Reflections"],
                                "Color": ["Red", "Green", "Neon Blue"]
                            };
                        }

                        updateAssetAnalysis(assetId, analysisData)
                    }
                })
            }
        } catch (error) {
            console.error("Error loading example assets:", error)
        }
    }

    const handleCreateExampleProject = async () => {
        setIsLoading(true)
        try {
            createProject("Example Project")
            await loadExampleAssets()
            router.push("/")
        } catch (error) {
            console.error("Error creating example project:", error)
            setIsLoading(false)
        }
    }

    const handleLoadProject = (id: string) => {
        loadProject(id)
        router.push("/")
    }

    const handleDeleteProject = (e: React.MouseEvent, id: string) => {
        e.stopPropagation()
        if (confirm("Are you sure you want to delete this project?")) {
            deleteProject(id)
        }
    }

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                    <p className="text-muted-foreground mt-1">Manage your creative projects</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="lg" className="gap-2">
                            <Plus className="h-4 w-4" />
                            New Project
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Project</DialogTitle>
                            <DialogDescription>
                                Give your project a name to get started.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Project Name</Label>
                                <Input
                                    id="name"
                                    value={newProjectName}
                                    onChange={(e) => setNewProjectName(e.target.value)}
                                    placeholder="My Awesome Project"
                                    onKeyDown={(e) => e.key === "Enter" && handleCreateProject()}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isLoading}>Cancel</Button>
                            <Button onClick={handleCreateProject} disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    "Create Project"
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed rounded-lg bg-muted/50">
                    <div className="flex flex-col items-center gap-2 text-center">
                        <FolderOpen className="h-12 w-12 text-muted-foreground/50" />
                        <h3 className="text-lg font-semibold">No projects yet</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            Create your first project to start organizing your assets and ideas.
                        </p>
                        <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                            Create Project
                        </Button>
                        <div className="relative flex py-2 items-center w-full max-w-xs">
                            <div className="flex-grow border-t border-muted-foreground/20"></div>
                            <span className="flex-shrink-0 mx-2 text-xs text-muted-foreground">OR</span>
                            <div className="flex-grow border-t border-muted-foreground/20"></div>
                        </div>
                        <Button variant="outline" className="gap-2" onClick={handleCreateExampleProject} disabled={isLoading}>
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Sparkles className="h-4 w-4 text-yellow-500" />
                            )}
                            Try Example Project
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.sort((a, b) => b.updatedAt - a.updatedAt).map((project) => {
                        const isCurrent = currentProjectId === project.id
                        const displayAssetsCount = isCurrent ? assets.length : project.assets.length
                        const displayComponentsCount = isCurrent ? components.length : project.components.length

                        return (
                            <Card 
                                key={project.id} 
                                className="group cursor-pointer hover:border-primary transition-colors relative overflow-hidden"
                                onClick={() => handleLoadProject(project.id)}
                            >
                                {isCurrent && (
                                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-bl">
                                        Active
                                    </div>
                                )}
                                <CardHeader>
                                    <CardTitle className="flex justify-between items-start">
                                        <span className="truncate pr-4">{project.name}</span>
                                    </CardTitle>
                                    <CardDescription>
                                        Last edited {formatDistanceToNow(project.updatedAt, { addSuffix: true })}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex gap-4 text-sm text-muted-foreground">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-foreground">{displayAssetsCount}</span>
                                            <span>Assets</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-foreground">{displayComponentsCount}</span>
                                            <span>Components</span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-muted/50 px-6 py-3 flex justify-between items-center">
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {new Date(project.updatedAt).toLocaleDateString()}
                                    </span>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => handleDeleteProject(e, project.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
