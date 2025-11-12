class CampusBuzz {
    constructor() {
        this.token = localStorage.getItem('token');
        this.currentUser = null;
        this.posts = [];
        this.currentFilter = 'all';
        this.init();
    }

    async init() {
        if (!this.token) {
            window.location.href = '/login.html';
            return;
        }

        await this.loadCurrentUser();
        await this.loadTheme();
        await this.loadFeed();
        this.setupEventListeners();
        this.updateUI();
    }

    async apiCall(endpoint, options = {}) {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            },
            ...options
        };

        try {
            const response = await fetch(endpoint, config);
            const data = await response.json();
            
            if (!response.ok) {
                if (response.status === 401) {
                    this.logout();
                    throw new Error('Session expired');
                }
                throw new Error(data.error || 'Request failed');
            }
            
            return data;
        } catch (error) {
            this.showToast(error.message, 'error');
            throw error;
        }
    }

    async loadCurrentUser() {
    try {
        // Use the verify-token endpoint to get user data
        const data = await this.apiCall('/auth/verify-token');
        this.currentUser = data.user;
        this.updateUserInfo();
    } catch (error) {
        console.error('Failed to load user:', error);
        this.logout();
    }
}

    async decodeToken() {
        try {
            const response = await this.apiCall('/auth/verify', { method: 'GET' });
            return response.user;
        } catch (error) {
            throw new Error('Failed to verify token');
        }
    }

    updateUserInfo() {
        if (!this.currentUser) return;

        document.getElementById('userName').textContent = this.currentUser.name;
        document.getElementById('userDept').textContent = 
            `${this.currentUser.dept} • Year ${this.currentUser.year}`;
        document.getElementById('warningCount').textContent = this.currentUser.warning_count;

        if (this.currentUser.role === 'Admin') {
            document.body.classList.add('user-admin');
        }
    }

    async loadTheme() {
        try {
            const data = await this.apiCall('/theme/current');
            const banner = document.getElementById('themeBanner');
            const festivalName = document.getElementById('festivalName');
            const festivalDates = document.getElementById('festivalDates');

            if (data.active) {
                const theme = data.theme;
                banner.style.background = `linear-gradient(135deg, ${theme.primary_color}, ${theme.secondary_color})`;
                festivalName.textContent = theme.festival_name;
                festivalDates.textContent = 
                    `${new Date(theme.start_date).toLocaleDateString()} - ${new Date(theme.end_date).toLocaleDateString()}`;
                
                // Apply theme to CSS variables
                document.documentElement.style.setProperty('--primary-color', theme.primary_color);
                document.documentElement.style.setProperty('--secondary-color', theme.secondary_color);
            }
        } catch (error) {
            console.error('Failed to load theme:', error);
        }
    }

    async loadFeed() {
        try {
            const data = await this.apiCall('/posts/');
            this.posts = data;
            this.renderPosts();
            this.updateStats();
        } catch (error) {
            console.error('Failed to load feed:', error);
        }
    }

    renderPosts() {
        const container = document.getElementById('feedPosts');
        const filteredPosts = this.currentFilter === 'all' 
            ? this.posts 
            : this.posts.filter(post => post.emotion === this.currentFilter);

        if (filteredPosts.length === 0) {
            container.innerHTML = `
                <div class="no-posts">
                    <i class="fas fa-comments" style="font-size: 3rem; color: var(--text-secondary); margin-bottom: 1rem;"></i>
                    <h3>No posts found</h3>
                    <p>Be the first to share something with the campus community!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredPosts.map(post => this.createPostHTML(post)).join('');
    }

    createPostHTML(post) {
        const emotionClass = `emotion-${post.emotion.toLowerCase()}`;
        const timeAgo = this.getTimeAgo(new Date(post.created_at));
        
        return `
            <div class="post-card" data-post-id="${post.post_id}">
                <div class="post-header">
                    <div class="post-user">
                        <div class="user-avatar-small">
                            <i class="fas fa-user-circle"></i>
                        </div>
                        <div class="user-details">
                            <h4>${post.name}</h4>
                            <div class="post-meta">${timeAgo}</div>
                        </div>
                    </div>
                    <span class="post-emotion ${emotionClass}">${post.emotion}</span>
                </div>
                
                <div class="post-content">
                    <p>${this.escapeHTML(post.content)}</p>
                </div>
                
                ${post.image_path ? `
                    <div class="post-image">
                        <img src="${post.image_path}" alt="Post image" onerror="this.style.display='none'">
                    </div>
                ` : ''}
                
                <div class="post-actions-bar">
                    <button class="action-btn like-btn" onclick="app.likePost(${post.post_id})">
                        <i class="fas fa-heart"></i>
                        <span>Like</span>
                    </button>
                    <button class="action-btn comment-btn" onclick="app.toggleComments(${post.post_id})">
                        <i class="fas fa-comment"></i>
                        <span>Comment</span>
                    </button>
                    <button class="action-btn share-btn" onclick="app.sharePost(${post.post_id})">
                        <i class="fas fa-share"></i>
                        <span>Share</span>
                    </button>
                </div>
                
                <div class="comments-section" id="comments-${post.post_id}" style="display: none;">
                    <div class="comment-input">
                        <input type="text" id="comment-${post.post_id}" placeholder="Write a comment...">
                        <button onclick="app.addComment(${post.post_id})">Post</button>
                    </div>
                    <div class="comment-list" id="comment-list-${post.post_id}">
                        <!-- Comments will be loaded here -->
                    </div>
                </div>
            </div>
        `;
    }

    escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    getTimeAgo(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'Just now';
    }

    async createPost() {
        const content = document.getElementById('postContent').value.trim();
        const emotion = document.getElementById('postEmotion').value;
        const imageInput = document.getElementById('postImage');
        
        if (!content) {
            this.showToast('Please write something to post', 'warning');
            return;
        }

        const formData = new FormData();
        formData.append('content', content);
        formData.append('emotion', emotion);
        
        if (imageInput.files[0]) {
            formData.append('image', imageInput.files[0]);
        }

        try {
            const response = await fetch('/posts/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                },
                body: formData
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error);
            }

            this.showToast('Post created successfully!', 'success');
            document.getElementById('postContent').value = '';
            document.getElementById('postImage').value = '';
            document.getElementById('imagePreview').innerHTML = '';
            
            await this.loadFeed();
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    }

    async likePost(postId) {
        try {
            await this.apiCall('/react/like', {
                method: 'POST',
                body: JSON.stringify({ post_id: postId })
            });
            this.showToast('Post liked!', 'success');
        } catch (error) {
            console.error('Failed to like post:', error);
        }
    }

    async sharePost(postId) {
        try {
            await this.apiCall('/react/share', {
                method: 'POST',
                body: JSON.stringify({ post_id: postId })
            });
            this.showToast('Post shared!', 'success');
        } catch (error) {
            console.error('Failed to share post:', error);
        }
    }

    async addComment(postId) {
        const commentInput = document.getElementById(`comment-${postId}`);
        const comment = commentInput.value.trim();
        
        if (!comment) {
            this.showToast('Please write a comment', 'warning');
            return;
        }

        try {
            await this.apiCall('/react/comment', {
                method: 'POST',
                body: JSON.stringify({ 
                    post_id: postId, 
                    comment: comment 
                })
            });
            
            this.showToast('Comment added!', 'success');
            commentInput.value = '';
            this.toggleComments(postId); // Refresh comments
        } catch (error) {
            console.error('Failed to add comment:', error);
        }
    }

    toggleComments(postId) {
        const commentsSection = document.getElementById(`comments-${postId}`);
        const isVisible = commentsSection.style.display !== 'none';
        
        commentsSection.style.display = isVisible ? 'none' : 'block';
        
        if (!isVisible) {
            this.loadComments(postId);
        }
    }

    async loadComments(postId) {
        // This would typically call an API endpoint to get comments
        // For now, we'll just show a placeholder
        const commentList = document.getElementById(`comment-list-${postId}`);
        commentList.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i><p>Loading comments...</p></div>';
        
        // Simulate API call
        setTimeout(() => {
            commentList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No comments yet. Be the first to comment!</p>';
        }, 1000);
    }

    updateStats() {
        document.getElementById('totalPosts').textContent = this.posts.length;
        
        // Calculate active users (this would normally come from an API)
        const activeUsers = new Set(this.posts.map(post => post.user_id)).size;
        document.getElementById('activeUsers').textContent = activeUsers;
        
        this.updateEmotionTrends();
    }

    updateEmotionTrends() {
        const emotionCounts = {};
        this.posts.forEach(post => {
            emotionCounts[post.emotion] = (emotionCounts[post.emotion] || 0) + 1;
        });

        const trendsContainer = document.getElementById('emotionTrends');
        const sortedEmotions = Object.entries(emotionCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3);

        if (sortedEmotions.length === 0) {
            trendsContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No data yet</p>';
            return;
        }

        trendsContainer.innerHTML = sortedEmotions.map(([emotion, count]) => `
            <div class="trending-item">
                <span>${emotion}</span>
                <span class="count">${count}</span>
            </div>
        `).join('');
    }

    setupEventListeners() {
        // Post submission
        document.getElementById('submitPost').addEventListener('click', () => this.createPost());
        
        // Image preview
        document.getElementById('postImage').addEventListener('change', (e) => {
            this.previewImage(e.target);
        });

        // Emotion filters
        document.querySelectorAll('.emotion-filter').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.emotion-filter').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.emotion;
                this.renderPosts();
            });
        });

        // Navigation
        document.getElementById('logoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });

        document.getElementById('adminLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.showAdminModal();
        });

        // Modal close buttons
        document.querySelectorAll('.close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').style.display = 'none';
            });
        });

        // Admin tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchAdminTab(tabName);
            });
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }

    previewImage(input) {
        const preview = document.getElementById('imagePreview');
        preview.innerHTML = '';

        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                preview.appendChild(img);
            };
            reader.readAsDataURL(input.files[0]);
        }
    }

    switchAdminTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected tab
        document.getElementById(`${tabName}Tab`).classList.add('active');
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Load tab data
        if (tabName === 'users') this.loadUsers();
        if (tabName === 'posts') this.loadFlaggedPosts();
        if (tabName === 'themes') this.loadThemes();
    }

    async loadUsers() {
        try {
            const users = await this.apiCall('/admin/users');
            const container = document.getElementById('usersList');
            
            container.innerHTML = users.map(user => `
                <div class="admin-item">
                    <div class="user-details">
                        <h4>${user.name}</h4>
                        <p>${user.email} • ${user.dept} Year ${user.year}</p>
                        <p>Role: ${user.role} • Warnings: ${user.warning_count}</p>
                        <p>Status: ${user.is_active ? 'Active' : 'Inactive'} • Verified: ${user.is_verified ? 'Yes' : 'No'}</p>
                    </div>
                    <div class="admin-actions-buttons">
                        ${user.is_active ? 
                            `<button class="btn btn-deactivate" onclick="app.deactivateUser(${user.user_id})">Deactivate</button>` :
                            `<button class="btn btn-activate" onclick="app.activateUser(${user.user_id})">Activate</button>`
                        }
                        <button class="btn btn-warn" onclick="app.warnUser(${user.user_id})">Warn</button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Failed to load users:', error);
        }
    }

    async loadFlaggedPosts() {
        try {
            const posts = await this.apiCall('/admin/flagged-posts');
            const container = document.getElementById('flaggedPostsList');
            
            container.innerHTML = posts.map(post => `
                <div class="admin-item">
                    <div class="user-details">
                        <h4>${post.name} (${post.email})</h4>
                        <p>${post.content}</p>
                        <p>Posted: ${new Date(post.created_at).toLocaleString()}</p>
                    </div>
                    <div class="admin-actions-buttons">
                        <button class="btn btn-delete" onclick="app.deletePost(${post.post_id})">Delete</button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Failed to load flagged posts:', error);
        }
    }

    async loadThemes() {
        try {
            const themes = await this.apiCall('/admin/themes');
            const container = document.getElementById('themesList');
            
            container.innerHTML = themes.map(theme => `
                <div class="admin-item">
                    <div class="user-details">
                        <h4>${theme.festival_name}</h4>
                        <p>${new Date(theme.start_date).toLocaleDateString()} - ${new Date(theme.end_date).toLocaleDateString()}</p>
                        <p>Colors: ${theme.primary_color} / ${theme.secondary_color}</p>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Failed to load themes:', error);
        }
    }

    async deactivateUser(userId) {
        if (!confirm('Are you sure you want to deactivate this user?')) return;
        
        try {
            await this.apiCall('/admin/user/deactivate', {
                method: 'POST',
                body: JSON.stringify({ user_id: userId })
            });
            this.showToast('User deactivated', 'success');
            this.loadUsers();
        } catch (error) {
            console.error('Failed to deactivate user:', error);
        }
    }

    async activateUser(userId) {
        try {
            await this.apiCall('/admin/user/reactivate', {
                method: 'POST',
                body: JSON.stringify({ user_id: userId })
            });
            this.showToast('User activated', 'success');
            this.loadUsers();
        } catch (error) {
            console.error('Failed to activate user:', error);
        }
    }

    async warnUser(userId) {
        const reason = prompt('Enter warning reason:');
        if (!reason) return;
        
        try {
            await this.apiCall('/admin/user/warn', {
                method: 'POST',
                body: JSON.stringify({ 
                    user_id: userId, 
                    reason: reason 
                })
            });
            this.showToast('Warning issued', 'success');
            this.loadUsers();
        } catch (error) {
            console.error('Failed to warn user:', error);
        }
    }

    async deletePost(postId) {
        if (!confirm('Are you sure you want to delete this post?')) return;
        
        try {
            await this.apiCall('/admin/post/delete', {
                method: 'POST',
                body: JSON.stringify({ post_id: postId })
            });
            this.showToast('Post deleted', 'success');
            this.loadFlaggedPosts();
        } catch (error) {
            console.error('Failed to delete post:', error);
        }
    }

    showAdminModal() {
        document.getElementById('adminModal').style.display = 'block';
        this.switchAdminTab('users');
    }

    showAddThemeForm() {
        document.getElementById('themeModal').style.display = 'block';
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    logout() {
        localStorage.removeItem('token');
        window.location.href = '/login.html';
    }

    updateUI() {
        // Additional UI updates can go here
    }
}

// Global functions for HTML onclick handlers
function showCreatePost() {
    document.getElementById('postContent').focus();
}

function refreshFeed() {
    app.loadFeed();
}

function searchUsers() {
    // Implement user search
    const query = document.getElementById('userSearch').value;
    console.log('Searching for:', query);
}

// Initialize app
const app = new CampusBuzz();