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
    background: rgba(255, 255, 255, 0.98);
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    padding: 40px;
    width: 90%;
    max-width: 700px;
    backdrop-filter: blur(10px);
    position: relative;
}

.header {
    text-align: center;
    margin-bottom: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
}

.logo {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #1976d2, #42a5f5);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 24px;
    box-shadow: 0 4px 10px rgba(25, 118, 210, 0.3);
}

.header h1 {
    color: #1976d2;
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
    border-top: 4px solid #1976d2;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.status-text {
    color: #666;
    font-size: 18px;
}

.student-info {
    animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.student-card {
    background: linear-gradient(135deg, #f5f7fa 0%, #e3f2fd 100%);
    border-radius: 15px;
    padding: 30px;
    margin-bottom: 20px;
    border: 1px solid #bbdefb;
}

.student-header {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 25px;
}

.student-photo {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid white;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.student-name {
    flex: 1;
}

.student-name h2 {
    color: #333;
    font-size: 24px;
    margin-bottom: 5px;
}

.rfid-badge {
    background: #1976d2;
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
    background: white;
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
    background: #1976d2;
    color: white;
    padding: 8px 20px;
    font-size: 14px;
}

.btn-reconnect:hover:not(:disabled) {
    background: #1565c0;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(25, 118, 210, 0.3);
}

.btn-logout {
    background: #f44336;
    color: white;
    padding: 8px 20px;
    font-size: 14px;
}

.btn-logout:hover {
    background: #d32f2f;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(244, 67, 54, 0.3);
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

.auto-print-toggle {
    position: absolute;
    top: 20px;
    right: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
}

.logout-btn {
    position: absolute;
    top: 20px;
    left: 20px;
    display: flex;
    align-items: center;
    gap: 15px;
}

.user-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    font-size: 12px;
}

.username {
    font-weight: bold;
    color: #333;
}

.user-role {
    color: #666;
    text-transform: capitalize;
}

.toggle-switch {
    position: relative;
    width: 60px;
    height: 30px;
    background: #ccc;
    border-radius: 15px;
    cursor: pointer;
    transition: background 0.3s;
}

.toggle-switch.active {
    background: #2ecc71;
}

.toggle-slider {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 24px;
    height: 24px;
    background: white;
    border-radius: 50%;
    transition: transform 0.3s;
}

.toggle-switch.active .toggle-slider {
    transform: translateX(30px);
}

.error-message {
    background: #fee;
    color: #c33;
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
    0% {
        box-shadow: 0 0 0 0 rgba(46, 204, 113, 0.4);
    }

    70% {
        box-shadow: 0 0 0 10px rgba(46, 204, 113, 0);
    }

    100% {
        box-shadow: 0 0 0 0 rgba(46, 204, 113, 0);
    }
}

.auto-print-label {
    font-size: 14px;
    color: #666;
}
</style>
