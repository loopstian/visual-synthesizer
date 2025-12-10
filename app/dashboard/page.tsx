import { StudioShell } from "@/components/layout/StudioShell"
import { ProjectDashboard } from "@/components/dashboard/ProjectDashboard"

export default function DashboardPage() {
    return (
        <StudioShell>
            <ProjectDashboard />
        </StudioShell>
    )
}
