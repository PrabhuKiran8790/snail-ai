<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { textareaAutosizeAction } from "svelte-legos";
  import { isStreaming, modelSelectorOpen, selectedModel } from "$lib/stores";
  import ModelSelector from "./model_selector.svelte";
  import { ChevronsUpDownIcon, Paperclip } from "lucide-svelte";
  import ImageSelector from "./image-selector.svelte";
  import OpenAI from "openai";
  import type { Stream } from "groq-sdk/lib/streaming.mjs";
  import * as Dialog from "$lib/components/ui/dialog";
  import Groq from "groq-sdk";
  import type { Stream as OpenAIStream } from "openai/streaming.mjs";

  export let userPrompt: string;
  export let handleSubmit: () => void;
  export let textarea: HTMLTextAreaElement;
  export let response:
    | Stream<Groq.Chat.Completions.ChatCompletionChunk>
    | OpenAIStream<OpenAI.Chat.Completions.ChatCompletionChunk>;
  export let uploadedImageSrc: string = "";

  function handleKeydown(event: KeyboardEvent) {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      (!$selectedModel ||
        $selectedModel.length === 0 ||
        !$isStreaming ||
        !userPrompt.length)
    ) {
      event.preventDefault();
      handleSubmit();
    }
  }

  function openFileDialog(): void {
    const fileInput: HTMLInputElement = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.onchange = handleFileSelect;
    fileInput.click();
  }

  function handleFileSelect(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = target.files;

    if (files && files.length > 0) {
      const file: File = files[0];
      if (file && file.type.startsWith("image/")) {
        const reader: FileReader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          if (e.target && typeof e.target.result === "string") {
            uploadedImageSrc = e.target.result;
            console.log("Uploaded image src:", uploadedImageSrc);
          }
        };
        reader.readAsDataURL(file);
      } else {
        alert("Please select an image file.");
      }
    }

    target.remove();
  }
</script>

<div class="w-full pl-4 absolute bottom-0 pt-4 flex flex-col gap-4">
  <div
    class="flex flex-col gap-4 border rounded-lg rounded-b-none w-full bg-[#1F1F1F] p-2"
  >
    <textarea
      use:textareaAutosizeAction
      bind:this={textarea}
      bind:value={userPrompt}
      on:keydown={handleKeydown}
      placeholder="Type your message here..."
      class="min-h-[40px] p-0 resize-none w-full h-full bg-transparent outline-none ring-0 border-0 max-h-[200px]"
    />
    {#if uploadedImageSrc}
      <ImageSelector bind:uploadedImageSrc />
    {/if}
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-4">
        <Button
          variant="outline"
          class="flex items-center justify-between gap-4 bg-accent"
          on:click={() => {
            $modelSelectorOpen = !$modelSelectorOpen;
          }}
        >
          <p>{$selectedModel ? $selectedModel : "Select Model"}</p>
          <ChevronsUpDownIcon size="16" />
        </Button>
        <Button variant="outline" class="px-2" on:click={openFileDialog}
          ><Paperclip size="16" /></Button
        >
      </div>
      {#if !$isStreaming}
        <Button
          variant="outline"
          on:click={handleSubmit}
          disabled={!$selectedModel ||
            $selectedModel.length === 0 ||
            $isStreaming ||
            !userPrompt.length}
        >
          Send
        </Button>
      {:else}
        <Button
          variant="outline"
          on:click={() => {
            if (response) {
              response.controller.abort();
            }
          }}
        >
          Stop
        </Button>
      {/if}
    </div>
  </div>
</div>

<Dialog.Root bind:open={$modelSelectorOpen}>
  <Dialog.Content
    class="bg-secondary/60 backdrop-blur-md h-[60%] 2xl:h-1/2 p-0 md:w-1/2 overflow-hidden flex flex-col"
  >
    <div class="flex-1 overflow-auto border border-primary/20 rounded-lg">
      <ModelSelector />
    </div>
  </Dialog.Content>
</Dialog.Root>
