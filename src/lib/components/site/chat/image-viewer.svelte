<script lang="ts">
  import { getImageType } from "$lib/utils";

  export let base64String = "";

  let imageType = "";

  imageType = getImageType(base64String);
  const dataUrl = `data:${imageType};base64,${base64String}`;
</script>

<div class="max-h-48">
  <img src={dataUrl} alt="" class="object-cover h-full rounded-lg" />
</div>
