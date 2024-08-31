<script lang="ts">
  import { Markdown } from "carta-md";
  import { UserIcon, Trash, RotateCw, Copy, CopyCheck } from "lucide-svelte";
  import { cn, type Message } from "$lib/utils";
  import { Logo } from "$lib/components/icons";
  import { scrollToBottomAction } from "svelte-legos";
  import { isStreaming } from "$lib/stores";
  import ImageViewer from "./image-viewer.svelte";

  export let messages: Message[];
  export let isStreamingStarted: boolean;
  export let deleteAssistantMessage: (index: number) => void;
  export let regenerateMessage: (index: number) => void;
  export let carta: any;

  let isCopied = false;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    isCopied = true;
    setTimeout(() => {
      isCopied = false;
    }, 2000);
  };
</script>

<div
  class="flex-1 w-full p-4 overflow-y-scroll mb-36 mt-4"
  use:scrollToBottomAction
>
  <div class="flex flex-col xl:gap-3 2xl:gap-6 w-full p-2 pt-0">
    {#each messages as message, index}
      {#if message.role !== "system"}
        <div class="flex flex-col gap-2 pl-4 relative">
          <div
            class="absolute left-[6.5px] top-2.5 bottom-0 w-[1px] {message.role ===
            'assistant'
              ? 'bg-amber-200/30'
              : message.role === 'assistant-error'
                ? 'bg-red-500/30'
                : 'bg-secondary-foreground/30'}"
          ></div>
          <div class="flex gap-2 items-start">
            <div class="absolute left-[-7.5px] rounded-full p-0.5">
              {#if message.role === "user"}
                <UserIcon class="text-secondary-foreground h-6 w-6" />
              {:else if message.role === "assistant"}
                <Logo class="text-amber-200 h-6 w-6" />
              {:else if message.role === "assistant-error"}
                <Logo class="text-red-500 h-6 w-6" />
              {/if}
            </div>
            <div class="text-secondary-foreground w-full ml-4 relative">
              {#key message.content}
                <div
                  class={cn(
                    "flex flex-col gap-2 overflow-scroll",
                    message.role === "user"
                      ? "bg-secondary rounded-md -ml-2 p-2 -mr-4"
                      : ""
                  )}
                >
                  {#if message.role === "assistant"}
                    <Markdown value={message.content} {carta} />
                    {#if !$isStreaming}
                      <div class="flex w-full items-center justify-end">
                        <div
                          class="p-2 py-1 bg-zinc-800 rounded-lg flex items-center justify-between gap-2"
                        >
                          <button
                            class="p-1 hover:bg-zinc-600 rounded-md"
                            on:click={() => deleteAssistantMessage(index)}
                          >
                            <Trash class="size-3.5" />
                          </button>
                          <button
                            class="p-1 hover:bg-zinc-600 rounded-md"
                            on:click={() => regenerateMessage(index)}
                          >
                            <RotateCw class="size-3.5" />
                          </button>
                          <button
                            class="p-1 hover:bg-zinc-600 rounded-md"
                            on:click={() => {
                              copyToClipboard(message.content);
                            }}
                          >
                            {#if isCopied}
                              <CopyCheck class="size-3.5" />
                            {:else}
                              <Copy class="size-3.5" />
                            {/if}
                          </button>
                        </div>
                      </div>
                    {/if}
                  {:else if message.role === "assistant-error"}
                    <p class="text-red-500 p-1">{message.content}</p>
                  {:else if message.role === "user"}
                    {#if message.images && message.images.length > 0}
                      <div class="flex gap-2">
                        <ImageViewer base64String={message.images[0]} />
                      </div>
                    {/if}
                    <Markdown value={message.content} {carta} />
                  {/if}
                </div>
              {/key}
            </div>
          </div>
        </div>
      {/if}
    {/each}
    {#if isStreamingStarted}
      <div class="flex flex-col gap-2 pl-4 relative">
        <div
          class="absolute left-1.5 top-2.5 bottom-0 w-[1px] bg-amber-200/30"
        ></div>
        <div class="flex gap-2 items-start">
          <div class="absolute left-[-7.5px] rounded-full p-0.5">
            <Logo class="text-amber-200 h-6 w-6 animate-spin" />
          </div>
          <div class="text-secondary-foreground w-full ml-4">
            <div class="flex items-center gap-2">
              <span>Thinking...</span>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
