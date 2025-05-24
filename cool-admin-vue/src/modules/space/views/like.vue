<template>
  <div class="like-container">
    <!-- 渐变色欢迎Banner -->
    <div class="welcome-banner">
      <h1>我的点赞</h1>
      <p>查看您点赞过的帖子，快速访问感兴趣的内容</p>
    </div>
    
    <!-- 帖子列表 -->
    <el-card shadow="hover" class="liked-posts-card">
      <template #header>
        <div class="card-header">
          <span><i class="el-icon-star-on"></i> 点赞的帖子</span>
        </div>
      </template>
      
      <div v-if="likedPosts.length === 0" class="empty-likes">
        <el-empty description="暂无点赞的帖子，快去浏览论坛吧！">
          <el-button type="primary" @click="goToForum">去浏览</el-button>
        </el-empty>
      </div>
      
      <div v-else class="liked-posts-list">
        <el-card v-for="post in likedPosts" :key="post.id" class="post-card" shadow="hover" @click="viewPostDetail(post)">
          <div class="post-header">
            <div class="post-title">{{ post.title }}</div>
            <el-tag size="small" :type="getCategoryType(post.category)">{{ post.category }}</el-tag>
          </div>
          <div class="post-content-preview">{{ post.content.substring(0, 100) }}{{ post.content.length > 100 ? '...' : '' }}</div>
          <div class="post-meta">
            <span class="post-author"><i class="el-icon-user"></i> {{ post.author }}</span>
            <span class="post-time"><i class="el-icon-time"></i> {{ post.createTime }}</span>
            <span class="post-stats">
              <i class="el-icon-view"></i> {{ post.views }}
              <i class="el-icon-chat-dot-round" style="margin-left: 10px;"></i> {{ post.comments.length }}
              <i class="el-icon-star-on" style="margin-left: 10px; color: #F56C6C;"></i> {{ post.likes }}
            </span>
          </div>
          <div class="unlike-button">
            <el-button type="text" @click.stop="unlikePost(post)">
              <i class="el-icon-star-off"></i> 取消点赞
            </el-button>
          </div>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 点赞的帖子列表
const likedPosts = ref([])

// 加载点赞的帖子
const loadLikedPosts = () => {
  // 获取点赞过的帖子ID列表
  const likedPostIds = JSON.parse(localStorage.getItem('forumLikedPosts') || '[]')
  
  if (likedPostIds.length === 0) {
    likedPosts.value = []
    return
  }
  
  // 获取所有帖子
  const storedPosts = JSON.parse(localStorage.getItem('forumPosts') || '[]')
  
  // 筛选出点赞过的帖子
  likedPosts.value = storedPosts.filter(post => likedPostIds.includes(post.id))
}

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

// 查看帖子详情
const viewPostDetail = (post) => {
  router.push({
    path: '/forum/detail',
    query: { id: post.id }
  })
}

// 取消点赞
const unlikePost = (post) => {
  // 获取点赞过的帖子ID列表
  const likedPostIds = JSON.parse(localStorage.getItem('forumLikedPosts') || '[]')
  
  // 从点赞列表中移除
  const index = likedPostIds.indexOf(post.id)
  if (index > -1) {
    likedPostIds.splice(index, 1)
    localStorage.setItem('forumLikedPosts', JSON.stringify(likedPostIds))
  }
  
  // 减少帖子的点赞数
  post.likes -= 1
  
  // 更新帖子数据
  const storedPosts = JSON.parse(localStorage.getItem('forumPosts') || '[]')
  const postIndex = storedPosts.findIndex(p => p.id === post.id)
  if (postIndex > -1) {
    storedPosts[postIndex].likes = post.likes
    localStorage.setItem('forumPosts', JSON.stringify(storedPosts))
  }
  
  // 从当前列表中移除
  likedPosts.value = likedPosts.value.filter(p => p.id !== post.id)
  
  ElMessage({
    type: 'success',
    message: '已取消点赞'
  })
}

// 跳转到论坛首页
const goToForum = () => {
  router.push('/forum')
}

// 页面加载时获取数据
onMounted(() => {
  loadLikedPosts()
})
</script>

<style scoped>
.like-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-banner {
  background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);
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

.liked-posts-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  display: flex;
  align-items: center;
  gap: 5px;
}

.empty-likes {
  padding: 40px 0;
  text-align: center;
}

.liked-posts-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.post-card {
  cursor: pointer;
  transition: transform 0.2s;
  border-radius: 8px;
  position: relative;
}

.post-card:hover {
  transform: translateY(-3px);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.post-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.post-content-preview {
  color: #606266;
  margin-bottom: 15px;
  line-height: 1.5;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  color: #909399;
  font-size: 14px;
}

.post-author, .post-time {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.post-stats {
  display: inline-flex;
  align-items: center;
}

.unlike-button {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
}

.unlike-button .el-button {
  color: #F56C6C;
}

.unlike-button .el-button:hover {
  color: #f78989;
}
</style> 