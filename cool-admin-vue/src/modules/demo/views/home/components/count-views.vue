<template>
	<div class="count-sales">
		<div class="card">
			<div class="card__header">
				<span class="label">{{ $t('实训项目数') }}</span>
				<cl-svg name="view" class="icon" />
			</div>

			<div class="card__container">
				<cl-number :value="num" class="num" />

				<div class="rise">
					<span>{{ $t('较上月') }}</span>
					<el-icon>
						<top-right />
					</el-icon>
					<span>+4%</span>
				</div>
			</div>

			<div class="card__footer">
				<span class="mr-2">{{ $t('访问量') }}</span>
				<cl-number :value="visits" />
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue';
import { random, range } from 'lodash-es';

const chartOption = reactive({
	grid: {
		left: 0,
		top: 1,
		right: 0,
		bottom: 0
	},
	xAxis: {
		type: 'category',
		boundaryGap: false,
		axisLine: {
			show: false
		},
		data: [
			'00:00',
			'2:00',
			'4:00',
			'6:00',
			'8:00',
			'10:00',
			'12:00',
			'14:00',
			'16:00',
			'18:00',
			'20:00',
			'22:00'
		]
	},
	yAxis: {
		type: 'value',
		splitLine: {
			show: false
		},
		axisTick: {
			show: false
		},
		axisLine: {
			show: false
		},
		axisLabel: {
			show: false
		}
	},
	series: [
		{
			type: 'line',
			smooth: true,
			showSymbol: false,
			symbol: 'circle',
			symbolSize: 6,
			data: range(12).map(() => parseInt((Math.random() * 1000).toFixed(0)) + 500),
			itemStyle: {
				color: '#4165d7'
			},
			lineStyle: {
				width: 2
			}
		}
	]
});

const num = ref(0);
const visits = ref(0);

onMounted(() => {
	num.value = random(1000000);
	visits.value = random(1000000);
});
</script>

<style lang="scss" scoped>
.count-sales {
	.card {
		.echarts {
			height: 50px;
			width: 100%;
		}

		&__container {
			padding: 0;
		}

		&__footer {
			border-top: 0;
		}
	}
}
</style>
