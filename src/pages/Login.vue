<template>
    <div class="login-container">
        <div class="login-header">
            <div class="logo">KIUT</div>
            <h1>Вход в систему</h1>
            <p>Kimyo International University in Tashkent</p>
        </div>

        <div v-if="authStore.error" class="error-message">
            {{ authStore.error }}
        </div>

        <form @submit.prevent="handleLogin">
            <div class="form-group">
                <label class="form-label" for="username">Имя пользователя</label>
                <input type="text" id="username" v-model="username" class="form-input" required autocomplete="username"
                    :disabled="authStore.isLoading">
            </div>

            <div class="form-group">
                <label class="form-label" for="password">Пароль</label>
                <input type="password" id="password" v-model="password" class="form-input" required
                    autocomplete="current-password" :disabled="authStore.isLoading">
            </div>

            <button type="submit" class="btn-login" :disabled="authStore.isLoading">
                <span v-if="authStore.isLoading">
                    Вход <span class="loading"></span>
                </span>
                <span v-else>Войти</span>
            </button>
        </form>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')

onMounted(async () => {
    // Check if already authenticated
    if (await authStore.checkAuth()) {
        router.push('/')
    }
})

async function handleLogin() {
    authStore.clearError()

    const result = await authStore.login(username.value, password.value)

    if (result.success) {
        router.push('/')
    }
}
</script>

<style scoped>
.login-container {
    background: white;
    padding: 2.5rem;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    width: 100%;
    max-width: 400px;
    animation: fadeIn 0.5s ease;
}

.logo {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 32px;
    box-shadow: 0 4px 10px rgba(102, 126, 234, 0.3);
    margin: 0 auto 20px;
}

.login-header h1 {
    color: #667eea;
    font-size: 24px;
    margin-bottom: 5px;
}

.login-header p {
    color: #666;
    font-size: 14px;
}

.form-group {
    margin-bottom: 20px;
}

.form-label {
    display: block;
    color: #555;
    font-size: 14px;
    margin-bottom: 8px;
    font-weight: 500;
}

.form-input {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #e0e0e0;
    border-radius: 10px;
    font-size: 16px;
    transition: all 0.3s ease;
    background: #fafafa;
}

.form-input:focus {
    outline: none;
    border-color: #667eea;
    background: white;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn-login {
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.btn-login:hover:not(:disabled) {
    background: #764ba2;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.btn-login:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
}

.error-message {
    background: #fee;
    color: #c00;
    padding: 12px;
    border-radius: 8px;
    text-align: center;
    margin-bottom: 20px;
    font-size: 14px;
}

.loading {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    vertical-align: middle;
    margin-left: 10px;
}

@keyframes spin {
    0% { transform: rotate(0deg);}
    100% { transform: rotate(360deg);}
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px);}
    to { opacity: 1; transform: translateY(0);}
}
</style>
