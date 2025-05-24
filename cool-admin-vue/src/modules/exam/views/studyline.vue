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
              <p>已下载资源：{{ resourceList.length }}个</p>
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
            <el-progress type="dashboard" :percentage="projectParticipationRate" :color="customColors">
              <template #default="{ percentage }">
                <span class="progress-label">项目参与率</span>
                <span class="progress-value">{{ percentage }}%</span>
              </template>
            </el-progress>
            <div class="stat-info">
              <p>参与项目：{{ projectList.length }}个</p>
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
            <el-progress type="dashboard" :percentage="examAverageScore" :color="customColors">
              <template #default="{ percentage }">
                <span class="progress-label">平均成绩</span>
                <span class="progress-value">{{ percentage }}分</span>
              </template>
            </el-progress>
            <div class="stat-info">
              <p>已完成考试：{{ examList.length }}次</p>
              <p>总考试数：{{ examList.length }}次</p>
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
          :title="analysisTitle"
          :type="analysisType"
          show-icon
          :closable="false"
        />
        <ul class="analysis-list">
          <li>资源下载数量{{ resourceList.length > 3 ? '充足' : '较少' }}，{{ resourceList.length > 3 ? '已' : '仅' }}下载了 <b>{{ resourceList.length }}</b> 个资源。</li>
          <li>参与项目数量{{ projectList.length > 2 ? '充足' : '较少' }}，{{ projectList.length > 2 ? '已' : '仅' }}参与了 <b>{{ projectList.length }}</b> 个项目。</li>
          <li>平均成绩为 <b>{{ examAverageScore }}分</b>，考试通过率为 <b>{{ examPassRate }}%</b>。</li>
        </ul>
        <div class="analysis-suggestion">
          建议：{{ 
            examAverageScore < 60 ? '请认真备考提升成绩！' : 
            projectList.length < 2 ? '请积极参与项目实践！' : 
            resourceList.length < 3 ? '请多下载学习资源！' : 
            '继续保持良好学习状态！' 
          }}
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
            <div>统计区间：{{ dateRangeString }}</div>
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
import { ref, onMounted, computed, watch } from 'vue'

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
const projectList = ref([])

// 考试成绩记录
const examList = ref([])

// 加载项目参与记录
const loadProjectList = () => {
  const reservations = JSON.parse(localStorage.getItem('practiceReservations') || '[]')
  // 过滤出已通过的预约
  projectList.value = reservations
    .filter(r => r.status === 'approved')
    .map(r => ({
      name: r.projectName,
      status: '进行中',
      joinTime: r.applyTime
    }))
}

// 加载考试成绩记录
const loadExamList = () => {
  const examHistory = JSON.parse(localStorage.getItem('examHistory') || '[]')
  examList.value = examHistory.map(exam => ({
    name: exam.paperName,
    score: exam.score,
    examTime: exam.submitTime,
    status: exam.score >= 60 ? '通过' : '未通过'
  }))
}

// 计算项目参与率
const projectParticipationRate = computed(() => {
  // 假设总项目数为5个
  const totalProjects = 5
  return Math.round((projectList.value.length / totalProjects) * 100)
})

// 计算考试平均成绩
const examAverageScore = computed(() => {
  if (examList.value.length === 0) return 0
  const totalScore = examList.value.reduce((sum, exam) => sum + exam.score, 0)
  return Math.round(totalScore / examList.value.length)
})

// 计算考试通过率
const examPassRate = computed(() => {
  if (examList.value.length === 0) return 0
  const passedExams = examList.value.filter(exam => exam.score >= 60).length
  return Math.round((passedExams / examList.value.length) * 100)
})

