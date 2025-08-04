import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useStudentStore = defineStore('student', () => {
  // Fake database
  const fakeDatabase = [
    {
      'fullname': 'BAHRIDDIN G\'AYBULLAYEV BAXTIYOROVICH',
      'rfid': '9AFD4B56',
      'subjectname': 'ADVANCED COMPUTER NETWORKS',
      'login': 'z9pt4uk',
      'password': '2ctwmd',
      'exam_date': '2025-07-12',
      'exam_time': '17:00',
      'room': 'C-201',
      'image': 'https://storage.kiut.uz/kiut-cabinet/student-photos/1746187712086-8a5fa831-b357-54c4-b350-fb18c1b0cc5e'
    },
    {
      'fullname': 'ROBIYAXON PO\'LATOVA MIZOM QIZI',
      'rfid': '5B612450',
      'subjectname': 'AESTHETIC COSMETOLOGY 1',
      'login': 'we3x4ha',
      'password': 'bgvwjsa',
      'exam_date': '2025-05-17',
      'exam_time': '15:00',
      'room': 'C-201',
      'image': 'https://storage.kiut.uz/kiut-cabinet/student-photos/1746190419627-3aea41f6-df80-54b0-bfaf-bf22a37c9158'
    },
    {
      'fullname': 'DILNOZA IBRAXIMOVA DAVLATYOR QIZI',
      'rfid': '2AC540BD',
      'subjectname': 'BIOLOGICAL CHEMISTRY 2',
      'login': '5txuh3',
      'password': 'tzck9d',
      'exam_date': '2025-10-10',
      'exam_time': '17:00',
      'room': 'C-201',
      'image': 'https://storage.kiut.uz/kiut-cabinet/student-photos/1746187670482-cbd6a465-2b8e-5a18-aace-0b18524eeb06'
    }
  ]

  // State
  const currentStudent = ref(null)
  const websocket = ref(null)
  const isConnected = ref(false)
  const autoPrint = ref(false)
  const isLoading = ref(false)
  const error = ref(null)
  const successMessage = ref(null)

  // Getters
  const hasStudent = computed(() => !!currentStudent.value)

  // Actions
  function connectWebSocket() {
    if (websocket.value) {
      websocket.value.close()
    }

    websocket.value = new WebSocket('ws://localhost:8000/ws')

    websocket.value.onopen = () => {
      console.log('WebSocket connected')
      isConnected.value = true
      error.value = null
    }

    websocket.value.onmessage = (event) => {
      console.log('WebSocket data:', event.data)
      try {
        const data = JSON.parse(event.data)
        console.log('Parsed data:', data)

        if (data.rfid) {
          handleRFID(data.rfid)
        } else if (data.message && typeof data.message === 'string') {
          handleRFID(data.message)
        } else if (typeof data === 'string') {
          handleRFID(data)
        }
      } catch (e) {
        console.log('JSON parse error, trying as string:', event.data)
        handleRFID(event.data)
      }
    }

    websocket.value.onclose = () => {
      console.log('WebSocket disconnected')
      isConnected.value = false
    }

    websocket.value.onerror = (error) => {
      console.error('WebSocket error:', error)
      setError('При подключении к серверу произошла ошибка')
      isConnected.value = false
    }
  }

  function disconnectWebSocket() {
    if (websocket.value) {
      websocket.value.close()
      websocket.value = null
    }
    isConnected.value = false
  }

  function handleRFID(rfid) {
    console.log('HandleRFID called with:', rfid)
    
    rfid = rfid.trim()
    const student = fakeDatabase.find(s => s.rfid === rfid)
    console.log('Student found:', student)

    if (student) {
      currentStudent.value = student
      clearMessages()
      
      if (autoPrint.value) {
        printStudent()
      }
    } else {
      currentStudent.value = {
        'fullname': '',
        'rfid': rfid,
        'subjectname': '',
        'login': '',
        'password': '',
        'exam_date': '',
        'exam_time': '',
        'room': '',
        'image': 'https://via.placeholder.com/120x120/95a5a6/white?text=?'
      }
      setError(`RFID: ${rfid} - Студент не найден`)
    }
  }

  async function printStudent() {
    if (!currentStudent.value || !currentStudent.value.fullname) {
      setError('Нет информации о студенте')
      return
    }

    isLoading.value = true

    try {
      const printData = {
        fullname: currentStudent.value.fullname,
        rfid: currentStudent.value.rfid,
        subjectname: currentStudent.value.subjectname,
        login: currentStudent.value.login,
        password: currentStudent.value.password,
        exam_date: currentStudent.value.exam_date,
        exam_time: currentStudent.value.exam_time,
        room: currentStudent.value.room
      }

      const response = await fetch('http://localhost:8000/print', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(printData)
      })

      if (response.ok) {
        setSuccess('Данные успешно напечатаны!')
      } else {
        throw new Error('Ошибка при печати')
      }
    } catch (err) {
      console.error('Print error:', err)
      setError('Ошибка при печати!')
    } finally {
      isLoading.value = false
    }
  }

  function hideStudent() {
    currentStudent.value = null
    clearMessages()
  }

  function toggleAutoPrint() {
    autoPrint.value = !autoPrint.value
  }

  function formatDate(dateStr) {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  function setError(message) {
    error.value = message
    successMessage.value = null
    setTimeout(() => {
      error.value = null
    }, 5000)
  }

  function setSuccess(message) {
    successMessage.value = message
    error.value = null
    setTimeout(() => {
      successMessage.value = null
    }, 3000)
  }

  function clearMessages() {
    error.value = null
    successMessage.value = null
  }

  return {
    // State
    currentStudent,
    websocket,
    isConnected,
    autoPrint,
    isLoading,
    error,
    successMessage,
    
    // Getters
    hasStudent,
    
    // Actions
    connectWebSocket,
    disconnectWebSocket,
    handleRFID,
    printStudent,
    hideStudent,
    toggleAutoPrint,
    formatDate,
    setError,
    setSuccess,
    clearMessages
  }
})
