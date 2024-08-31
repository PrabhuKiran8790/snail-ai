<script lang="ts">
  import { writable } from "svelte/store";
  import { Input } from "$lib/components/ui/input";
  import { toGB } from "$lib/utils";
  import ollama, { type ModelResponse } from "ollama/browser";
  import { onMount } from "svelte";
  import * as Table from "$lib/components/ui/table";
  import { Button } from "$lib/components/ui/button";
  import { Progress } from "$lib/components/ui/progress";

  let ollamaModels: ModelResponse[] | null = null;

  onMount(async () => {
    const ollamaModels_ = await ollama.list();
    ollamaModels = ollamaModels_.models;
  });

  let modelToPull: string = "";

  let isDownloading = writable(false);
  let status = writable("");
  let total = writable(0);
  let completed = writable(0);
  let isError = writable(false);

  $: {
    if ($status === "success") {
      $status = "";
      $total = 0;
      $completed = 0;
      $isDownloading = false;
      location.reload();
    }
  }
</script>

{#if ollamaModels && ollamaModels.length > 0}
  <div class="pr-20 flex flex-col gap-4">
    <div class="flex items-center justify-start gap-4 w-1/2">
      <Input
        bind:value={modelToPull}
        placeholder="Search Models"
        class="focus-visible:ring-offset-0 focus-visible:ring-slate-50/50 focus-visible:ring-0 outline-none bg-muted/80 h-9"
      />
      <Button
        class="h-9"
        variant="secondary"
        on:click={async () => {
          try {
            const stream = await ollama.pull({
              model: modelToPull,
              stream: true,
            });
            modelToPull = "";
            $isError = false;

            for await (const chunk of stream) {
              $isDownloading = true;
              $status = chunk.status;
              $total = toGB(chunk.total);
              $completed = toGB(chunk.completed);
            }
          } catch (error) {
            $isDownloading = false;
            $isError = true;
            if (error instanceof Error) {
              $status = error.message;
            } else {
              $status = "An unknown error occurred";
            }
          }
        }}>Download</Button
      >
    </div>

    {#if !$isError}
      {#if $total || $status}
        <div class="mx-auto flex w-[80%] flex-col items-center gap-5">
          <div class="flex w-full items-center justify-between">
            <div>
              <p>{$status}</p>
            </div>
            <div>
              <p>{$completed} GB / {$total} GB</p>
            </div>
          </div>
          <Progress value={$completed} max={$total} />
        </div>
      {/if}
    {:else}
      <p class="text-center text-red-500">{$status}</p>
    {/if}

    <h1 class="text-lg font-semibold">Ollama Models</h1>
    <div class="rounded-lg border border-primary/30">
      <Table.Root>
        <Table.Header class="bg-primary/10">
          <Table.Row>
            <Table.Cell>Model Name</Table.Cell>
            <Table.Cell>Parameter Size</Table.Cell>
            <Table.Cell>Quantization Level</Table.Cell>
            <Table.Cell>Size</Table.Cell>
            <Table.Cell></Table.Cell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {#each ollamaModels as model (model.name)}
            <Table.Row>
              <Table.Cell>{model.name}</Table.Cell>
              <Table.Cell>{model.details.parameter_size}</Table.Cell>
              <Table.Cell>{model.details.quantization_level}</Table.Cell>
              <Table.Cell>{toGB(model.size)} GB</Table.Cell>
              <Table.Cell class="px-0">
                <Button
                  variant="destructive"
                  on:click={async () => {
                    ollamaModels =
                      ollamaModels?.filter((m) => m.name !== model.name) || [];
                    ollama.delete({
                      model: model.name,
                    });
                    const ollamaModels_ = await ollama.list();
                    ollamaModels = ollamaModels_.models;
                  }}>Delete</Button
                >
              </Table.Cell>
            </Table.Row>
          {/each}
        </Table.Body>
      </Table.Root>
    </div>
  </div>
{/if}
