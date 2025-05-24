<template>
  <div class="mypost-container">
    <!-- 渐变色欢迎Banner -->
    <div class="welcome-banner">
      <h1>我的帖子</h1>
      <p>管理您发布的所有帖子，查看回复和点赞情况</p>
    </div>
    
    <!-- 作者筛选区域 -->
    <div class="author-filter">
      <el-card class="filter-card">
        <el-form :inline="true" :model="filterForm" class="filter-form">
          <el-form-item label="作者名称">
            <el-input v-model="filterForm.author" placeholder="请输入您的作者名称" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadMyPosts">查询</el-button>
            <el-button @click="resetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
    
    <!-- 帖子统计卡片 -->
    <div class="stats-cards" v-if="myPosts.length > 0">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-value">{{ myPosts.length }}</div>
            <div class="stat-label">发布帖子</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-value">{{ totalComments }}</div>
            <div class="stat-label">收到评论</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-value">{{ totalLikes }}</div>
            <div class="stat-label">获得点赞</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-value">{{ totalViews }}</div>
            <div class="stat-label">总浏览量</div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <!-- 帖子列表 -->
    <el-card shadow="hover" class="posts-card">
      <template #header>
        <div class="card-header">
          <span><i class="el-icon-document"></i> 我的帖子</span>
          <el-button type="primary" size="small" @click="goToForum">发布新帖</el-button>
        </div>
      </template>
      
      <div v-if="myPosts.length === 0" class="empty-posts">
        <el-empty description="暂无帖子，快去发布您的第一篇帖子吧！">
          <el-button type="primary" @click="goToForum">去发帖</el-button>
        </el-empty>
      </div>
      
      <el-table v-else :data="myPosts" style="width: 100%" border>
        <el-table-column prop="title" label="标题" min-width="200">
          <template #default="scope">
            <div class="post-title-cell">
              <span class="post-title-text">{{ scope.row.title }}</span>
              <el-tag size="small" :type="getCategoryType(scope.row.category)">{{ scope.row.category }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="发布时间" width="180" align="center" />
        <el-table-column label="数据统计" width="200" align="center">
          <template #default="scope">
            <div class="post-stats-cell">
              <span><i class="el-icon-view"></i> {{ scope.row.views }}</span>
              <span><i class="el-icon-chat-dot-round"></i> {{ scope.row.comments.length }}</span>
              <span><i class="el-icon-star-off"></i> {{ scope.row.likes }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template #default="scope">
            <el-button type="primary" size="small" @click="viewPost(scope.row)" icon="el-icon-view">查看</el-button>
            <el-button type="danger" size="small" @click="confirmDelete(scope.row)" icon="el-icon-delete">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 删除确认对话框 -->
    <el-dialog
      title="确认删除"
      v-model="deleteDialogVisible"
      width="30%"
    >
      <span>确定要删除帖子 "{{ currentPost?.title }}" 吗？此操作不可恢复。</span>
      <template #footer>
        <el-button @click="deleteDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="deletePost">确认删除</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

// 筛选表单
const filterForm = reactive({
  author: ''
})

// 帖子数据
const allPosts = ref([])
const myPosts = ref([])
const currentPost = ref(null)
const deleteDialogVisible = ref(false)

// 统计数据计算属性
const totalComments = computed(() => {
  return myPosts.value.reduce((sum, post) => sum + post.comments.length, 0)
})

const totalLikes = computed(() => {
  return myPosts.value.reduce((sum, post) => sum + post.likes, 0)
})

const totalViews = computed(() => {
  return myPosts.value.reduce((sum, post) => sum + post.views, 0)
})

// 根据分类返回不同的标签类型
const getCategoryType = (category) => {
  const types = {
    '学习讨论': 'info',
    '资源分享': 'success',
    '问题求助': 'warning',
    '经验交流': 'primary',
    '项目展示': ''
  }
  return types[category] || 'info'
}

// 加载所有帖子
const loadAllPosts = () => {
  const storedPosts = localStorage.getItem('forumPosts')
  if (storedPosts) {
    allPosts.value = JSON.parse(storedPosts)
    loadMyPosts()
  } else {
    allPosts.value = []
    myPosts.value = []
  }
}

// 加载我的帖子
const loadMyPosts = () => {
  if (filterForm.author.trim() === '') {
    myPosts.value = []
    return
  }
  
  myPosts.value = allPosts.value.filter(post => 
    post.author.toLowerCase() === filterForm.author.toLowerCase()
  )
}

// 重置筛选条件
const resetFilter = () => {
  filterForm.author = ''
  myPosts.value = []
}

// 查看帖子详情
const viewPost = (post) => {
  router.push({
    path: '/forum/detail',
    query: { id: post.id }
  })
}

// 确认删除帖子
const confirmDelete = (post) => {
  currentPost.value = post
  deleteDialogVisible.value = true
}

// 删除帖子
const deletePost = () => {
  if (!currentPost.value) return
  
  const postId = currentPost.value.id
  const updatedPosts = allPosts.value.filter(post => post.id !== postId)
  
  // 更新localStorage
  localStorage.setItem('forumPosts', JSON.stringify(updatedPosts))
  
  // 更新本地数据
  allPosts.value = updatedPosts
  loadMyPosts()
  
  deleteDialogVisible.value = false
  
  ElMessage({
    type: 'success',
    message: '帖子删除成功'
  })
}

// 跳转到论坛首页
const goToForum = () => {
  router.push('/forum')
}

// 页面加载时获取数据
onMounted(() => {
  loadAllPosts()
})

// 监听作者变化，自动加载帖子
watch(() => filterForm.author, (newVal) => {
  if (newVal.trim() !== '') {
    loadMyPosts()
  }
})
</script>

<style scoped>
.mypost-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-banner {
  background: linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%);
  color: white;
  padding: 30px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.welcome-banner h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
}

.welcome-banner p {
  margin: 10px 0 0;
  font-size: 16px;
  opacity: 0.9;
}

.author-filter {
  margin-bottom: 20px;
}

.filter-card {
  border-radius: 8px;
}

.stats-cards {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
  border-radius: 8px;
  padding: 10px 0;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #409EFF;
}

.stat-label {
  font-size: 14px;
  color: #606266;
  margin-top: 5px;
}

.posts-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.post-title-cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.post-title-text {
  font-weight: 500;
}

.post-stats-cell {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.empty-posts {
  padding: 40px 0;
  text-align: center;
}
</style>
