<script lang="ts">
	import { Splide, SplideSlide } from '@splidejs/svelte-splide';

	import '@splidejs/splide/dist/css/themes/splide-default.min.css';
</script>

<div class="wrapper">
	<Splide
		options={{
			rewind: true,
			height: 'calc(100vh - 70px - 50px)',
			width: '100vw',
			autoplay: true,
			interval: 20000,
			cloneStatus: false
		}}
		aria-label="My Favorite Images"
	>
		{#each Array(29) as _, i}
			<SplideSlide>
				<img src="/assets/banner/{i + 1}.webp" alt="Banner {i + 1}" />
			</SplideSlide>
		{/each}
	</Splide>
</div>

<style lang="scss">
	img {
		height: 100%;
		width: 100%;
		object-fit: contain;
	}

	.wrapper {
		padding: 25px;
	}
</style>
