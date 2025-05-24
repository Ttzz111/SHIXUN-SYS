<template>
  <div class="like-container">
    <!-- 标签页 -->
    <el-tabs v-model="activeTab" class="tabs-container">
      <el-tab-pane label="我的点赞" name="likes">
        <!-- 渐变色欢迎Banner -->
        <div class="welcome-banner likes-banner">
          <h1>我的点赞</h1>
          <p>查看您点赞过的帖子，快速访问感兴趣的内容</p>
        </div>
        
        <!-- 帖子列表 -->
        <el-card shadow="hover" class="liked-posts-card">
          <template #header>
            <div class="card-header">
              <span><span class="icon">♥</span> 点赞的帖子</span>
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
                  <span class="stat-item"><span class="stat-icon">👁️</span> {{ post.views }}</span>
                  <span class="stat-item"><span class="stat-icon">💬</span> {{ post.comments.length }}</span>
                  <span class="stat-item"><span class="stat-icon liked">♥</span> {{ post.likes }}</span>
                </span>
              </div>
              <div class="action-button unlike-button">
                <el-button type="text" @click.stop="toggleLike(post)">
                  <span class="unlike-icon">♥</span> 取消点赞
                </el-button>
              </div>
            </el-card>
          </div>
        </el-card>
      </el-tab-pane>
      
      <el-tab-pane label="我的收藏" name="favorites">
        <!-- 渐变色欢迎Banner -->
        <div class="welcome-banner favorites-banner">
          <h1>我的收藏</h1>
          <p>查看您收藏的帖子，方便随时查阅</p>
        </div>
        
        <!-- 帖子列表 -->
        <el-card shadow="hover" class="favorited-posts-card">
          <template #header>
            <div class="card-header">
              <span><span class="icon">★</span> 收藏的帖子</span>
            </div>
          </template>
          
          <div v-if="favoritedPosts.length === 0" class="empty-favorites">
            <el-empty description="暂无收藏的帖子，快去浏览论坛吧！">
              <el-button type="primary" @click="goToForum">去浏览</el-button>
            </el-empty>
          </div>
          
          <div v-else class="favorited-posts-list">
            <el-card v-for="post in favoritedPosts" :key="post.id" class="post-card" shadow="hover" @click="viewPostDetail(post)">
              <div class="post-header">
                <div class="post-title">{{ post.title }}</div>
                <el-tag size="small" :type="getCategoryType(post.category)">{{ post.category }}</el-tag>
              </div>
              <div class="post-content-preview">{{ post.content.substring(0, 100) }}{{ post.content.length > 100 ? '...' : '' }}</div>
              <div class="post-meta">
                <span class="post-author"><i class="el-icon-user"></i> {{ post.author }}</span>
                <span class="post-time"><i class="el-icon-time"></i> {{ post.createTime }}</span>
                <span class="post-stats">
                  <span class="stat-item"><span class="stat-icon">👁️</span> {{ post.views }}</span>
                  <span class="stat-item"><span class="stat-icon">💬</span> {{ post.comments.length }}</span>
                  <span class="stat-item"><span class="stat-icon">★</span> {{ post.favorites || 0 }}</span>
                </span>
              </div>
              <div class="action-button unfavorite-button">
                <el-button type="text" @click.stop="toggleFavorite(post)">
                  <span class="unfavorite-icon">★</span> 取消收藏
                </el-button>
              </div>
            </el-card>
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useBase } from '/$/base'

const router = useRouter()
const { user } = useBase()

// 当前用户信息
const currentUser = ref('')

// 活动标签页
const activeTab = ref('likes')

// 点赞的帖子列表
const likedPosts = ref([])

// 收藏的帖子列表
const favoritedPosts = ref([])

// 获取当前用户信息
const getUserInfo = () => {
  // 从系统获取当前登录用户的用户名
  currentUser.value = user.info?.username || '游客'
}

