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
      <el-card v-for="post in filteredPosts" :key="post.id" class="post-card" shadow="hover" @click="viewPostDetail(post)">
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
            <i class="el-icon-star-off" style="margin-left: 10px;"></i> {{ post.likes }}
          </span>
        </div>
      </el-card>
      
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
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()

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
  return posts.value.filter(post => {
    const titleMatch = post.title.toLowerCase().includes(searchForm.title.toLowerCase()) || !searchForm.title
    const authorMatch = post.author.toLowerCase().includes(searchForm.author.toLowerCase()) || !searchForm.author
    const categoryMatch = post.category === searchForm.category || !searchForm.category
    return titleMatch && authorMatch && categoryMatch
  })
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
        category: '学习讨论',
        createTime: '2023-05-15 14:30',
        views: 120,
        likes: 15,
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
        category: '资源分享',
        createTime: '2023-05-14 10:15',
        views: 85,
        likes: 23,
        comments: [
          { id: 1, author: '感谢党', content: '谢谢分享，这个网站真的很棒！', time: '2023-05-14 11:30' }
        ]
      },
      {
        id: 3,
        title: '求助：Vue项目中路由配置问题',
        content: '我在Vue项目中配置路由时遇到了一个问题，当我尝试使用嵌套路由时，子路由无法正确显示，请问有人遇到过类似问题吗？...',
        author: '新手小白',
        category: '问题求助',
        createTime: '2023-05-13 16:45',
        views: 56,
        likes: 7,
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
        category: postForm.category,
        createTime: formattedDate,
        views: 0,
        likes: 0,
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
  router.push({
    path: '/forum/detail',
    query: { id: post.id }
  })
}

// 页面加载时获取数据
onMounted(() => {
  loadPosts()
})
</script>

<style scoped>
.forum-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
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

.post-card {
  cursor: pointer;
  transition: transform 0.2s;
  border-radius: 8px;
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

.empty-posts {
  margin-top: 40px;
}
</style>
