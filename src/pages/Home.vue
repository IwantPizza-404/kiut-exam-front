<template>
    <div class="container">
        <div class="auto-print-toggle">
            <label class="auto-print-label">Автоматическая печать</label>
            <div class="toggle-switch" :class="{ active: studentStore.autoPrint }"
                @click="studentStore.toggleAutoPrint()">
                <div class="toggle-slider"></div>
            </div>
        </div>

        <!-- Logout button -->
        <div class="logout-btn">
            <div v-if="authStore.user" class="user-info">
                <span class="username">{{ authStore.user.username }}</span>
                <span class="user-role">{{ authStore.user.role }}</span>
            </div>
            <button class="btn btn-logout" @click="handleLogout">
                Выйти
            </button>
        </div>

        <div class="header">
            <div class="logo">KIUT</div>
            <h1>KIUT Exam Control System</h1>
        </div>
        <p class="header-subtitle">Kimyo International University in Tashkent</p>

        <div class="connection-status">
            <span class="status-dot" :class="{
                connected: studentStore.isConnected,
                disconnected: !studentStore.isConnected
            }"></span>
            <span>
                {{ studentStore.isConnected ? 'Подключено' : 'Нет связи' }}
            </span>
            <button v-if="!studentStore.isConnected" class="btn btn-reconnect" @click="reconnect"
                :disabled="isReconnecting">
                {{ isReconnecting ? 'Соединение...' : 'Повторное подключение' }}
            </button>
        </div>

        <div v-if="studentStore.error" class="error-message">
            {{ studentStore.error }}
        </div>

        <div v-if="studentStore.successMessage" class="success-message">
            {{ studentStore.successMessage }}
        </div>

        <!-- Waiting status -->
        <div v-if="!studentStore.hasStudent" class="status">
            <div class="waiting-animation"></div>
            <p class="status-text">Ожидается студенческий карта...</p>
        </div>

        <!-- Student info -->
        <div v-if="studentStore.hasStudent" class="student-info">
            <div class="student-card">
                <div class="student-header">
                    <img class="student-photo" :src="studentStore.currentStudent.image" alt="Talaba rasmi"
                        @error="onImageError">
                    <div class="student-name">
                        <h2>{{ studentStore.currentStudent.fullname || 'Неизвестный студент' }}</h2>
                        <span class="rfid-badge">RFID: {{ studentStore.currentStudent.rfid }}</span>
                    </div>
                </div>

                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Название предмета</div>
                        <div class="info-value">{{ studentStore.currentStudent.subjectname || '-' }}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Дата экзамена</div>
                        <div class="info-value">{{ formatDate(studentStore.currentStudent.exam_date) || '-' }}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Время экзамена</div>
                        <div class="info-value">{{ studentStore.currentStudent.exam_time || '-' }}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Кабинет</div>
                        <div class="info-value">{{ studentStore.currentStudent.room || '-' }}</div>
                    </div>
                </div>
            </div>

            <div class="controls">
                <button class="btn btn-print" @click="studentStore.printStudent()"
                    :disabled="studentStore.isLoading || !studentStore.currentStudent.fullname">
                    {{ studentStore.isLoading ? 'Печать...' : 'Печать' }}
                </button>
                <button class="btn btn-hide" @click="studentStore.hideStudent()">
                    Очистить
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useStudentStore } from '@/stores/student'

const router = useRouter()
const authStore = useAuthStore()
const studentStore = useStudentStore()

const isReconnecting = ref(false)

onMounted(async () => {
    // Check authentication
    if (!(await authStore.checkAuth())) {
        router.push('/login')
        return
    }

    // Connect WebSocket
    studentStore.connectWebSocket()
})

onUnmounted(() => {
    studentStore.disconnectWebSocket()
})

async function handleLogout() {
    await authStore.logoutUser()
    studentStore.disconnectWebSocket()
    router.push('/login')
}

async function reconnect() {
    isReconnecting.value = true
    studentStore.connectWebSocket()

    setTimeout(() => {
        isReconnecting.value = false
    }, 2000)
}