// 加载点赞和收藏的帖子
const loadUserPosts = () => {
  if (currentUser.value === '游客') return
  
  // 获取所有帖子
  const storedPosts = JSON.parse(localStorage.getItem('forumPosts') || '[]')
  
  // 获取用户点赞列表
  const userLikes = JSON.parse(localStorage.getItem(`userLikes_${currentUser.value}`) || '[]')
  
  // 获取用户收藏列表
  const userFavorites = JSON.parse(localStorage.getItem(`userFavorites_${currentUser.value}`) || '[]')
  
  // 筛选出点赞过的帖子
  likedPosts.value = storedPosts.filter(post => userLikes.includes(post.id))
  
  // 筛选出收藏过的帖子
  favoritedPosts.value = storedPosts.filter(post => userFavorites.includes(post.id))
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

// 切换点赞状态
const toggleLike = (post) => {
  if (currentUser.value === '游客') return
  
  // 获取用户点赞列表
  const userLikes = JSON.parse(localStorage.getItem(`userLikes_${currentUser.value}`) || '[]')
  
  // 获取最新的帖子数据
  const storedPosts = JSON.parse(localStorage.getItem('forumPosts'))
  const postInStorage = storedPosts.find(p => p.id === post.id)
  if (!postInStorage) return
  
  // 从点赞列表中移除
  const index = userLikes.indexOf(post.id)
  if (index > -1) {
    userLikes.splice(index, 1)
    
    // 更新点赞数
    postInStorage.likes = Math.max(0, postInStorage.likes - 1)
    
    // 更新存储
    localStorage.setItem(`userLikes_${currentUser.value}`, JSON.stringify(userLikes))
    localStorage.setItem('forumPosts', JSON.stringify(storedPosts))
    
    // 从当前列表中移除
    likedPosts.value = likedPosts.value.filter(p => p.id !== post.id)
    
    ElMessage({
      type: 'success',
      message: '已取消点赞',
      duration: 1000
    })
  }
}

// 切换收藏状态
const toggleFavorite = (post) => {
  if (currentUser.value === '游客') return
  
  // 获取用户收藏列表
  const userFavorites = JSON.parse(localStorage.getItem(`userFavorites_${currentUser.value}`) || '[]')
  
  // 获取最新的帖子数据
  const storedPosts = JSON.parse(localStorage.getItem('forumPosts'))
  const postInStorage = storedPosts.find(p => p.id === post.id)
  if (!postInStorage) return
  
  // 从收藏列表中移除
  const index = userFavorites.indexOf(post.id)
  if (index > -1) {
    userFavorites.splice(index, 1)
    
    // 更新收藏数
    postInStorage.favorites = Math.max(0, (postInStorage.favorites || 0) - 1)
    
    // 更新存储
    localStorage.setItem(`userFavorites_${currentUser.value}`, JSON.stringify(userFavorites))
    localStorage.setItem('forumPosts', JSON.stringify(storedPosts))
    
    // 从当前列表中移除
    favoritedPosts.value = favoritedPosts.value.filter(p => p.id !== post.id)
    
    ElMessage({
      type: 'success',
      message: '已取消收藏',
      duration: 1000
    })
  }
}

// 跳转到论坛首页
const goToForum = () => {
  router.push('/forum')
}

// 页面加载时获取数据
onMounted(() => {
  getUserInfo()
  loadUserPosts()
})
</script>

<style scoped>
.like-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.tabs-container {
  margin-bottom: 20px;
}

.welcome-banner {
  padding: 30px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  color: white;
}

.likes-banner {
  background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);
}

.favorites-banner {
  background: linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%);
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

.liked-posts-card, .favorited-posts-card {
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

.empty-likes, .empty-favorites {
  padding: 40px 0;
  text-align: center;
}

.liked-posts-list, .favorited-posts-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.post-card {
  cursor: pointer;
  transition: transform 0.2s;
  border-radius: 8px;
  position: relative;
  padding-top: 40px; /* 为按钮留出空间 */
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
  gap: 10px;
}

.stat-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.stat-icon {
  font-size: 16px;
}

.stat-icon.liked {
  color: #ff6b6b;
}

.action-button {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  padding: 2px 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.unlike-button, .unfavorite-button {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
}

.unlike-button .el-button {
  color: #ff6b6b;
  padding: 5px 10px;
}

.unfavorite-button .el-button {
  color: #ffc107;
  padding: 5px 10px;
}

.unlike-icon {
  color: #ff6b6b;
}

.unfavorite-icon {
  color: #ffc107;
}

.icon {
  font-size: 18px;
}
</style> 