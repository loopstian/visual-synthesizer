import { Block } from "./types";

export const MARKDOWN_TEMPLATE_BLOCKS: Block[] = [
    {
        id: "md-header",
        sources: [
            {
                id: "src-main",
                label: "Main Subject",
                content: "Sustainable Urban Living"
            }
        ],
        instruction: "Write a catchy H1 title about [Main Subject].",
        generatedOutput: "# Sustainable Urban Living: A Greener Future"
    },
    {
        id: "md-intro",
        sources: [
            {
                id: "src-keywords",
                label: "Keywords",
                content: "Eco-friendly, Renewable Energy, Community"
            }
        ],
        instruction: "Write an introduction paragraph using these [Keywords].",
        generatedOutput: "Embracing an **Eco-friendly** lifestyle is essential for modern cities. By integrating **Renewable Energy** sources, we can build a stronger, more resilient **Community** that thrives in harmony with nature."
    },
    {
        id: "md-details",
        sources: [
            {
                id: "src-comp",
                label: "Component: Solar Roof",
                content: "High-efficiency photovoltaic tiles"
            }
        ],
        instruction: "Describe the [Component: Solar Roof] and its benefits in a bulleted list.",
        generatedOutput: "- **High-efficiency**: Maximizes energy capture even on cloudy days.\n- **Photovoltaic tiles**: Seamlessly integrate with existing architecture."
    }
];

export const MOCK_MARKDOWN_PREVIEW = `# Sustainable Urban Living: A Greener Future

Embracing an **Eco-friendly** lifestyle is essential for modern cities. By integrating **Renewable Energy** sources, we can build a stronger, more resilient **Community** that thrives in harmony with nature.

- **High-efficiency**: Maximizes energy capture even on cloudy days.
- **Photovoltaic tiles**: Seamlessly integrate with existing architecture.`;

export const UNIVERSAL_TEMPLATE_BLOCKS: Block[] = [
    {
        id: "uni-headline",
        sources: [
            {
                id: "src-main",
                label: "Main Subject",
                content: "Sustainable Urban Living"
            }
        ],
        instruction: "Write a catchy headline for a newsletter about [Main Subject].",
        generatedOutput: "Future Cities: Living Sustainably with Solar Tech"
    },
    {
        id: "uni-body",
        sources: [
            {
                id: "src-comp",
                label: "Component: Solar Roof",
                content: "High-efficiency photovoltaic tiles"
            },
            {
                id: "src-keywords",
                label: "Keywords",
                content: "Eco-friendly, Renewable Energy"
            }
        ],
        instruction: "Write a short newsletter body introducing the [Component: Solar Roof]. Highlight that it is [Keywords].",
        generatedOutput: "We are excited to introduce our new Solar Roof tiles. These high-efficiency photovoltaic tiles are designed to make your home more eco-friendly while providing reliable renewable energy for your community."
    }
];

export const MOCK_UNIVERSAL_PREVIEW = UNIVERSAL_TEMPLATE_BLOCKS.map(block => block.generatedOutput || '').join('\n\n');
