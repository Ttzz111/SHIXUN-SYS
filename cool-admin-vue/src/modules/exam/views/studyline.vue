<template>
  <div class="study-line-container">
    <!-- 欢迎Banner -->
    <div class="welcome-banner">
      <h1>学习轨迹</h1>
      <p>在这里，您可以查看自己的学习进度、资源下载记录、项目参与情况和考试成绩分析。</p>
    </div>

    <!-- 学习情况概览 -->
    <el-row :gutter="20" class="overview-section">
      <el-col :span="8">
        <el-card class="overview-card">
          <template #header>
            <div class="card-header">
              <span>资源下载情况</span>
            </div>
          </template>
          <div class="card-content">
            <el-progress type="dashboard" :percentage="10" :color="customColors">
              <template #default="{ percentage }">
                <span class="progress-label">资源下载率</span>
                <span class="progress-value">{{ percentage }}%</span>
              </template>
            </el-progress>
            <div class="stat-info">
              <p>已下载资源：1个</p>
              <p>总资源数：10个</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="overview-card">
          <template #header>
            <div class="card-header">
              <span>项目参与情况</span>
            </div>
          </template>
          <div class="card-content">
            <el-progress type="dashboard" :percentage="20" :color="customColors">
              <template #default="{ percentage }">
                <span class="progress-label">项目参与率</span>
                <span class="progress-value">{{ percentage }}%</span>
              </template>
            </el-progress>
            <div class="stat-info">
              <p>参与项目：1个</p>
              <p>总项目数：5个</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="overview-card">
          <template #header>
            <div class="card-header">
              <span>考试成绩分析</span>
            </div>
          </template>
          <div class="card-content">
            <el-progress type="dashboard" :percentage="7" :color="customColors">
              <template #default="{ percentage }">
                <span class="progress-label">平均成绩</span>
                <span class="progress-value">{{ percentage }}分</span>
              </template>
            </el-progress>
            <div class="stat-info">
              <p>已完成考试：10次</p>
              <p>总考试数：10次</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 系统学习情况分析模块 -->
    <el-card class="analysis-section">
      <template #header>
        <div class="card-header">
          <span>系统学习情况分析</span>
        </div>
      </template>
      <div class="analysis-content">
        <el-alert
          title="学习情况较差，需要加倍努力！"
          type="error"
          show-icon
          :closable="false"
        />
        <ul class="analysis-list">
          <li>资源下载数量较少，仅下载了 <b>{{ resourceList.length }}</b> 个资源。</li>
          <li>参与项目数量较少，仅参与了 <b>{{ projectList.length }}</b> 个项目。</li>
          <li>平均成绩仅为 <b>7分</b>，考试通过率较低。</li>
        </ul>
        <div class="analysis-suggestion">
          建议：请多下载学习资源，积极参与项目实践，认真备考提升成绩！
        </div>
      </div>
    </el-card>

    <!-- 系统学习情况分析模块下方新增活跃度和成长曲线 -->
    <el-row :gutter="20" class="active-growth-section">
      <el-col :span="8">
        <el-card>
          <template #header>
            <span>活跃度</span>
          </template>
          <div style="text-align:center;">
            <el-progress type="circle" :percentage="activePercent" :color="customColors" style="margin-bottom:10px;" />
            <div>活跃天数：{{ activeCount }} / {{ totalDays }}</div>
            <div>统计区间：2025-05-03 ~ 2025-05-08</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="16">
        <el-card>
          <template #header>
            <span>成长曲线</span>
          </template>
          <div id="growth-chart" style="width:100%;height:300px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 详细记录区域 -->
    <el-row :gutter="20" class="detail-section">
      <!-- 资源下载记录 -->
      <el-col :span="12">
        <el-card class="detail-card">
          <template #header>
            <div class="card-header">
              <span>资源下载记录</span>
            </div>
          </template>
          <el-table :data="resourceList" style="width: 100%">
            <el-table-column prop="name" label="资源名称" />
            <el-table-column prop="type" label="类型" width="100" />
            <el-table-column prop="downloadTime" label="下载时间" width="180" />
          </el-table>
        </el-card>
      </el-col>

      <!-- 项目参与记录 -->
      <el-col :span="12">
        <el-card class="detail-card">
          <template #header>
            <div class="card-header">
              <span>项目参与记录</span>
            </div>
          </template>
          <el-table :data="projectList" style="width: 100%">
            <el-table-column prop="name" label="项目名称" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getProjectStatusType(scope.row.status)">
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="joinTime" label="参与时间" width="180" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 考试成绩记录 -->
    <el-card class="exam-section">
      <template #header>
        <div class="card-header">
          <span>考试成绩记录</span>
        </div>
      </template>
      <el-table :data="examList" style="width: 100%">
        <el-table-column prop="name" label="考试名称" />
        <el-table-column prop="score" label="分数" width="100">
          <template #default="scope">
            <span :class="getScoreClass(scope.row.score)">{{ scope.row.score }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="examTime" label="考试时间" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getExamStatusType(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

// 自定义进度条颜色
const customColors = [
  { color: '#f56c6c', percentage: 20 },
  { color: '#e6a23c', percentage: 40 },
  { color: '#5cb87a', percentage: 60 },
  { color: '#1989fa', percentage: 80 },
  { color: '#6f7ad3', percentage: 100 }
]

// 资源下载记录
const resourceList = ref([
  {
    name: '工程创客训练：基于vslam的多旋翼自主无人机的设计、制造和调试',
    type: 'PDF',
    downloadTime: '2025-05-07 10:00'
  }
])

// 项目参与记录
const projectList = ref([
  {
    name: '工程创客训练：立式绳驱动蛇形自动充电手臂结构及控制系统设计',
    status: '进行中',
    joinTime: '2025-05-07 10:00'
  }
])

// 考试成绩记录
const examList = ref([
  {
    name: '工程实践项目需求分析测试',
    score: 0,
    examTime: '2025-05-03 16:29:45',
    status: '未通过'
  },
  {
    name: '工程实践项目需求分析测试',
    score: 0,
    examTime: '2025-05-03 16:29:30',
    status: '未通过'
  },
  {
    name: '工程实践项目需求分析测试',
    score: 0,
    examTime: '2025-05-03 16:29:15',
    status: '未通过'
  },
  {
    name: '工程实践项目需求分析测试',
    score: 0,
    examTime: '2025-05-03 16:29:00',
    status: '未通过'
  },
  {
    name: '工程实践项目需求分析测试',
    score: 0,
    examTime: '2025-05-03 16:28:45',
    status: '未通过'
  },
  {
    name: '工程实践项目需求分析测试',
    score: 0,
    examTime: '2025-05-03 16:28:30',
    status: '未通过'
  },
  {
    name: '工程实践项目需求分析测试',
    score: 0,
    examTime: '2025-05-03 16:28:15',
    status: '未通过'
  },
  {
    name: '工程实践项目需求分析测试',
    score: 40,
    examTime: '2025-05-03 16:28:00',
    status: '未通过'
  },
  {
    name: '工程实践项目需求分析测试',
    score: 0,
    examTime: '2025-05-03 16:27:45',
    status: '未通过'
  },
  {
    name: '工程实践项目需求分析测试',
    score: 0,
    examTime: '2025-05-03 16:27:30',
    status: '未通过'
  }
])

// 活跃度数据（2025.5.3-2025.5.8）
const activeDays = ref([
  { date: '2025-05-03', active: 1, score: 5 },
  { date: '2025-05-04', active: 1, score: 10 },
  { date: '2025-05-05', active: 1, score: 15 },
  { date: '2025-05-06', active: 1, score: 20 },
  { date: '2025-05-07', active: 1, score: 30 },
  { date: '2025-05-08', active: 1, score: 40 }
])
const totalDays = activeDays.value.length
const activeCount = activeDays.value.filter(d => d.active).length
const activePercent = Math.round((activeCount / totalDays) * 100)

// ECharts配置
let chart = null
const chartOption = ref({
  title: { text: '成长曲线', left: 'center', top: 10, textStyle: { fontSize: 16 } },
  tooltip: { trigger: 'axis' },
  xAxis: {
    type: 'category',
    data: activeDays.value.map(d => d.date),
    boundaryGap: false
  },
  yAxis: {
    type: 'value',
    min: 0,
    max: 50,
    axisLabel: { formatter: '{value} 分' }
  },
  series: [
    {
      name: '每日成绩',
      type: 'line',
      data: activeDays.value.map(d => d.score),
      smooth: true,
      symbol: 'circle',
      symbolSize: 10,
      lineStyle: { color: '#1989fa', width: 3 },
      itemStyle: { color: '#1989fa' },
      areaStyle: { color: 'rgba(25,137,250,0.1)' }
    }
  ]
})

onMounted(() => {
  // 动态加载echarts
  import('echarts').then(echarts => {
    chart = echarts.init(document.getElementById('growth-chart'))
    chart.setOption(chartOption.value)
  })
})

// 获取项目状态样式
const getProjectStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    '进行中': 'primary',
    '已完成': 'success',
    '未开始': 'info'
  }
  return statusMap[status] || 'info'
}

