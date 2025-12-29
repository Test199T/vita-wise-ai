import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { featureLinks, workflowLinks } from "@/components/nav-links";
import { LinkItem } from "@/components/link-item";

export function DesktopNav() {
    return (
        <NavigationMenu className="hidden md:flex">
            <NavigationMenuList className="gap-0.5">
                <NavigationMenuItem>
                    <NavigationMenuTrigger className="h-8 px-3 text-xs font-medium text-slate-600 bg-transparent hover:bg-slate-50 hover:text-slate-900 focus:bg-slate-50 focus:text-slate-900 data-[state=open]:bg-slate-50 data-[state=open]:text-slate-900 rounded-md transition-all duration-150 ease-out">
                        ฟีเจอร์
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="bg-white border border-slate-200/60 shadow-xl rounded-xl p-4 mt-2">
                        <div className="grid w-[420px] gap-2 md:w-[520px] md:grid-cols-2">
                            {featureLinks.map((item, i) => (
                                <NavigationMenuLink
                                    asChild
                                    key={`feature-${item.label}-${i}`}
                                >
                                    <LinkItem {...item} />
                                </NavigationMenuLink>
                            ))}
                        </div>
                    </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                    <NavigationMenuTrigger className="h-8 px-3 text-xs font-medium text-slate-600 bg-transparent hover:bg-slate-50 hover:text-slate-900 focus:bg-slate-50 focus:text-slate-900 data-[state=open]:bg-slate-50 data-[state=open]:text-slate-900 rounded-md transition-all duration-150 ease-out">
                        การทำงาน
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="bg-white border border-slate-200/60 shadow-xl rounded-xl p-4 mt-2">
                        <div className="grid w-[420px] gap-2 md:w-[520px] md:grid-cols-2">
                            {workflowLinks.map((item, i) => (
                                <NavigationMenuLink
                                    asChild
                                    key={`workflow-${item.label}-${i}`}
                                >
                                    <LinkItem {...item} />
                                </NavigationMenuLink>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <p className="text-xs text-slate-500">
                                สนใจ?{" "}
                                <a
                                    className="font-semibold text-slate-900 hover:text-accent transition-colors"
                                    href="/register"
                                >
                                    เริ่มต้นใช้งานฟรี
                                </a>
                            </p>
                        </div>
                    </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                        <a
                            className="h-8 px-3 text-xs font-medium text-slate-600 bg-transparent hover:bg-slate-50 hover:text-slate-900 rounded-md transition-all duration-150 ease-out flex items-center"
                            href="#pricing"
                        >
                            ราคา
                        </a>
                    </NavigationMenuLink>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    );
}
