<script>
  import { page } from "$app/stores";
  import { routes } from "$lib/routes";
  import { cn } from "$lib/utils";
  import { Logo } from "../icons";
</script>

<div class="bg-secondary/50 flex flex-col h-full w-20 border-r py-2">
  <div class="flex flex-col gap-2 px-2">
    <div class="flex flex-col items-center gap-2 p-2">
      <Logo class="size-9" />
    </div>
    {#each routes as route}
      <a
        href={route.path}
        class={cn(
          "flex flex-col items-center gap-2 rounded-md p-2 hover:bg-muted",
          route.path === $page.url.pathname ||
            route.path === `/${$page.url.pathname.split("/")[1]}`
            ? "bg-muted"
            : "hover:bg-secondary/50"
        )}
      >
        <svelte:component this={route.icon} class={route.iconClass} />
        <span class="text-xs text-secondary-foreground/80">{route.label}</span>
      </a>
    {/each}
  </div>
</div>
