<script>
  import { XIcon } from "lucide-svelte";

  export let uploadedImageSrc = "";
</script>

<div class="h-11 relative w-fit">
  <img src={uploadedImageSrc} alt="" class="object-cover h-full" />
  <button
    class="rounded-full bg-secondary-foreground/10 p-0.5 absolute -top-2 -right-2 hover:bg-secondary-foreground/20"
    on:click={() => (uploadedImageSrc = "")}
  >
    <XIcon class=" size-4" />
  </button>
</div>
