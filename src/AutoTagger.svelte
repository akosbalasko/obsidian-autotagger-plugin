
<svelte:options immutable />

<script lang='ts'>
    
    import { onMount } from 'svelte';

    export let redraw: () => void;
    export let autoTags: string[];
    let textarea;
    init();
    $: textareaValue = Array.from(autoTags.values()).join('\n');

    function init() {
        redraw();
        console.log("redrawn from init");
        console.log(`autotags: ${JSON.stringify(autoTags)}`)
    }

    const copy = () => {
		textarea.select();
        document.execCommand('copy');
        alert('autotags copied to clipboard');
    };

</script>

<div id="autotags-container">
    <h3>Tags recognized: <button on:click={copy}>Copy to clipboard</button></h3>
    <textarea bind:value={textareaValue} bind:this={textarea}></textarea>
</div>

<style>
	textarea { width: 100%; height:100vh}
</style>