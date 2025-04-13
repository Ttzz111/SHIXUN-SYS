<template>
	<div class="count-sales">
		<div class="card">
			<div class="card__header">
				<span class="label">{{ $t('实训任务数') }}</span>
				<cl-svg name="paid" class="icon" />
			</div>

			<div class="card__container">
				<cl-number :value="num" class="num" />
			</div>

			<div class="card__footer">
				<span class="mr-2">{{ $t('完成率') }}</span>
				<span>60%</span>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { random } from 'lodash-es';
import { onMounted, ref } from 'vue';

const num = ref(0);

onMounted(() => {
	num.value = random(10000);
});
</script>
