<template>
  <div class="forum-container">
    <!-- 渐变色欢迎Banner -->
    <div class="welcome-banner">
      <h1>学习交流论坛</h1>
      <p>在这里分享你的学习心得、提出问题、参与讨论，与同学们一起交流学习经验！</p>
    </div>
    
    <!-- 搜索区域 -->
    <div class="search-section">
      <el-card class="search-card">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="标题">
            <el-input v-model="searchForm.title" placeholder="请输入帖子标题" clearable />
          </el-form-item>
          <el-form-item label="作者">
            <el-input v-model="searchForm.author" placeholder="请输入作者名" clearable />
          </el-form-item>
          <el-form-item label="分类">
            <el-select v-model="searchForm.category" placeholder="请选择分类" clearable style="width: 160px;">
              <el-option v-for="item in categories" :key="item" :label="item" :value="item"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
    
    <!-- 发帖按钮 -->
    <div class="action-section">
      <el-button type="primary" icon="el-icon-edit" @click="openPostDialog">发布新帖</el-button>
    </div>
    
    <!-- 帖子列表 -->
    <div class="post-list">
      <div v-for="post in filteredPosts" :key="post.id" class="post-item">
        <div class="post-left">
          <div class="post-author-avatar">
            <el-avatar :size="50" :src="post.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'"></el-avatar>
          </div>
        </div>
        <div class="post-main" @click="viewPostDetail(post)">
          <div class="post-header">
            <div class="post-title-row">
              <el-tag size="small" :type="getCategoryType(post.category)" class="category-tag">{{ post.category }}</el-tag>
              <span class="post-title">{{ post.title }}</span>
            </div>
            <div class="post-author-info">
              <span class="post-author">{{ post.author }}</span>
              <span class="post-time">{{ post.createTime }}</span>
            </div>
          </div>
          <div class="post-content-preview">{{ post.content.substring(0, 100) }}{{ post.content.length > 100 ? '...' : '' }}</div>
          <div class="post-actions">
            <div class="post-stats">
              <span class="stat-item">
                <span class="stat-icon">👁️</span> {{ post.views }}
              </span>
              <span class="stat-item">
                <span class="stat-icon">💬</span> {{ post.comments.length }}
              </span>
              <span 
                class="stat-item like-btn" 
                :class="{ 'is-liked': post.isLiked }" 
                @click.stop="toggleLike(post)"
              >
                <span class="stat-icon" :class="{ 'is-liked': post.isLiked }">♥</span> {{ post.likes }}
              </span>
              <span 
                class="stat-item favorite-btn" 
                :class="{ 'is-favorited': post.isFavorited }" 
                @click.stop="toggleFavorite(post)"
              >
                <span class="stat-icon" :class="{ 'is-favorited': post.isFavorited }">★</span> {{ post.favorites || 0 }}
              </span>
            </div>
            <div class="post-admin-actions" v-if="isAdmin">
              <el-button 
                type="danger" 
                size="mini" 
                icon="el-icon-delete" 
                @click.stop="deletePost(post, $event)">删除</el-button>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="filteredPosts.length === 0" class="empty-posts">
        <el-empty description="暂无帖子"></el-empty>
      </div>
    </div>
    
    <!-- 发帖对话框 -->
    <el-dialog
      title="发布新帖"
      v-model="postDialogVisible"
      width="60%"
      :before-close="closePostDialog"
    >
      <el-form :model="postForm" :rules="postRules" ref="postFormRef" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="postForm.title" maxlength="50" show-word-limit placeholder="请输入帖子标题" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="postForm.category" placeholder="请选择分类" style="width: 100%;">
            <el-option v-for="item in categories" :key="item" :label="item" :value="item"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input v-model="postForm.content" type="textarea" :rows="8" maxlength="2000" show-word-limit placeholder="请输入帖子内容" />
        </el-form-item>
        <el-form-item label="作者" prop="author">
          <el-input v-model="postForm.author" maxlength="20" placeholder="请输入您的名字" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closePostDialog">取消</el-button>
        <el-button type="primary" @click="submitPost">发布</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { useBase } from '/$/base'

