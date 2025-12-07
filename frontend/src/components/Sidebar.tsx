'use client'

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
} from "@/components/ui/sidebar"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Home, Inbox, Layers, FileText, CircleDot, Circle, Ban, CheckCircle2 } from "lucide-react"

export function AppSidebar() {
    return (
        <Sidebar>
            <SidebarHeader className="px-3 pt-3 pb-2">
                <Card className="rounded-none px-2 py-2">
                    <div className="flex gap-1 items-center">
                        <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                            V
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold leading-tight">Vault</span>
                            <span className="text-xs text-muted-foreground leading-tight">Anurag Yadav</span>
                        </div>
                    </div>
                </Card>

            </SidebarHeader>

            <SidebarContent className="px-3 pb-3">
                <SidebarGroup className="">
                    <SidebarGroupContent>
                        <SidebarItem icon={Home} label="Dashboard" active />
                        <SidebarItem icon={Layers} label="Nexus" />
                        <SidebarItem icon={Inbox} label="Intake" />
                    </SidebarGroupContent>
                </SidebarGroup>

                <Card className="border border-sidebar-border bg-sidebar">
                    <SidebarGroup>
                        <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground">
                            Services
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarItem icon={CircleDot} label="Pre-active" />
                            <SidebarItem icon={Circle} label="Active" />
                            <SidebarItem icon={Ban} label="Blocked" />
                            <SidebarItem icon={CheckCircle2} label="Closed" />
                        </SidebarGroupContent>
                    </SidebarGroup>
                </Card>

                <Card className="border border-sidebar-border bg-sidebar">
                    <SidebarGroup>
                        <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground">
                            Invoices
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarItem icon={FileText} label="Proforma Invoices" active />
                            <SidebarItem icon={FileText} label="Final Invoices" />
                        </SidebarGroupContent>
                    </SidebarGroup>
                </Card>
            </SidebarContent>

        </Sidebar>
    )
}

interface SidebarItemProps {
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
    label: string
    active?: boolean
}

function SidebarItem({ icon: Icon, label, active }: SidebarItemProps) {
    return (
        <button
            className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm",
                "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                active && "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
            )}
        >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{label}</span>
        </button>
    )
}
