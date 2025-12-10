import { StudioShell } from "@/components/layout/StudioShell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
    Image, Layers, Beaker, Cpu, FileJson, Type, LayoutTemplate, 
    Brush, GitMerge, Workflow, Info, Lightbulb, ArrowRight,
    Plus, Play, Sparkles, Pencil, Trash, ChevronRight
} from "lucide-react"

export default function GuidePage() {
  return (
    <StudioShell>
      <div className="max-w-5xl mx-auto py-10 px-6">
        <div className="mb-10">
            <h1 className="text-4xl font-bold mb-3">User Guide</h1>
            <p className="text-muted-foreground text-xl">Master the Visual Synthesizer workflow.</p>
        </div>

        <Tabs defaultValue="workspaces" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8 h-auto p-1">
                <TabsTrigger value="workspaces" className="py-3">Workspaces</TabsTrigger>
                <TabsTrigger value="lab" className="py-3">The Lab</TabsTrigger>
                <TabsTrigger value="workflows" className="py-3">Workflows</TabsTrigger>
                <TabsTrigger value="settings" className="py-3">Settings</TabsTrigger>
            </TabsList>

            {/* WORKSPACES TAB */}
            <TabsContent value="workspaces" className="space-y-8">
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="col-span-2">
                        <CardHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Image className="h-6 w-6 text-primary" />
                                </div>
                                <CardTitle>The Studio (Data Collection)</CardTitle>
                            </div>
                            <CardDescription>
                                The starting point for all visual analysis. Upload images to extract their DNA.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="border rounded-lg p-4">
                                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                                        <Brush className="h-4 w-4" /> Focus Brush (Masking)
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Don't analyze the whole image if you don't need to. Use the Focus Brush to paint over specific areas (e.g., a character's face, a texture) to isolate the analysis to just that region.
                                    </p>
                                </div>
                                <div className="border rounded-lg p-4">
                                    <h3 className="font-semibold mb-2">Multi-Tone Analysis</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Use "Extraction Groups" to define specific strategies. Instead of a generic analysis, ask the AI to specifically target "Color Palette", "Lighting Setup", or "Emotional Vibe".
                                    </p>
                                </div>
                                <div className="col-span-2 border rounded-lg p-4 bg-primary/5 border-primary/20">
                                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                                        <Cpu className="h-4 w-4 text-primary" /> AI Vision Engine
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        The Studio uses advanced computer vision models to "see" your images. When you use the <strong>Focus Brush</strong>, you are literally guiding the AI's attention mechanism to specific pixels. This ensures the extracted data (variables) is derived <em>only</em> from the area you care about, filtering out visual noise.
                                    </p>
                                </div>
                            </div>
                            
                            <Alert>
                                <Lightbulb className="h-4 w-4" />
                                <AlertTitle>Pro Tip</AlertTitle>
                                <AlertDescription>
                                    Analyzed variables are automatically saved to your inventory. Give them descriptive names so you can easily find them in The Lab later.
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>

                    <Card className="col-span-2">
                        <CardHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Layers className="h-6 w-6 text-primary" />
                                </div>
                                <CardTitle>Components (Divide & Conquer)</CardTitle>
                            </div>
                            <CardDescription>
                                Manage complex projects by breaking them down into smaller pieces.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                Don't overwhelm the AI with one massive prompt. Create <strong>Components</strong> (folders) to manage specific parts of your project independently.
                            </p>
                            <div className="bg-muted p-4 rounded-lg">
                                <h4 className="font-medium mb-2">Component Workflow:</h4>
                                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                                    <li>Create a component (e.g., "Cyberpunk City Background").</li>
                                    <li>Upload reference images specific to that component.</li>
                                    <li>Analyze and refine variables within the component scope.</li>
                                    <li>Sync the refined component back to your Main Project.</li>
                                </ol>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>

            {/* THE LAB TAB */}
            <TabsContent value="lab" className="space-y-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold mb-2">Prompt Engineering IDE</h2>
                    <p className="text-muted-foreground">
                        The Lab is where you craft, test, and refine your prompts using advanced tools.
                    </p>
                </div>

                <Tabs defaultValue="general" className="w-full">
                    <TabsList className="w-full justify-start mb-6 bg-transparent p-0 border-b rounded-none h-auto">
                        <TabsTrigger value="general" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2">General</TabsTrigger>
                        <TabsTrigger value="text" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2">Text Mode</TabsTrigger>
                        <TabsTrigger value="json" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2">JSON Mode</TabsTrigger>
                    </TabsList>

                    <TabsContent value="general">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <LayoutTemplate className="h-6 w-6 text-primary" />
                                    </div>
                                    <CardTitle>Interface Overview</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <h3 className="font-semibold text-primary">1. Inventory (Left)</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Your library of variables, assets, and saved snippets. Drag and drop items directly into your editor.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="font-semibold text-primary">2. Editor (Center)</h3>
                                        <p className="text-sm text-muted-foreground">
                                            The main workspace. Switch between Text Mode for narratives and JSON Mode for structured data.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="font-semibold text-primary">3. Workspace (Right)</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Real-time preview. Run tests, see AI outputs, and debug your prompt logic instantly.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="mt-6 border-primary/20 bg-primary/5">
                            <CardHeader>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-background rounded-lg border">
                                        <Cpu className="h-6 w-6 text-primary" />
                                    </div>
                                    <CardTitle>Context-Aware Generation</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    The Lab doesn't just fill in blanks like a template. It uses a Large Language Model (LLM) to understand the <em>semantic context</em> of your variables.
                                </p>
                                <ul className="list-disc pl-6 mt-4 space-y-2 text-muted-foreground">
                                    <li><strong>Conflict Resolution:</strong> If you inject a "gloomy" texture variable into a "happy" prompt, the AI will attempt to reconcile the mood or describe the contrast intelligently.</li>
                                    <li><strong>Style Transfer:</strong> The AI adopts the writing style defined in your instructions, ensuring your generated prompts sound professional and consistent.</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="text">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Type className="h-6 w-6 text-primary" />
                                    </div>
                                    <CardTitle>Universal Text Mode</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="font-semibold mb-2">The "Block" Concept</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Text Mode isn't just a text box. It's built of intelligent blocks that transform data.
                                    </p>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="bg-muted p-3 rounded border">
                                            <span className="text-xs font-bold uppercase text-muted-foreground">Source</span>
                                            <p className="text-sm mt-1">The raw material (e.g., a variable <code>{`{{colors}}`}</code>).</p>
                                        </div>
                                        <div className="flex items-center justify-center">
                                            <ArrowRight className="text-muted-foreground" />
                                        </div>
                                        <div className="bg-muted p-3 rounded border">
                                            <span className="text-xs font-bold uppercase text-muted-foreground">Instruction</span>
                                            <p className="text-sm mt-1">The rule (e.g., "Describe this poetically").</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-6">
                                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                                        <GitMerge className="h-4 w-4" /> Assembly
                                    </h3>
                                    <p className="text-muted-foreground mb-4">
                                        Use the <strong>Assemble Final Paragraph</strong> feature to stitch your generated segments together into a cohesive narrative.
                                    </p>
                                    <div className="bg-muted p-4 rounded-md text-sm font-mono">
                                        "A cinematic shot of a <span className="text-primary">{`{{character}}`}</span> standing in a <span className="text-primary">{`{{environment}}`}</span>..."
                                    </div>
                                </div>

                                <div className="border-t pt-6">
                                    <h3 className="font-semibold mb-4">Button Reference</h3>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-muted rounded border">
                                                <Plus className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">Add Text Block</p>
                                                <p className="text-xs text-muted-foreground">Creates a new empty block for you to configure.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-muted rounded border">
                                                <Plus className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">Add Source</p>
                                                <p className="text-xs text-muted-foreground">Injects a new variable slot into the block (e.g., for "Colors" or "Texture").</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-muted rounded border">
                                                <Play className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">Generate Segment</p>
                                                <p className="text-xs text-muted-foreground">Runs the AI on just this specific block to create a text snippet.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-muted rounded border">
                                                <Sparkles className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">Assemble Final Paragraph</p>
                                                <p className="text-xs text-muted-foreground">Combines all your generated segments into one final output.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-muted rounded border">
                                                <Pencil className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">Edit</p>
                                                <p className="text-xs text-muted-foreground">Unlocks a generated block so you can tweak the sources or instructions again.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="json">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <FileJson className="h-6 w-6 text-primary" />
                                    </div>
                                    <CardTitle>Structured JSON Mode</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="font-semibold mb-2">The Schema Builder</h3>
                                    <p className="text-muted-foreground mb-4">
                                        JSON Mode allows you to construct complex data structures where <strong>each field</strong> can be independently generated by AI.
                                    </p>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="border rounded-lg p-4 bg-muted/20">
                                            <h4 className="font-medium text-sm mb-2">1. Define Structure</h4>
                                            <p className="text-xs text-muted-foreground">
                                                Use <strong>Objects</strong> and <strong>Arrays</strong> to build the skeleton of your JSON.
                                            </p>
                                            <pre className="mt-2 bg-background p-2 rounded text-xs font-mono text-muted-foreground">
{`{
  "character": { ... },
  "items": [ ... ]
}`}
                                            </pre>
                                        </div>
                                        <div className="border rounded-lg p-4 bg-muted/20">
                                            <h4 className="font-medium text-sm mb-2">2. Define Leaves (Strings)</h4>
                                            <p className="text-xs text-muted-foreground">
                                                <strong>String</strong> nodes are where the magic happens. Each string node has its own <strong>Sources</strong> and <strong>Instruction</strong>.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-6">
                                    <h3 className="font-semibold mb-4">Button Reference</h3>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-muted rounded border">
                                                <Plus className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">Add Key / Item</p>
                                                <p className="text-xs text-muted-foreground">Adds a new node to your current object or array.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-muted rounded border">
                                                <ChevronRight className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">Expand / Collapse</p>
                                                <p className="text-xs text-muted-foreground">Toggle visibility of nested objects and arrays.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-muted rounded border">
                                                <Play className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">Generate Value</p>
                                                <p className="text-xs text-muted-foreground">Runs the AI for <strong>that specific field only</strong>.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-muted rounded border">
                                                <Trash className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">Delete Node</p>
                                                <p className="text-xs text-muted-foreground">Removes the key and all its children.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <Alert>
                                    <Lightbulb className="h-4 w-4" />
                                    <AlertTitle>Workflow Tip</AlertTitle>
                                    <AlertDescription>
                                        You can pass different variables to different keys. For example, pass <code>{`{{face_analysis}}`}</code> to the "appearance" key, but <code>{`{{clothing_analysis}}`}</code> to the "outfit" key.
                                    </AlertDescription>
                                </Alert>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </TabsContent>

            {/* WORKFLOWS TAB */}
            <TabsContent value="workflows">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Workflow className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle>Workflow: From Image to Prompt</CardTitle>
                        </div>
                        <CardDescription>
                            A step-by-step guide to connecting The Studio and The Lab.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative border-l-2 border-muted ml-3 space-y-8 pb-2">
                            <div className="ml-6 relative">
                                <span className="absolute -left-[33px] top-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground ring-4 ring-background">1</span>
                                <h3 className="font-semibold text-lg">Upload & Analyze</h3>
                                <p className="text-muted-foreground mt-1">
                                    Go to <strong>The Studio</strong>. Upload your reference image. Use the Focus Brush to highlight the key element you want to capture.
                                </p>
                            </div>
                            <div className="ml-6 relative">
                                <span className="absolute -left-[33px] top-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground ring-4 ring-background">2</span>
                                <h3 className="font-semibold text-lg">Save Variable</h3>
                                <p className="text-muted-foreground mt-1">
                                    Run the analysis. When the result appears, save it as a variable (e.g., <code>my_texture</code>). It is now in your global inventory.
                                </p>
                            </div>
                            <div className="ml-6 relative">
                                <span className="absolute -left-[33px] top-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground ring-4 ring-background">3</span>
                                <h3 className="font-semibold text-lg">Inject in Lab</h3>
                                <p className="text-muted-foreground mt-1">
                                    Switch to <strong>The Lab</strong>. Open the Inventory sidebar. Drag your <code>my_texture</code> variable into a Text Block.
                                </p>
                            </div>
                            <div className="ml-6 relative">
                                <span className="absolute -left-[33px] top-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground ring-4 ring-background">4</span>
                                <h3 className="font-semibold text-lg">Generate</h3>
                                <p className="text-muted-foreground mt-1">
                                    Add an instruction (e.g., "Describe this texture for a 3D render"). Click Generate to create a unique prompt based on your image data.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* SETTINGS TAB */}
            <TabsContent value="settings">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Cpu className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle>System Intelligence</CardTitle>
                        </div>
                        <CardDescription>
                            Configure the brain behind the operation.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                            Customize the AI personas. If you want the 'Visual Analyst' to be more poetic or technical, edit the System Prompts in Settings.
                        </p>
                        <Alert variant="default">
                            <Info className="h-4 w-4" />
                            <AlertTitle>Note</AlertTitle>
                            <AlertDescription>
                                Changes to system prompts affect all future analyses and generations. Existing variables remain unchanged.
                            </AlertDescription>
                        </Alert>
                        
                        <div className="border rounded-lg p-4 bg-primary/5 border-primary/20 mt-4">
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                <Cpu className="h-4 w-4 text-primary" /> Persona Configuration
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                You are the director; the AI is the actor. By editing the System Prompts, you define the "role" the AI plays.
                            </p>
                            <div className="mt-4 bg-background p-3 rounded border text-xs font-mono text-muted-foreground">
                                <span className="text-primary font-bold">Example:</span> Change the prompt from "You are a technical analyst" to "You are a poetic art critic" to get vastly different descriptions from the exact same image.
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      </div>
    </StudioShell>
  )
}