const router = useRouter()
const { user } = useBase()

// 判断当前用户是否为管理员
const isAdmin = ref(false)

// 当前用户名
const currentUser = ref('')

// 用户的收藏列表
const userFavorites = ref([])

// 用户的点赞列表
const userLikes = ref([])

// 检查用户权限
const checkUserRole = () => {
  // 从系统获取当前登录用户的角色
  isAdmin.value = user.info?.roleLabel === '管理员'
  
  // 从系统获取当前登录用户的用户名
  currentUser.value = user.info?.username || '游客'
  
  // 加载用户的收藏和点赞数据
  loadUserData()
}

// 加载用户数据
const loadUserData = () => {
  const storedFavorites = localStorage.getItem(`userFavorites_${currentUser.value}`)
  if (storedFavorites) {
    userFavorites.value = JSON.parse(storedFavorites)
  }
  
  const storedLikes = localStorage.getItem(`userLikes_${currentUser.value}`)
  if (storedLikes) {
    userLikes.value = JSON.parse(storedLikes)
  }
}

// 保存用户数据
const saveUserData = () => {
  localStorage.setItem(`userFavorites_${currentUser.value}`, JSON.stringify(userFavorites.value))
  localStorage.setItem(`userLikes_${currentUser.value}`, JSON.stringify(userLikes.value))
}

// 分类列表
const categories = ['学习讨论', '资源分享', '问题求助', '经验交流', '项目展示']

// 搜索表单
const searchForm = reactive({
  title: '',
  author: '',
  category: ''
})

// 帖子列表
const posts = ref([])

// 帖子表单
const postForm = reactive({
  title: '',
  category: '',
  content: '',
  author: ''
})

// 表单验证规则
const postRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }],
  author: [{ required: true, message: '请输入作者名', trigger: 'blur' }]
}

// 对话框可见性
const postDialogVisible = ref(false)
const postFormRef = ref(null)

