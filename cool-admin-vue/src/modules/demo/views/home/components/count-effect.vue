<template>
	<div class="count-sales">
		<div class="card">
			<div class="card__header">
				<span class="label">{{ $t('指导教师数') }}</span>
				<cl-svg name="user-info" class="icon" />
			</div>

			<div class="card__container">
				<cl-number :value="num" class="num" />

				<div class="rise">
					<span>{{ $t('较上周') }}</span>
					<el-icon>
						<top-right />
					</el-icon>

					<span>+7%</span>
				</div>
			</div>

			<div class="card__footer">
				<span>{{ $t('日同比') }}</span>
				<span class="ml-1 rise">
					<cl-number :value="62" /> %
				</span>
				<span class="ml-2">{{ $t('周同比') }}</span>
				<span class="ml-1 fall">
					<cl-number :value="14" /> %
				</span>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { BottomRight, TopRight } from '@element-plus/icons-vue';
import { random } from 'lodash-es';
import { onMounted, ref } from 'vue';

const rate = ref(0);
const num = ref(0);

onMounted(() => {
	rate.value = Math.random() * 30 + 30;
	num.value = random(10000000);
});
</script>

<style lang="scss" scoped>
.count-sales {
	.cop {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;

		li {
			display: flex;
			list-style: none;
			flex: 1;

			.fall,
			.rise {
				display: flex;
				align-items: center;
				margin-left: 10px;
			}

			.fall {
				color: var(--el-color-success);
			}

			.rise {
				color: var(--el-color-danger);
			}
		}
	}
}
</style>
