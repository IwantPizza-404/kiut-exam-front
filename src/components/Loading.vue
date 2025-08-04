<template>
    <div class="loading-container">
        <div class="logo">KIUT</div>
        <div class="loading-spinner"></div>
        <p class="loading-text">Загрузка...</p>
    </div>
</template>

<script setup>
// No props or logic needed for this simple loading component
</script>

<style scoped>
.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    gap: 20px;
}

.logo {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #1976d2, #42a5f5);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 32px;
    box-shadow: 0 4px 10px rgba(25, 118, 210, 0.3);
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e3f2fd;
    border-top: 4px solid #1976d2;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.loading-text {
    color: #666;
    font-size: 16px;
    margin: 0;
}
</style>