// 计算活跃度和成长曲线数据
const generateActivityData = () => {
  // 获取过去6天的日期（包括今天）
  const dates = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  // 初始化活跃数据
  const activityData = dates.map(date => ({
    date,
    active: 0,
    score: 0,
    activities: []
  }));
  
  // 从考试记录中提取活跃数据
  examList.value.forEach(exam => {
    const examDate = new Date(exam.examTime).toISOString().split('T')[0];
    const dayData = activityData.find(d => d.date === examDate);
    if (dayData) {
      dayData.active = 1;
      dayData.score += exam.score / 10; // 将考试分数转换为活跃度得分
      dayData.activities.push(`参加考试: ${exam.name}`);
    }
  });
  
  // 从项目参与记录中提取活跃数据
  projectList.value.forEach(project => {
    const projectDate = new Date(project.joinTime).toISOString().split('T')[0];
    const dayData = activityData.find(d => d.date === projectDate);
    if (dayData) {
      dayData.active = 1;
      dayData.score += 20; // 项目参与加20分活跃度
      dayData.activities.push(`参与项目: ${project.name}`);
    }
  });
  
  // 计算累计得分（成长曲线）
  let cumulativeScore = 0;
  activityData.forEach(day => {
    // 每天基础分5分
    if (day.score === 0) day.score = 5;
    cumulativeScore += day.score;
    day.cumulativeScore = cumulativeScore;
  });
  
  return activityData;
};

// 活跃度数据（动态计算）
const activeDays = computed(() => {
  return generateActivityData();
});

// 计算活跃度统计
const totalDays = computed(() => activeDays.value.length);
const activeCount = computed(() => activeDays.value.filter(d => d.active).length);
const activePercent = computed(() => Math.round((activeCount.value / totalDays.value) * 100));

// 计算日期范围字符串
const dateRangeString = computed(() => {
  if (activeDays.value.length > 0) {
    const startDate = activeDays.value[0].date;
    const endDate = activeDays.value[activeDays.value.length - 1].date;
    return `${startDate} ~ ${endDate}`;
  }
  return '';
});

// 系统学习情况分析
const analysisTitle = computed(() => {
  const avgScore = examAverageScore.value
  const projectRate = projectParticipationRate.value
  
  if (avgScore >= 80 && projectRate >= 60) {
    return '学习情况优秀，继续保持！'
  } else if (avgScore >= 60 && projectRate >= 40) {
    return '学习情况良好，仍有提升空间！'
  } else if (avgScore >= 40 && projectRate >= 20) {
    return '学习情况一般，需要更加努力！'
  } else {
    return '学习情况较差，需要加倍努力！'
  }
})

const analysisType = computed(() => {
  const avgScore = examAverageScore.value
  const projectRate = projectParticipationRate.value
  
  if (avgScore >= 80 && projectRate >= 60) {
    return 'success'
  } else if (avgScore >= 60 && projectRate >= 40) {
    return 'warning'
  } else {
    return 'error'
  }
})

// ECharts配置
let chart = null;
const chartOption = computed(() => ({
  title: { text: '成长曲线', left: 'center', top: 10, textStyle: { fontSize: 16 } },
  tooltip: { 
    trigger: 'axis',
    formatter: function(params) {
      const data = activeDays.value.find(d => d.date === params[0].name);
      let result = `${params[0].name}<br/>每日成绩: ${params[0].value}分<br/>`;
      if (data && data.activities.length > 0) {
        result += '<br/>活动记录:<br/>';
        data.activities.forEach(activity => {
          result += `${activity}<br/>`;
        });
      }
      return result;
    }
  },
  xAxis: {
    type: 'category',
    data: activeDays.value.map(d => d.date),
    boundaryGap: false
  },
  yAxis: {
    type: 'value',
    min: 0,
    axisLabel: { formatter: '{value} 分' }
  },
  series: [
    {
      name: '每日成绩',
      type: 'line',
      data: activeDays.value.map(d => d.cumulativeScore),
      smooth: true,
      symbol: 'circle',
      symbolSize: 10,
      lineStyle: { color: '#1989fa', width: 3 },
      itemStyle: { color: '#1989fa' },
      areaStyle: { color: 'rgba(25,137,250,0.1)' }
    }
  ]
}));

onMounted(() => {
  // 加载数据
  loadProjectList();
  loadExamList();
  
  // 动态加载echarts
  import('echarts').then(echarts => {
    chart = echarts.init(document.getElementById('growth-chart'));
    chart.setOption(chartOption.value);
  });
});

// 当数据变化时更新图表
watch([examList, projectList], () => {
  if (chart) {
    chart.setOption(chartOption.value);
  }
});

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