// 过滤后的帖子列表
const filteredPosts = computed(() => {
  const filteredList = posts.value.filter(post => {
    const titleMatch = post.title.toLowerCase().includes(searchForm.title.toLowerCase()) || !searchForm.title
    const authorMatch = post.author.toLowerCase().includes(searchForm.author.toLowerCase()) || !searchForm.author
    const categoryMatch = post.category === searchForm.category || !searchForm.category
    return titleMatch && authorMatch && categoryMatch
  })
  
  // 添加用户交互状态
  return filteredList.map(post => ({
    ...post,
    isLiked: userLikes.value.includes(post.id),
    isFavorited: userFavorites.value.includes(post.id)
  }))
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

// 切换点赞状态
const toggleLike = (post) => {
  const index = userLikes.value.indexOf(post.id)
  
  // 获取最新的帖子数据
  const storedPosts = JSON.parse(localStorage.getItem('forumPosts'))
  const postInStorage = storedPosts.find(p => p.id === post.id)
  if (!postInStorage) return
  
  if (index === -1) {
    // 添加点赞
    userLikes.value.push(post.id)
    // 确保使用存储中的最新点赞数
    postInStorage.likes += 1
    post.likes = postInStorage.likes
    ElMessage({
      type: 'success',
      message: '点赞成功！',
      duration: 1000
    })
  } else {
    // 取消点赞
    userLikes.value.splice(index, 1)
    // 确保使用存储中的最新点赞数
    postInStorage.likes = Math.max(0, postInStorage.likes - 1)
    post.likes = postInStorage.likes
    ElMessage({
      type: 'info',
      message: '已取消点赞',
      duration: 1000
    })
  }
  post.isLiked = !post.isLiked
  
  // 更新本地存储
  saveUserData()
  localStorage.setItem('forumPosts', JSON.stringify(storedPosts))
}

// 切换收藏状态
const toggleFavorite = (post) => {
  const index = userFavorites.value.indexOf(post.id)
  
  // 获取最新的帖子数据
  const storedPosts = JSON.parse(localStorage.getItem('forumPosts'))
  const postInStorage = storedPosts.find(p => p.id === post.id)
  if (!postInStorage) return
  
  if (index === -1) {
    // 添加收藏
    userFavorites.value.push(post.id)
    // 确保使用存储中的最新收藏数
    postInStorage.favorites = (postInStorage.favorites || 0) + 1
    post.favorites = postInStorage.favorites
    ElMessage({
      type: 'success',
      message: '收藏成功！',
      duration: 1000
    })
  } else {
    // 取消收藏
    userFavorites.value.splice(index, 1)
    // 确保使用存储中的最新收藏数
    postInStorage.favorites = Math.max(0, (postInStorage.favorites || 0) - 1)
    post.favorites = postInStorage.favorites
    ElMessage({
      type: 'info',
      message: '已取消收藏',
      duration: 1000
    })
  }
  post.isFavorited = !post.isFavorited
  
  // 更新本地存储
  saveUserData()
  localStorage.setItem('forumPosts', JSON.stringify(storedPosts))
}

// 更新帖子数据到本地存储 - 不再需要，上面已直接更新
const updatePostInStorage = (post) => {
  // 此方法已在toggleLike和toggleFavorite中直接实现
  console.log('This method is deprecated')
}

// 加载帖子数据
const loadPosts = () => {
  const storedPosts = localStorage.getItem('forumPosts')
  if (storedPosts) {
    posts.value = JSON.parse(storedPosts)
  } else {
    // 初始化一些示例帖子
    const initialPosts = [
      {
        id: 1,
        title: '如何有效提高编程学习效率？',
        content: '最近在学习Vue.js，感觉进度有点慢，大家有什么好的学习方法可以分享吗？我尝试了番茄工作法，效果还不错，但是想知道有没有更好的方式...',
        author: '学习达人',
        avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
        category: '学习讨论',
        createTime: '2025-05-23 10:00',
        views: 120,
        likes: 15,
        favorites: 8,
        comments: [
          { id: 1, author: '编程高手', content: '建议多做项目实践，理论结合实践效果最好', time: '2023-05-15 15:20' },
          { id: 2, author: '老师', content: '可以试试pair programming，和同学一起学习效率会更高', time: '2023-05-15 16:45' }
        ]
      },
      {
        id: 2,
        title: '分享一个好用的学习资源网站',
        content: '最近发现了一个非常好的学习资源网站，里面有很多免费的编程教程和项目案例，对学习前端开发特别有帮助...',
        author: '资源达人',
        avatar: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png',
        category: '资源分享',
        createTime: '2023-05-14 10:15',
        views: 85,
        likes: 23,
        favorites: 12,
        comments: [
          { id: 1, author: '感谢党', content: '谢谢分享，这个网站真的很棒！', time: '2023-05-14 11:30' }
        ]
      },
      {
        id: 3,
        title: '求助：Vue项目中路由配置问题',
        content: '我在Vue项目中配置路由时遇到了一个问题，当我尝试使用嵌套路由时，子路由无法正确显示，请问有人遇到过类似问题吗？...',
        author: '新手小白',
        avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
        category: '问题求助',
        createTime: '2023-05-13 16:45',
        views: 56,
        likes: 7,
        favorites: 3,
        comments: []
      }
    ]
    posts.value = initialPosts
    localStorage.setItem('forumPosts', JSON.stringify(initialPosts))
  }
}

// 搜索处理
const handleSearch = () => {
  // 已通过计算属性实现过滤
}

// 重置搜索
const resetSearch = () => {
  searchForm.title = ''
  searchForm.author = ''
  searchForm.category = ''
}

// 打开发帖对话框
const openPostDialog = () => {
  // 设置默认作者为当前用户
  postForm.author = currentUser.value !== '游客' ? currentUser.value : ''
  postDialogVisible.value = true
}

// 关闭发帖对话框
const closePostDialog = () => {
  postDialogVisible.value = false
  postFormRef.value?.resetFields()
}

// 提交发帖
const submitPost = () => {
  postFormRef.value?.validate((valid) => {
    if (valid) {
      const now = new Date()
      const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      
      const newPost = {
        id: posts.value.length > 0 ? Math.max(...posts.value.map(p => p.id)) + 1 : 1,
        title: postForm.title,
        content: postForm.content,
        author: postForm.author,
        avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png', // 默认头像
        category: postForm.category,
        createTime: formattedDate,
        views: 0,
        likes: 0,
        favorites: 0,
        comments: []
      }
      
      posts.value.unshift(newPost)
      localStorage.setItem('forumPosts', JSON.stringify(posts.value))
      
      ElMessage({
        type: 'success',
        message: '发布成功！'
      })
      
      closePostDialog()
    } else {
      return false
    }
  })
}

// 查看帖子详情
const viewPostDetail = (post) => {
  // 增加浏览量
  post.views++
  updatePostInStorage(post)
  
  router.push({
    path: '/forum/detail',
    query: { id: post.id }
  })
}

// 删除帖子
const deletePost = (post, event) => {
  // 阻止事件冒泡，防止触发帖子点击事件
  event.stopPropagation()
  
  ElMessageBox.confirm('确定要删除这篇帖子吗？此操作不可恢复', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 从帖子列表中删除
    const index = posts.value.findIndex(p => p.id === post.id)
    if (index > -1) {
      posts.value.splice(index, 1)
      // 更新本地存储
      localStorage.setItem('forumPosts', JSON.stringify(posts.value))
      ElMessage({
        type: 'success',
        message: '帖子已删除'
      })
    }
  }).catch(() => {
    // 用户取消删除操作
  })
}

// 页面加载时获取数据
onMounted(() => {
  loadPosts()
  checkUserRole()
})
</script>

<style scoped>
.forum-container {
  padding: 20px;
  max-width: 90%;
  margin: 0 auto;
  height: 100%;
  overflow-y: auto;
  background-color: #f5f7fa;
}

.welcome-banner {
  background: linear-gradient(135deg, #42b983 0%, #33a06f 100%);
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

.search-section {
  margin-bottom: 20px;
}

.search-card {
  border-radius: 8px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
}

.action-section {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.post-item {
  display: flex;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s;
}

.post-item:hover {
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.post-left {
  width: 80px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-right: 1px solid #f0f0f0;
}

.post-author-avatar {
  margin-bottom: 10px;
}

.post-main {
  flex: 1;
  padding: 15px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.post-header {
  margin-bottom: 10px;
}

.post-title-row {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.category-tag {
  margin-right: 10px;
}

.post-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.post-author-info {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #909399;
}

.post-author {
  margin-right: 15px;
  font-weight: 500;
}

.post-content-preview {
  color: #606266;
  margin-bottom: 15px;
  line-height: 1.5;
  font-size: 14px;
}

.post-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.post-stats {
  display: flex;
  align-items: center;
  color: #909399;
  font-size: 14px;
}

.stat-item {
  display: inline-flex;
  align-items: center;
  margin-right: 15px;
  cursor: pointer;
}

.stat-icon {
  margin-right: 5px;
  font-size: 16px;
}

.like-btn, .favorite-btn {
  transition: all 0.3s;
}

.like-btn:hover {
  color: #ff6b6b;
}

.favorite-btn:hover {
  color: #ffc107;
}

.like-btn.is-liked {
  color: #ff6b6b;
}

.favorite-btn.is-favorited {
  color: #ffc107;
}

.like-btn .stat-icon.is-liked {
  color: #ff6b6b;
}

.favorite-btn .stat-icon.is-favorited {
  color: #ffc107;
}

.post-admin-actions {
  display: flex;
  gap: 10px;
}

.empty-posts {
  margin-top: 40px;
  background-color: #fff;
  padding: 30px;
  border-radius: 8px;
}
</style>