function formatDate(dateStr) {
    return studentStore.formatDate(dateStr)
}

function onImageError(event) {
    event.target.src = 'https://via.placeholder.com/120x120/95a5a6/white?text=?'
}
</script>

<style scoped>
.container {
    background: white;
    padding: 2rem;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    width: 90%;
    max-width: 1200px;
    animation: fadeIn 0.5s ease;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #f0f0f0;
}

.logo {
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: bold;
    color: white;
}

.header h1 {
    color: #667eea;
    font-size: 26px;
}

.header-subtitle {
    color: #666;
    font-size: 14px;
    text-align: center;
    margin-top: -20px;
    margin-bottom: 20px;
}

.status {
    text-align: center;
    margin-bottom: 30px;
}

.waiting-animation {
    display: inline-block;
    width: 60px;
    height: 60px;
    border: 4px solid #e3f2fd;
    border-top: 4px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
}

@keyframes spin {
    0% { transform: rotate(0deg);}
    100% { transform: rotate(360deg);}
}

.student-info {
    background: white;
    border: 2px solid #e0e0e0;
    border-radius: 15px;
    padding: 2rem;
    margin-bottom: 2rem;
    animation: fadeIn 0.5s ease-in;
}

.student-header {
    display: flex;
    align-items: center;
    gap: 2rem;
    margin-bottom: 2rem;
}

.student-photo {
    width: 150px;
    height: 150px;
    border-radius: 15px;
    object-fit: cover;
    border: 3px solid #f0f0f0;
}

.student-name {
    font-size: 1.5rem;
    color: #333;
    font-weight: 600;
    margin-bottom: 0.5rem;
}

.rfid-badge {
    background: #667eea;
    color: white;
    padding: 5px 15px;
    border-radius: 20px;
    font-size: 14px;
    display: inline-block;
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-top: 20px;
}

.info-item {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 10px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    border: 1px solid #e3f2fd;
}

.info-label {
    color: #666;
    font-size: 12px;
    text-transform: uppercase;
    margin-bottom: 5px;
}

.info-value {
    color: #333;
    font-size: 16px;
    font-weight: 500;
}

.controls {
    margin-top: 30px;
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
    justify-content: center;
}

.btn {
    padding: 12px 30px;
    border: none;
    border-radius: 25px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
}

.btn-print {
    background: #2ecc71;
    color: white;
}

.btn-print:hover:not(:disabled) {
    background: #27ae60;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(46, 204, 113, 0.3);
}

.btn-hide {
    background: #e74c3c;
    color: white;
}

.btn-hide:hover {
    background: #c0392b;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(231, 76, 60, 0.3);
}

.btn-reconnect {
    background: #667eea;
    color: white;
    padding: 8px 20px;
    font-size: 14px;
}

.btn-reconnect:hover:not(:disabled) {
    background: #764ba2;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.btn-logout {
    background: #ff4757;
    color: white;
    padding: 8px 20px;
    font-size: 14px;
}

.btn-logout:hover {
    background: #ff3838;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 71, 87, 0.3);
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

.error-message {
    background: #fee;
    color: #c00;
    padding: 15px;
    border-radius: 10px;
    text-align: center;
    margin-bottom: 20px;
}

.success-message {
    background: #d4edda;
    color: #155724;
    padding: 15px;
    border-radius: 10px;
    text-align: center;
    margin-bottom: 20px;
}

.connection-status {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    font-size: 14px;
    margin-bottom: 20px;
}

.status-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #ccc;
}

.status-dot.connected {
    background: #2ecc71;
    animation: pulse 2s infinite;
}

.status-dot.disconnected {
    background: #e74c3c;
}

@keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(46, 204, 113, 0.4);}
    70% { box-shadow: 0 0 0 10px rgba(46, 204, 113, 0);}
    100% { box-shadow: 0 0 0 0 rgba(46, 204, 113, 0);}
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px);}
    to { opacity: 1; transform: translateY(0);}
}
</style>
