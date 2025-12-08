import { Asset, ComponentFolder } from "@/stores/useStudioStore"

interface StoreData {
    assets: Asset[]
    components: ComponentFolder[]
    // Add other needed store properties if any, but these are likely sufficient for now
    // We might need a way to access mainSubject if it's stored globally, 
    // but based on previous context, it might be passed in or we might need to handle it differently.
    // For now, let's assume 'mainSubject' is passed as part of a context or we might need to update the signature.
    // The prompt explicitly said: "Return storeData.mainSubject (or "Unknown Subject")."
    // However, mainSubject is currently local state in SynthesizerDrawer. 
    // Wait, the plan says "storeData.mainSubject". But we haven't promoted mainSubject to the store yet.
    // Re-reading previous requests/context: "Sync local input state with global store...". 
    // Actually, 'saveComponentPrompt' saves to `generatedPrompt` on components.
    // But `main_subject` variable usually refers to the main inputs.
    // Let's look at LabInventory.tsx again. It uses `{{main_subject}}` as a core variable.
    // In LabWorkspace, we don't have access to "mainSubject" from the store directly unless we persisted it or passed it.
    // But the prompt says "Return storeData.mainSubject". 
    // Let's assume for now we pass an object that *has* these properties.
}

// We'll define a slightly more flexible input type for storeData to accommodate the need for 'mainSubject'
// even if it's not strictly on the store interface yet, or we'll assume the caller composes this data.
export interface CompilationContext {
    assets: Asset[]
    components: ComponentFolder[]
    mainSubject?: string
}

export function compileString(template: string, data: CompilationContext): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
        const token = variable.trim() // e.g. "main_subject", "component:name", "colors"

        // 1. Core: main_subject
        if (token === 'main_subject') {
            return data.mainSubject || "Unknown Subject"
        }

        // 2. Component: component:name OR component:name:keywords
        if (token.startsWith('component:')) {
            // Check for keywords suffix
            const isKeywords = token.endsWith(':keywords')
            // Extract clean name key: remove prefix 'component:' and suffix ':keywords' if present
            let componentNameKey = token.replace('component:', '')
            if (isKeywords) {
                componentNameKey = componentNameKey.replace(':keywords', '')
            }
            componentNameKey = componentNameKey.toLowerCase()

            const component = data.components.find(c =>
                c.name.toLowerCase().replace(/\s+/g, '_') === componentNameKey
            )

            if (!component) return `[Missing Component: ${token}]`

            if (isKeywords) {
                // Aggregate keywords from linked assets
                const keywords = new Set<string>()
                data.assets.forEach(asset => {
                    if (asset.componentId === component.id && asset.analysisData) {
                        Object.values(asset.analysisData).forEach(values => {
                            values.forEach(v => keywords.add(v))
                        })
                    }
                })
                return keywords.size > 0 ? Array.from(keywords).join(", ") : ""
            } else {
                return component.generatedPrompt || ""
            }
        }

        // 3. Global Assets: colors, vibe, etc.
        // The token matches the key in usage (e.g. {{colors}} -> matches 'Colors' key in analysisData)
        // We need to find keys in analysisData that match the token (case-insensitive)

        // Aggregate values for this key across all assets
        const aggregatedValues = new Set<string>()

        data.assets.forEach(asset => {
            if (asset.analysisData) {
                Object.entries(asset.analysisData).forEach(([key, values]) => {
                    if (key.toLowerCase().replace(/\s+/g, '_') === token) {
                        values.forEach(v => aggregatedValues.add(v))
                    }
                })
            }
        })

        if (aggregatedValues.size > 0) {
            return Array.from(aggregatedValues).join(", ")
        }

        // If no match found, keep the token as is or return empty?
        // Usually keeping it helps debugging.
        return match
    })
}