// 获取考试状态样式
const getExamStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    '通过': 'success',
    '未通过': 'danger',
    '待考试': 'info'
  }
  return statusMap[status] || 'info'
}

// 获取分数样式
const getScoreClass = (score: number) => {
  if (score >= 60) return 'score-pass'
  if (score > 0) return 'score-fail'
  return 'score-zero'
}
</script>

<style scoped>
.study-line-container {
  padding: 20px;
  height: calc(100vh - 120px); /* 减去头部导航和padding的高度 */
  overflow-y: auto;
}

.welcome-banner {
  background: linear-gradient(135deg, #6f7ad3 0%, #1989fa 100%);
  color: white;
  padding: 30px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.welcome-banner h1 {
  margin: 0;
  font-size: 24px;
}

.welcome-banner p {
  margin: 10px 0 0;
  opacity: 0.9;
}

.overview-section {
  margin-bottom: 20px;
}

.overview-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content {
  text-align: center;
  padding: 20px 0;
}

.progress-label {
  display: block;
  font-size: 14px;
  color: #606266;
  margin-bottom: 5px;
}

.progress-value {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.stat-info {
  margin-top: 20px;
  text-align: left;
  padding: 0 20px;
}

.stat-info p {
  margin: 5px 0;
  color: #606266;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-card {
  height: 100%;
}

.exam-section {
  margin-bottom: 20px;
}

.score-pass {
  color: #67c23a;
  font-weight: bold;
}

.score-fail {
  color: #f56c6c;
  font-weight: bold;
}

.score-zero {
  color: #909399;
  font-weight: bold;
}

.analysis-section {
  margin-bottom: 20px;
}
.analysis-content {
  padding: 10px 0 0 0;
}
.analysis-list {
  margin: 16px 0 0 0;
  padding-left: 20px;
  color: #606266;
}
.analysis-list li {
  margin-bottom: 6px;
}
.analysis-suggestion {
  margin-top: 16px;
  color: #f56c6c;
  font-weight: bold;
}

.active-growth-section {
  margin-bottom: 20px;
}
</style>
