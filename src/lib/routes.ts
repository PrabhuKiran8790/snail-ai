import Cog from "lucide-svelte/icons/cog";
import MessageCircle from "lucide-svelte/icons/message-circle";

import type { SvelteComponent, ComponentType } from "svelte";

type Route = {
  path: string;
  icon: ComponentType<SvelteComponent>;
  label: string;
  iconClass?: string;
};

export const routes = [
  {
    path: "/",
    icon: MessageCircle,
    label: "Chat",
    iconClass: "text-emerald-500",
  },
  {
    path: "/settings",
    icon: Cog,
    label: "Settings",
    iconClass: "text-sky-500 hover:animate-spin",
  },
];
