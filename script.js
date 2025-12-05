// گرفتن عناصر HTML
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const difficultySelect = document.getElementById("difficulty-select");
const todayTaskList = document.getElementById("today-task-list");
const upcomingTaskList = document.getElementById("upcoming-task-list");
const currentDateElement = document.getElementById("current-date");
const calendarLink = document.getElementById("calendar-link");
const dayModal = document.getElementById("day-modal");
const calendarModal = document.getElementById("calendar-modal");
const closeButtons = document.querySelectorAll(".close");
const modalDateElement = document.getElementById("modal-date");
const modalTaskList = document.getElementById("modal-task-list");
const modalTaskForm = document.getElementById("modal-task-form");
const modalTaskInput = document.getElementById("modal-task-input");
const modalDifficultySelect = document.getElementById("modal-difficulty-select");
const modalTaskDate = document.getElementById("modal-task-date");
const currentMonthYearElement = document.getElementById("current-month-year");
const prevMonthButton = document.getElementById("prev-month");
const nextMonthButton = document.getElementById("next-month");
const calendarDaysElement = document.getElementById("calendar-days");
const fixCalendarBtn = document.getElementById("fix-calendar-btn");
const fixCalendarModal = document.getElementById("fix-calendar-modal");
const weekdaySelectorButtons = document.querySelectorAll(".weekday-selector button");

// گرفتن عناصر مودال‌های جدید
const editModal = document.getElementById("edit-modal");
const deleteModal = document.getElementById("delete-modal");
const editTaskForm = document.getElementById("edit-task-form");
const editTaskInput = document.getElementById("edit-task-input");
const editTaskDate = document.getElementById("edit-task-date");
const editDifficultySelect = document.getElementById("edit-difficulty-select");
const editTaskId = document.getElementById("edit-task-id");
const confirmDeleteBtn = document.getElementById("confirm-delete");
const cancelButtons = document.querySelectorAll(".cancel-btn");

// گرفتن عناصر جدید برای عادت‌ها
const habitCheckbox = document.getElementById("habit-checkbox");
const habitEndDateContainer = document.getElementById("habit-end-date-container");
const habitEndDateInput = document.getElementById("habit-end-date");
const habitTaskList = document.getElementById("habit-task-list");

// گرفتن عناصر جدید برای یادآوری
const reminderCheckbox = document.getElementById("reminder-checkbox");
const reminderTimeSelect = document.getElementById("reminder-time");
const reminderContainer = document.getElementById("reminder-container");
const modalReminderCheckbox = document.getElementById("modal-reminder-checkbox");
const modalReminderTimeSelect = document.getElementById("modal-reminder-time");
const modalReminderContainer = document.getElementById("modal-reminder-container");

// گرفتن عناصر جدید برای جستجو
const taskSearch = document.getElementById("task-search");
const clearSearchBtn = document.getElementById("clear-search");
const searchResultsContainer = document.getElementById("search-results-container");

// ---------- PWA Installation ----------
let deferredPrompt;
const installButton = document.createElement('button');

// ---------- تنظیمات تقویم فارسی - شروع هفته از شنبه ----------
moment.updateLocale('fa', {
  week: {
    dow: 6, // شنبه اولین روز هفته
    doy: 12
  }
});

// تاریخ امروز به شمسی
const today = moment().format('jYYYY/jMM/jDD');
let currentModalDate = today;
let currentCalendarDate = moment();
let currentTaskId = null;

// گرفتن تسک‌ها از LocalStorage یا ساختن آرایه خالی
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// گرفتن تنظیمات تقویم از LocalStorage
let calendarSettings = JSON.parse(localStorage.getItem("calendarSettings")) || {};

// متغیرهای نمودارها
let todayChart = null;
let weekChart = null;

// ---------- تابع‌های PWA ----------

// ایجاد دکمه نصب
function createInstallButton() {
  installButton.textContent = '📲 نصب برنامه';
  installButton.style.cssText = `
    position: fixed;
    bottom: 80px;
    right: 20px;
    background: #4caf50;
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 25px;
    font-family: 'DelbarBold', Arial, sans-serif;
    font-size: 14px;
    cursor: pointer;
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    display: none;
  `;
  
  installButton.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('کاربر برنامه را نصب کرد');
        installButton.style.display = 'none';
        
        // نمایش پیام تشکر
        const thankYouMsg = document.createElement('div');
        thankYouMsg.textContent = 'برنامه با موفقیت نصب شد!';
        thankYouMsg.style.cssText = `
          position: fixed;
          bottom: 150px;
          right: 20px;
          background: #521d67;
          color: white;
          padding: 10px 15px;
          border-radius: 10px;
          font-family: 'DelbarBold', Arial, sans-serif;
          z-index: 1000;
        `;
        document.body.appendChild(thankYouMsg);
        setTimeout(() => thankYouMsg.remove(), 3000);
      }
      deferredPrompt = null;
    }
  });
  
  document.body.appendChild(installButton);
}

// ردیابی رویداد beforeinstallprompt
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  // نمایش دکمه نصب بعد از 3 ثانیه
  setTimeout(() => {
    installButton.style.display = 'block';
  }, 3000);
  
  // مخفی کردن دکمه بعد از نصب
  window.addEventListener('appinstalled', () => {
    installButton.style.display = 'none';
    deferredPrompt = null;
    console.log('PWA نصب شد');
  });
});

// بررسی اگر برنامه از قبل نصب شده
if (window.matchMedia('(display-mode: standalone)').matches || 
    window.navigator.standalone === true) {
  console.log('برنامه به عنوان PWA نصب شده است');
  // می‌توانید استایل‌های خاص برای حالت نصب شده اعمال کنید
}

// ---------- Service Worker Registration ----------
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/persian-Bulletjournal/sw.js')
      .then(registration => {
        console.log('ServiceWorker ثبت شد با اسکوپ:', registration.scope);
      })
      .catch(error => {
        console.log('ثبت ServiceWorker با خطا مواجه شد:', error);
      });
  });
}

// ---------- بهبود نوتیفیکیشن ----------
function requestNotificationPermission() {
  if (!("Notification" in window)) {
    console.log("مرورگر از نوتیفیکیشن پشتیبانی نمی‌کند");
    return;
  }
  
  // اگر قبلاً مجوز داده شده
  if (Notification.permission === "granted") {
    console.log("مجوز نوتیفیکیشن قبلاً داده شده");
    return;
  }
  
  // اگر مجوز رد شده
  if (Notification.permission === "denied") {
    console.log("مجوز نوتیفیکیشن رد شده");
    return;
  }
  
  // درخواست مجوز با تأخیر برای تجربه بهتر کاربر
  setTimeout(() => {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        console.log("مجوز نوتیفیکیشن داده شد");
        
        // نمایش یک نوتیفیکیشن خوش‌آمدگویی
        setTimeout(() => {
          if (tasks.length === 0) { // فقط اگر هیچ کاری وجود ندارد
            new Notification("به BulletJournal خوش آمدید!", {
              body: "یادآوری کارهای شما فعال شد. می‌توانید برنامه را نیز نصب کنید.",
              icon: "icon.png",
              tag: "welcome"
            });
          }
        }, 1000);
      }
    });
  }, 2000); // 2 ثانیه تأخیر
}

// تابع بهبودیافته نمایش نوتیفیکیشن
function createNotification(task) {
  if (!("Notification" in window)) {
    return;
  }
  
  if (Notification.permission !== "granted") {
    requestNotificationPermission();
    return;
  }
  
  const reminderText = task.reminderTime === 0 ? "امروز" : 
                      `${task.reminderTime} روز دیگر`;
  
  const notification = new Notification("📝 یادآوری کار", {
    body: `کار "${task.text}" ${reminderText} موعد انجام دارد.`,
    icon: "icon.png",
    tag: task.id,
    requireInteraction: true,
    silent: false,
    vibrate: [200, 100, 200],
    badge: "icon.png"
  });
  
  // وقتی روی نوتیفیکیشن کلیک شد
  notification.onclick = function() {
    window.focus();
    showDayModal(task.date);
    notification.close();
  };
  
  // بسته شدن خودکار بعد از 10 ثانیه
  setTimeout(() => {
    notification.close();
  }, 10000);
}

// ---------- توابع اصلی برنامه ----------

// تابع برای تولید شناسه منحصر به فرد
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// تابع برای ذخیره تسک‌ها در LocalStorage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// تابع برای ذخیره تنظیمات تقویم در LocalStorage
function saveCalendarSettings() {
  localStorage.setItem("calendarSettings", JSON.stringify(calendarSettings));
}

// تابع برای نمایش تاریخ امروز
function renderCurrentDate() {
  const persianDate = moment().locale('fa').format('jYYYY/jMM/jDD');
  currentDateElement.textContent = `امروز: ${persianDate}`;
}

// تابع برای اعتبارسنجی تاریخ شمسی
function isValidJalaliDate(dateString) {
  if (!/^\d{4}\/\d{2}\/\d{2}$/.test(dateString)) return false;
  
  const parts = dateString.split('/');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  
  return true;
}

// تابع برای مرتب‌سازی تسک‌ها بر اساس سطح سختی
function sortTasksByDifficulty(taskList) {
  const difficultyOrder = { 'hard': 0, 'medium': 1, 'easy': 2 };
  return taskList.sort((a, b) => {
    return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
  });
}

// نمایش/پنهان کردن کادر تاریخ پایان بر اساس وضعیت چک‌باکس عادت
habitCheckbox.addEventListener("change", () => {
  habitEndDateContainer.style.display = habitCheckbox.checked ? "block" : "none";
  if (!habitCheckbox.checked) {
    habitEndDateInput.value = "";
  }
});

// تابع برای بررسی فعال بودن عادت
function isHabitActive(task) {
  if (!task.isHabit || !task.habitEndDate) return false;
  
  const endDate = moment(task.habitEndDate, 'jYYYY/jMM/jDD');
  const todayMoment = moment(today, 'jYYYY/jMM/jDD');
  
  return todayMoment.isSameOrBefore(endDate);
}

// تابع برای بررسی وضعیت عادت در یک تاریخ خاص
function isHabitCompletedOnDate(habit, date) {
  if (!habit.completedDates) return false;
  return habit.completedDates.includes(date);
}

// تابع برای تغییر وضعیت عادت در یک تاریخ خاص
function toggleHabitCompletion(habit, date) {
  const taskIndex = tasks.findIndex(t => t.id === habit.id);
  if (taskIndex === -1) return;
  
  if (!tasks[taskIndex].completedDates) {
    tasks[taskIndex].completedDates = [];
  }
  
  const dateIndex = tasks[taskIndex].completedDates.indexOf(date);
  
  if (dateIndex === -1) {
    tasks[taskIndex].completedDates.push(date);
  } else {
    tasks[taskIndex].completedDates.splice(dateIndex, 1);
  }
  
  saveTasks();
  renderTasks();
  updateAllProgressCharts();
}

// تابع برای نمایش تسک‌ها در صفحه
function renderTasks() {
  todayTaskList.innerHTML = "";
  upcomingTaskList.innerHTML = "";
  habitTaskList.innerHTML = "";

  // جدا کردن عادت‌ها از کارهای معمولی
  const habitTasks = tasks.filter(task => task.isHabit && isHabitActive(task));
  const normalTodayTasks = tasks.filter(task => 
    task.date === today && (!task.isHabit || !isHabitActive(task))
  );
  
  const upcomingTasks = tasks.filter(task => {
    if (!isValidJalaliDate(task.date)) return false;
    
    const taskDateMoment = moment(task.date, 'jYYYY/jMM/jDD');
    const todayMoment = moment(today, 'jYYYY/jMM/jDD');
    
    return task.date > today && taskDateMoment.diff(todayMoment, 'days') <= 10;
  });

  // نمایش عادت‌ها
  habitTasks.forEach(task => {
    const li = createTaskElement(task, false, true);
    habitTaskList.appendChild(li);
  });

  // نمایش کارهای معمولی امروز
  const sortedTodayTasks = sortTasksByDifficulty(normalTodayTasks);
  sortedTodayTasks.forEach(task => {
    const li = createTaskElement(task);
    todayTaskList.appendChild(li);
  });

  // نمایش کارهای آینده
  const sortedUpcomingTasks = sortTasksByDifficulty(upcomingTasks);
  sortedUpcomingTasks.forEach(task => {
    const li = createTaskElement(task, true);
    upcomingTaskList.appendChild(li);
  });
}

// تابع برای ایجاد المان تسک
function createTaskElement(task, isUpcoming = false, isHabit = false) {
  const li = document.createElement("li");
  li.classList.add("task-item");
  
  if (isHabit && isHabitCompletedOnDate(task, today)) {
    li.classList.add("completed");
  } else if (!isHabit && task.completed) {
    li.classList.add("completed");
  }
  
  if (isUpcoming) li.classList.add("upcoming-task");
  if (isHabit) li.classList.add("habit-task");
  
  // نقطه رنگی نشان‌دهنده سطح سختی یا عادت
  const difficultyDot = document.createElement("div");
  difficultyDot.classList.add("difficulty-dot");
  
  if (isHabit) {
    difficultyDot.classList.add("habit-dot");
  } else {
    switch(task.difficulty) {
      case 'hard':
        difficultyDot.classList.add("hard-difficulty");
        break;
      case 'medium':
        difficultyDot.classList.add("medium-difficulty");
        break;
      case 'easy':
        difficultyDot.classList.add("easy-difficulty");
        break;
    }
  }
  
  // متن تسک
  const taskText = document.createElement("div");
  taskText.classList.add("task-text");
  taskText.textContent = task.text;
  
  // دکمه‌های عمل
  const actionsDiv = document.createElement("div");
  actionsDiv.classList.add("task-actions");
  
  // دکمه ویرایش
  const editBtn = document.createElement("button");
  editBtn.classList.add("action-btn", "edit-btn");
  editBtn.innerHTML = "✏️";
  editBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    editTask(task.id);
  });
  
  // دکمه حذف
  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("action-btn", "delete-btn");
  deleteBtn.innerHTML = "✕";
  deleteBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    deleteTask(task.id);
  });
  
  actionsDiv.appendChild(editBtn);
  actionsDiv.appendChild(deleteBtn);
  
  // تاریخ تسک و لینک تقویم (برای تسک‌های آینده)
  if (isUpcoming) {
    const taskDate = document.createElement("span");
    taskDate.classList.add("task-date");
    taskDate.textContent = task.date;
    
    const calendarLink = document.createElement("a");
    calendarLink.classList.add("calendar-link");
    calendarLink.href = "#";
    calendarLink.innerHTML = "📅";
    calendarLink.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      showDayModal(task.date);
    });
    
    actionsDiv.appendChild(calendarLink);
    li.appendChild(taskDate);
  }
  
  li.appendChild(difficultyDot);
  li.appendChild(actionsDiv);
  li.appendChild(taskText);
  
  // وقتی روی متن کلیک می‌کنیم -> وضعیت تغییر کنه
  taskText.addEventListener("click", () => {
    if (isHabit) {
      toggleHabitCompletion(task, today);
    } else {
      const taskIndex = tasks.findIndex(t => t.id === task.id);
      if (taskIndex !== -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        saveTasks();
        renderTasks();
        updateAllProgressCharts();
      }
    }
  });
  
  return li;
}

// تابع برای ویرایش تسک
function editTask(taskId) {
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) return;
  
  showEditModal(tasks[taskIndex]);
}

// تابع برای حذف تسک
function deleteTask(taskId) {
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) return;
  
  const taskDate = tasks[taskIndex].date;
  showDeleteModal(tasks[taskIndex], taskDate);
}

// تابع برای نمایش مودال ویرایش
function showEditModal(task) {
  editTaskInput.value = task.text;
  editTaskDate.value = task.date;
  editDifficultySelect.value = task.difficulty;
  editTaskId.value = task.id;
  currentTaskId = task.id;
  editModal.style.display = "block";
}

// تابع برای نمایش مودال حذف
function showDeleteModal(task, taskDate) {
  currentTaskId = task.id;
  currentModalDate = taskDate;
  deleteModal.style.display = "block";
}

// تابع برای نمایش مودال روز
function showDayModal(date) {
  currentModalDate = date;
  modalTaskDate.value = date;
  modalReminderCheckbox.checked = false;
  modalReminderContainer.style.display = "none";
  
  const persianDate = moment(date, 'jYYYY/jMM/jDD').locale('fa').format('jYYYY/jMM/jDD');
  modalDateElement.textContent = `تسک‌های تاریخ ${persianDate}`;
  modalTaskList.innerHTML = "";
  
  const dayTasks = tasks.filter(task => {
    if (task.date === date) return true;
    
    if (task.isHabit && task.habitEndDate) {
      const endDate = moment(task.habitEndDate, 'jYYYY/jMM/jDD');
      const selectedDate = moment(date, 'jYYYY/jMM/jDD');
      return selectedDate.isSameOrBefore(endDate);
    }
    
    return false;
  });
  
  const sortedDayTasks = sortTasksByDifficulty(dayTasks);
  
  // ایجاد بخش جداگانه برای عادت‌ها
  const habitTasks = sortedDayTasks.filter(task => task.isHabit);
  const normalTasks = sortedDayTasks.filter(task => !task.isHabit);
  
  // نمایش عادت‌ها
  if (habitTasks.length > 0) {
    const habitHeader = document.createElement("li");
    habitHeader.classList.add("task-item");
    habitHeader.innerHTML = `<div style="text-align: center; width: 100%; font-weight: bold; color: #2196f3;">عادت‌ها</div>`;
    habitHeader.style.backgroundColor = "#e3f2fd";
    habitHeader.style.cursor = "default";
    modalTaskList.appendChild(habitHeader);
    
    habitTasks.forEach((task, index) => {
      const li = createModalTaskElement(task, date, true);
      modalTaskList.appendChild(li);
    });
  }
  
  // نمایش کارهای معمولی
  if (normalTasks.length > 0) {
    const normalHeader = document.createElement("li");
    normalHeader.classList.add("task-item");
    normalHeader.innerHTML = `<div style="text-align: center; width: 100%; font-weight: bold; color: #4caf50;">کارهای این روز</div>`;
    normalHeader.style.backgroundColor = "#e8f5e9";
    normalHeader.style.cursor = "default";
    modalTaskList.appendChild(normalHeader);
    
    normalTasks.forEach((task, index) => {
      const li = createModalTaskElement(task, date, false);
      modalTaskList.appendChild(li);
    });
  }
  
  // اگر هیچ تسکی وجود ندارد
  if (sortedDayTasks.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.classList.add("task-item");
    emptyMessage.innerHTML = `<div style="text-align: center; width: 100%; color: #888;">هیچ کاری برای این تاریخ ثبت نشده است</div>`;
    emptyMessage.style.backgroundColor = "#f5f5f5";
    emptyMessage.style.cursor = "default";
    modalTaskList.appendChild(emptyMessage);
  }
  
  dayModal.style.display = "block";
  calendarModal.style.display = "none";
}

// تابع کمکی برای ایجاد المان تسک در مودال
function createModalTaskElement(task, date, isHabit) {
  const li = document.createElement("li");
  li.classList.add("task-item");
  
  if (isHabit && isHabitCompletedOnDate(task, date)) {
    li.classList.add("completed");
  } else if (!isHabit && task.completed) {
    li.classList.add("completed");
  }
  
  if (isHabit) li.classList.add("habit-task");
  
  // نقطه رنگی نشان‌دهنده سطح سختی یا عادت
  const difficultyDot = document.createElement("div");
  difficultyDot.classList.add("difficulty-dot");
  
  if (isHabit) {
    difficultyDot.classList.add("habit-dot");
  } else {
    switch(task.difficulty) {
      case 'hard':
        difficultyDot.classList.add("hard-difficulty");
        break;
      case 'medium':
        difficultyDot.classList.add("medium-difficulty");
        break;
      case 'easy':
        difficultyDot.classList.add("easy-difficulty");
        break;
    }
  }
  
  const taskText = document.createElement("div");
  taskText.classList.add("task-text");
  taskText.textContent = task.text;
  
  const actionsDiv = document.createElement("div");
  actionsDiv.classList.add("task-actions");
  
  const editBtn = document.createElement("button");
  editBtn.classList.add("action-btn", "edit-btn");
  editBtn.innerHTML = "✏️";
  editBtn.addEventListener("click", () => {
    editTask(task.id);
  });
  
  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("action-btn", "delete-btn");
  deleteBtn.innerHTML = "✕";
  deleteBtn.addEventListener("click", () => {
    deleteTask(task.id);
  });
  
  actionsDiv.appendChild(editBtn);
  actionsDiv.appendChild(deleteBtn);
  
  taskText.addEventListener("click", () => {
    if (isHabit) {
      toggleHabitCompletion(task, date);
      showDayModal(date);
    } else {
      const taskIndex = tasks.findIndex(t => t.id === task.id);
      if (taskIndex !== -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        saveTasks();
        showDayModal(date);
        updateAllProgressCharts();
      }
    }
  });
  
  li.appendChild(difficultyDot);
  li.appendChild(taskText);
  li.appendChild(actionsDiv);
  
  return li;
}

// تابع برای نمایش تقویم
function renderCalendar() {
  const startOfMonth = moment(currentCalendarDate).startOf('jMonth');
  const endOfMonth = moment(currentCalendarDate).endOf('jMonth');
  const daysInMonth = endOfMonth.jDate();
  
  const monthKey = currentCalendarDate.format('jYYYY-jMM');
  const startDay = calendarSettings[monthKey] !== undefined ? 
                  calendarSettings[monthKey] : startOfMonth.day();
  
  currentMonthYearElement.textContent = currentCalendarDate.locale('fa').format('jMMMM jYYYY');
  calendarDaysElement.innerHTML = "";
  
  const weekdays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
  weekdays.forEach(day => {
    const dayElement = document.createElement("div");
    dayElement.classList.add("calendar-day", "weekday");
    dayElement.textContent = day;
    calendarDaysElement.appendChild(dayElement);
  });
  
  for (let i = 0; i < startDay; i++) {
    const emptyDay = document.createElement("div");
    emptyDay.classList.add("calendar-day", "empty");
    calendarDaysElement.appendChild(emptyDay);
  }
  
  for (let i = 1; i <= daysInMonth; i++) {
    const dayElement = document.createElement("div");
    dayElement.classList.add("calendar-day");
    
    const currentDate = moment(currentCalendarDate).startOf('jMonth').add(i - 1, 'days').format('jYYYY/jMM/jDD');
    
    if (currentDate === today) {
      dayElement.classList.add("today");
    }
    
    dayElement.textContent = i;
    
    const dayTasks = tasks.filter(task => task.date === currentDate);
    if (dayTasks.length > 0) {
      dayElement.classList.add("has-tasks");
      
      const tasksPreview = document.createElement("div");
      tasksPreview.classList.add("day-tasks");
      
      const taskText = dayTasks[0].text;
      tasksPreview.textContent = taskText.length > 7 
        ? taskText.substring(0, 7) + '...' 
        : taskText;
        
      dayElement.appendChild(tasksPreview);
    }
    
    const dayTasksWithReminder = tasks.filter(task => 
      task.date === currentDate && task.reminderEnabled
    );
    
    if (dayTasksWithReminder.length > 0) {
      dayElement.classList.add("has-reminder");
      
      const reminderIcon = document.createElement("div");
      reminderIcon.classList.add("reminder-icon");
      reminderIcon.innerHTML = "🔔";
      reminderIcon.style.position = "absolute";
      reminderIcon.style.top = "5px";
      reminderIcon.style.left = "5px";
      reminderIcon.style.fontSize = "10px";
      
      dayElement.appendChild(reminderIcon);
    }
    
    dayElement.addEventListener("click", () => {
      showDayModal(currentDate);
    });
    
    dayElement.addEventListener("mouseover", () => {
      dayElement.style.backgroundColor = "#ffebee";
    });
    
    dayElement.addEventListener("mouseout", () => {
      if (currentDate !== today) {
        dayElement.style.backgroundColor = "";
      }
    });
    
    calendarDaysElement.appendChild(dayElement);
  }
}

// تابع برای ایجاد نمودار دایره‌ای
function createProgressChart(canvasId, progress, color) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [progress, 100 - progress],
        backgroundColor: [color, '#e0e0e0'],
        borderWidth: 0
      }]
    },
    options: {
      cutout: '70%',
      responsive: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: false
        }
      }
    }
  });
}

// تابع برای به‌روزرسانی نمودارهای پیشرفت
function updateProgressCharts() {
  const todayTasks = tasks.filter(task => 
    task.date === today || (task.isHabit && isHabitActive(task))
  );
  
  const completedToday = todayTasks.filter(task => {
    if (task.isHabit) {
      return isHabitCompletedOnDate(task, today);
    } else {
      return task.completed;
    }
  }).length;
  
  const todayProgress = todayTasks.length > 0 ? Math.round((completedToday / todayTasks.length) * 100) : 0;
  
  const todayMoment = moment(today, 'jYYYY/jMM/jDD');
  const weekStart = todayMoment.clone().startOf('week');
  const weekEnd = todayMoment.clone().endOf('week');
  
  const weekTasks = tasks.filter(task => {
    if (!isValidJalaliDate(task.date)) return false;
    
    const taskDate = moment(task.date, 'jYYYY/jMM/jDD');
    
    const isInThisWeek = taskDate.isSameOrAfter(weekStart) && taskDate.isSameOrBefore(weekEnd);
    
    if (task.isHabit && task.habitEndDate) {
      const habitEndDate = moment(task.habitEndDate, 'jYYYY/jMM/jDD');
      const isHabitActiveInWeek = weekStart.isSameOrBefore(habitEndDate);
      return isHabitActiveInWeek;
    }
    
    return isInThisWeek;
  });
  
  const completedWeek = weekTasks.filter(task => {
    if (task.isHabit) {
      if (!task.completedDates) return false;
      
      const completedInWeek = task.completedDates.filter(date => {
        const completedDate = moment(date, 'jYYYY/jMM/jDD');
        return completedDate.isSameOrAfter(weekStart) && completedDate.isSameOrBefore(weekEnd);
      });
      
      return completedInWeek.length > 0;
    } else {
      return task.completed;
    }
  }).length;
  
  const weekProgress = weekTasks.length > 0 ? Math.round((completedWeek / weekTasks.length) * 100) : 0;
  
  document.getElementById('today-progress-text').textContent = `${todayProgress}%`;
  document.getElementById('week-progress-text').textContent = `${weekProgress}%`;
  
  if (todayChart) todayChart.destroy();
  if (weekChart) weekChart.destroy();
  
  todayChart = createProgressChart('today-chart', todayProgress, '#4caf50');
  weekChart = createProgressChart('week-chart', weekProgress, '#ff9800');
}

// تابع برای محاسبه پیشرفت عادت
function calculateHabitProgress(habit) {
  const startDate = moment(habit.date, 'jYYYY/jMM/jDD');
  const endDate = moment(habit.habitEndDate, 'jYYYY/jMM/jDD');
  const today = moment();
  
  const totalDays = endDate.diff(startDate, 'days') + 1;
  const daysPassed = Math.min(today.diff(startDate, 'days') + 1, totalDays);
  const daysCompleted = habit.completedDates ? habit.completedDates.length : 0;
  const progressPercentage = Math.round((daysCompleted / daysPassed) * 100);
  
  return {
    daysPassed,
    daysCompleted,
    progressPercentage,
    totalDays,
    startDate: startDate.format('jYYYY/jMM/jDD'),
    endDate: endDate.format('jYYYY/jMM/jDD')
  };
}

// تابع برای ایجاد المان نمودار عادت
function createHabitChartElement(habit, progress) {
  const chartItem = document.createElement('div');
  chartItem.classList.add('habit-chart-item');
  
  const habitHeader = document.createElement('div');
  habitHeader.classList.add('habit-chart-header');
  
  const habitName = document.createElement('div');
  habitName.classList.add('habit-chart-name');
  habitName.textContent = habit.text;
  
  const habitDates = document.createElement('div');
  habitDates.classList.add('habit-chart-dates');
  habitDates.textContent = `از ${progress.startDate} تا ${progress.endDate}`;
  
  habitHeader.appendChild(habitName);
  habitHeader.appendChild(habitDates);
  
  const habitStats = document.createElement('div');
  habitStats.classList.add('habit-chart-stats');
  
  const completedStats = document.createElement('span');
  completedStats.textContent = `انجام شده: ${progress.daysCompleted} روز`;
  
  const totalStats = document.createElement('span');
  totalStats.textContent = `کل روزها: ${progress.daysPassed} روز`;
  
  const percentageStats = document.createElement('span');
  percentageStats.textContent = `پیشرفت: ${progress.progressPercentage}%`;
  percentageStats.style.color = '#2196f3';
  percentageStats.style.fontWeight = 'bold';
  
  habitStats.appendChild(completedStats);
  habitStats.appendChild(totalStats);
  habitStats.appendChild(percentageStats);
  
  const habitProgressContainer = document.createElement('div');
  habitProgressContainer.classList.add('habit-chart-progress');
  
  const progressBarContainer = document.createElement('div');
  progressBarContainer.classList.add('habit-chart-bar-container');
  
  const progressBarFill = document.createElement('div');
  progressBarFill.classList.add('habit-chart-bar-fill');
  progressBarFill.style.width = `${progress.progressPercentage}%`;
  
  const progressBarText = document.createElement('div');
  progressBarText.classList.add('habit-chart-bar-text');
  progressBarText.textContent = `${progress.progressPercentage}%`;
  
  progressBarFill.appendChild(progressBarText);
  progressBarContainer.appendChild(progressBarFill);
  habitProgressContainer.appendChild(progressBarContainer);
  
  chartItem.appendChild(habitHeader);
  chartItem.appendChild(habitStats);
  chartItem.appendChild(habitProgressContainer);
  
  return chartItem;
}

// تابع برای به‌روزرسانی نمودارهای پیشرفت عادت‌ها
function updateHabitsProgressCharts() {
  const habitsChartsContainer = document.getElementById('habits-charts-container');
  habitsChartsContainer.innerHTML = '';
  
  const activeHabits = tasks.filter(task => task.isHabit && isHabitActive(task));
  
  if (activeHabits.length === 0) {
    const emptyMessage = document.createElement('div');
    emptyMessage.classList.add('habits-empty-state');
    emptyMessage.innerHTML = `
      <div>📋</div>
      <div>هیچ عادت فعالی وجود ندارد</div>
      <div style="font-size: 12px; margin-top: 8px;">برای افزودن عادت جدید، گزینه "عادت" را در فرم بالا انتخاب کنید</div>
    `;
    habitsChartsContainer.appendChild(emptyMessage);
    return;
  }
  
  activeHabits.forEach(habit => {
    const habitProgress = calculateHabitProgress(habit);
    const chartItem = createHabitChartElement(habit, habitProgress);
    habitsChartsContainer.appendChild(chartItem);
  });
}

// تابع برای به‌روزرسانی همه نمودارها
function updateAllProgressCharts() {
  updateProgressCharts();
  updateHabitsProgressCharts();
  renderTasks();
}

// ---------- توابع یادآوری ----------

// تابع برای بررسی و نمایش نوتیفیکیشن‌ها
function checkAndShowReminders() {
  const now = moment();
  const todayFormatted = now.format('jYYYY/jMM/jDD');
  
  tasks.forEach(task => {
    if (task.reminderEnabled && task.reminderTime !== undefined) {
      const taskDate = moment(task.date, 'jYYYY/jMM/jDD');
      const daysDiff = taskDate.diff(now, 'days');
      
      // فقط برای کارهای آینده یادآوری بده (امروز و روزهای بعد)
      if (daysDiff >= 0 && daysDiff <= task.reminderTime) {
        // بررسی آیا قبلاً این یادآوری نمایش داده شده
        if (!task.reminderShown || task.reminderShown !== todayFormatted) {
          createNotification(task);
          
          // علامت گذاری که این یادآوری امروز نمایش داده شده
          const taskIndex = tasks.findIndex(t => t.id === task.id);
          if (taskIndex !== -1) {
            tasks[taskIndex].reminderShown = todayFormatted;
            saveTasks();
          }
        }
      }
    }
  });
}

// تابع برای بررسی روزانه یادآوری‌ها
function setupDailyReminderCheck() {
  checkAndShowReminders();
  
  // بررسی هر 12 ساعت (برای تست)
  setInterval(checkAndShowReminders, 12 * 60 * 60 * 1000);
}

// نمایش/پنهان کردن بخش یادآوری بر اساس تاریخ تسک
taskInput.addEventListener('change', toggleReminderSection);
difficultySelect.addEventListener('change', toggleReminderSection);

modalTaskInput.addEventListener('change', toggleModalReminderSection);
modalDifficultySelect.addEventListener('change', toggleModalReminderSection);

taskInput.addEventListener('input', toggleReminderSection);
modalTaskInput.addEventListener('input', toggleModalReminderSection);

function toggleReminderSection() {
  const taskDateText = taskInput.value;
  
  if (!taskDateText || !isValidJalaliDate(taskDateText)) {
    reminderContainer.style.display = 'none';
    reminderCheckbox.checked = false;
    return;
  }
  
  const taskDate = moment(taskDateText, 'jYYYY/jMM/jDD');
  const today = moment();
  
  if (taskDate.isAfter(today, 'day')) {
    reminderContainer.style.display = 'block';
  } else {
    reminderContainer.style.display = 'none';
    reminderCheckbox.checked = false;
  }
}

function toggleModalReminderSection() {
  const taskDate = moment(modalTaskInput.value, 'jYYYY/jMM/jDD', true);
  const today = moment();
  
  if (taskDate.isValid() && taskDate.isAfter(today)) {
    modalReminderContainer.style.display = 'block';
  } else {
    modalReminderContainer.style.display = 'none';
    modalReminderCheckbox.checked = false;
  }
}

// ---------- توابع جستجو ----------

// تابع جستجو در تمام تسک‌ها و تقویم
function searchAllTasks(searchTerm) {
  if (!searchTerm.trim()) {
    return [];
  }
  
  const searchTermLower = searchTerm.toLowerCase();
  const results = [];
  
  tasks.forEach(task => {
    if (task.text.toLowerCase().includes(searchTermLower)) {
      results.push({
        type: 'task',
        task: task,
        match: 'text'
      });
    }
  });
  
  return results;
}

// تابع برای ایجاد المان نتیجه جستجو
function createSearchResultElement(result) {
  const div = document.createElement('div');
  div.classList.add('search-result-item');
  
  const task = result.task;
  
  const difficultyDot = document.createElement('div');
  difficultyDot.classList.add('search-result-difficulty');
  
  if (task.isHabit) {
    difficultyDot.classList.add('habit-dot');
    difficultyDot.style.backgroundColor = '#2196f3';
  } else {
    switch(task.difficulty) {
      case 'hard':
        difficultyDot.classList.add('hard');
        break;
      case 'medium':
        difficultyDot.classList.add('medium');
        break;
      case 'easy':
        difficultyDot.classList.add('easy');
        break;
    }
  }
  
  const infoDiv = document.createElement('div');
  infoDiv.classList.add('search-result-info');
  
  const textDiv = document.createElement('div');
  textDiv.classList.add('search-result-text');
  textDiv.textContent = task.text;
  
  const detailsDiv = document.createElement('div');
  detailsDiv.classList.add('search-result-details');
  
  const dateSpan = document.createElement('span');
  dateSpan.classList.add('search-result-date');
  dateSpan.textContent = task.date;
  
  const statusSpan = document.createElement('span');
  
  if (task.isHabit) {
    const habitSpan = document.createElement('span');
    habitSpan.classList.add('search-result-habit');
    habitSpan.textContent = 'عادت';
    statusSpan.appendChild(habitSpan);
    
    const isCompleted = isHabitCompletedOnDate(task, today);
    if (isCompleted) {
      const completedSpan = document.createElement('span');
      completedSpan.classList.add('search-result-completed');
      completedSpan.textContent = ' ✓ انجام شده';
      completedSpan.style.marginRight = '10px';
      statusSpan.appendChild(completedSpan);
    }
  } else if (task.completed) {
    const completedSpan = document.createElement('span');
    completedSpan.classList.add('search-result-completed');
    completedSpan.textContent = '✓ انجام شده';
    statusSpan.appendChild(completedSpan);
  }
  
  detailsDiv.appendChild(dateSpan);
  detailsDiv.appendChild(statusSpan);
  
  infoDiv.appendChild(textDiv);
  infoDiv.appendChild(detailsDiv);
  
  div.appendChild(difficultyDot);
  div.appendChild(infoDiv);
  
  div.addEventListener('click', () => {
    if (calendarModal.style.display === 'block') {
      highlightCalendarDay(task.date);
    } else {
      showDayModal(task.date);
      dayModal.style.display = 'block';
    }
  });
  
  return div;
}

// تابع برای هایلایت کردن روز در تقویم
function highlightCalendarDay(date) {
  document.querySelectorAll('.calendar-day.search-highlight').forEach(day => {
    day.classList.remove('search-highlight');
  });
  
  const calendarDays = document.querySelectorAll('.calendar-day:not(.weekday):not(.empty)');
  calendarDays.forEach(day => {
    const dayNumber = parseInt(day.textContent);
    if (!isNaN(dayNumber)) {
      const currentDate = moment(currentCalendarDate).startOf('jMonth').add(dayNumber - 1, 'days').format('jYYYY/jMM/jDD');
      if (currentDate === date) {
        day.classList.add('search-highlight');
        day.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  });
}

// تابع برای نمایش نتایج جستجو
function displaySearchResults(results, searchTerm) {
  searchResultsContainer.innerHTML = '';
  
  if (results.length === 0) {
    if (searchTerm.trim()) {
      const noResults = document.createElement('div');
      noResults.classList.add('no-results');
      noResults.textContent = `نتیجه‌ای برای "${searchTerm}" یافت نشد`;
      searchResultsContainer.appendChild(noResults);
    }
    searchResultsContainer.style.display = 'none';
    return;
  }
  
  const infoDiv = document.createElement('div');
  infoDiv.classList.add('search-results-info');
  infoDiv.textContent = `${results.length} نتیجه برای "${searchTerm}"`;
  searchResultsContainer.appendChild(infoDiv);
  
  results.forEach(result => {
    const resultElement = createSearchResultElement(result);
    searchResultsContainer.appendChild(resultElement);
  });
  
  searchResultsContainer.style.display = 'block';
}

// تابع اصلی جستجو
function performSearch(searchTerm) {
  const allTaskItems = document.querySelectorAll('.task-item');
  allTaskItems.forEach(item => {
    const taskText = item.querySelector('.task-text').textContent.toLowerCase();
    if (taskText.includes(searchTerm.toLowerCase())) {
      item.classList.add('search-highlight');
    } else {
      item.classList.remove('search-highlight');
    }
  });
  
  if (calendarModal.style.display === 'block') {
    document.querySelectorAll('.calendar-day:not(.weekday):not(.empty)').forEach(day => {
      const tasksPreview = day.querySelector('.day-tasks');
      if (tasksPreview) {
        const previewText = tasksPreview.textContent.toLowerCase();
        if (previewText.includes(searchTerm.toLowerCase())) {
          day.classList.add('search-highlight');
        } else {
          day.classList.remove('search-highlight');
        }
      }
    });
  }
  
  const searchResults = searchAllTasks(searchTerm);
  displaySearchResults(searchResults, searchTerm);
}

// ---------- Event Listeners ----------

// Event listener برای جستجو
taskSearch.addEventListener('input', (e) => {
  const searchTerm = e.target.value;
  
  if (searchTerm.trim()) {
    clearSearchBtn.style.display = 'block';
    performSearch(searchTerm);
  } else {
    clearSearchBtn.style.display = 'none';
    
    document.querySelectorAll('.search-highlight').forEach(item => {
      item.classList.remove('search-highlight');
    });
    
    searchResultsContainer.style.display = 'none';
    searchResultsContainer.innerHTML = '';
  }
});

// Event listener برای پاک کردن جستجو
clearSearchBtn.addEventListener('click', () => {
  taskSearch.value = '';
  clearSearchBtn.style.display = 'none';
  
  document.querySelectorAll('.search-highlight').forEach(item => {
    item.classList.remove('search-highlight');
  });
  
  searchResultsContainer.style.display = 'none';
  searchResultsContainer.innerHTML = '';
});

// وقتی روی خارج از نتایج جستجو کلیک شد، نتایج پنهان شوند
document.addEventListener('click', (e) => {
  if (!taskSearch.contains(e.target) && 
      !clearSearchBtn.contains(e.target) && 
      !searchResultsContainer.contains(e.target)) {
    searchResultsContainer.style.display = 'none';
  }
});

// وقتی تقویم بسته می‌شود، هایلایت‌ها پاک شوند
closeButtons.forEach(button => {
  button.addEventListener('click', () => {
    if (calendarModal.style.display === 'none') {
      document.querySelectorAll('.calendar-day.search-highlight').forEach(day => {
        day.classList.remove('search-highlight');
      });
    }
  });
});

taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  
  const isHabit = habitCheckbox.checked;
  const habitEndDate = habitEndDateInput.value;
  
  if (isHabit && (!habitEndDate || !isValidJalaliDate(habitEndDate))) {
    alert("لطفاً تاریخ پایان معتبری برای عادت وارد کنید.");
    return;
  }
  
  const newTask = {
    id: generateId(),
    text: taskInput.value,
    date: today,
    difficulty: difficultySelect.value,
    completed: false,
    isHabit: isHabit,
    habitEndDate: isHabit ? habitEndDate : null,
    completedDates: isHabit ? [] : null,
    reminderEnabled: reminderCheckbox.checked,
    reminderTime: reminderCheckbox.checked ? parseInt(reminderTimeSelect.value) : 0,
    reminderShown: null
  };
  
  tasks.push(newTask);
  saveTasks();
  renderTasks();
  updateAllProgressCharts();
  
  taskInput.value = "";
  habitCheckbox.checked = false;
  habitEndDateContainer.style.display = "none";
  habitEndDateInput.value = "";
  reminderCheckbox.checked = false;
  reminderContainer.style.display = "none";
});

modalTaskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  
  const newTask = {
    id: generateId(),
    text: modalTaskInput.value,
    date: currentModalDate,
    difficulty: modalDifficultySelect.value,
    completed: false,
    isHabit: false,
    habitEndDate: null,
    completedDates: null,
    reminderEnabled: modalReminderCheckbox.checked,
    reminderTime: modalReminderCheckbox.checked ? parseInt(modalReminderTimeSelect.value) : 0,
    reminderShown: null
  };
  
  tasks.push(newTask);
  saveTasks();
  showDayModal(currentModalDate);
  renderTasks();
  updateAllProgressCharts();
  modalTaskInput.value = "";
  modalReminderCheckbox.checked = false;
  modalReminderContainer.style.display = "none";
});

// هنگام ارسال فرم ویرایش
editTaskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  
  const taskIndex = tasks.findIndex(t => t.id === currentTaskId);
  if (taskIndex === -1) return;
  
  tasks[taskIndex].text = editTaskInput.value;
  
  let newDate = editTaskDate.value.trim();
  if (!newDate || !isValidJalaliDate(newDate)) {
    newDate = tasks[taskIndex].date;
  }
  tasks[taskIndex].date = newDate;
  
  tasks[taskIndex].difficulty = editDifficultySelect.value;
  
  if (tasks[taskIndex].isHabit && !tasks[taskIndex].completedDates) {
    tasks[taskIndex].completedDates = [];
  }
  
  saveTasks();
  renderTasks();
  updateAllProgressCharts();
  
  if (dayModal.style.display === "block") {
    showDayModal(newDate);
  }
  
  editModal.style.display = "none";
});

// هنگام تایید حذف
confirmDeleteBtn.addEventListener("click", () => {
  const taskIndex = tasks.findIndex(t => t.id === currentTaskId);
  if (taskIndex === -1) return;
  
  tasks.splice(taskIndex, 1);
  saveTasks();
  renderTasks();
  updateAllProgressCharts();
  
  if (dayModal.style.display === "block") {
    showDayModal(currentModalDate);
  }
  
  deleteModal.style.display = "none";
});

// لینک به تقویم
calendarLink.addEventListener("click", (e) => {
  e.preventDefault();
  currentCalendarDate = moment();
  renderCalendar();
  calendarModal.style.display = "block";
  dayModal.style.display = "none";
  
  searchResultsContainer.style.display = 'none';
});

// دکمه ماه قبل
prevMonthButton.addEventListener("click", () => {
  currentCalendarDate = moment(currentCalendarDate).subtract(1, 'jMonth');
  renderCalendar();
  
  if (taskSearch.value.trim()) {
    performSearch(taskSearch.value);
  }
});

// دکمه ماه بعد
nextMonthButton.addEventListener("click", () => {
  currentCalendarDate = moment(currentCalendarDate).add(1, 'jMonth');
  renderCalendar();
  
  if (taskSearch.value.trim()) {
    performSearch(taskSearch.value);
  }
});

// دکمه تنظیم تقویم
fixCalendarBtn.addEventListener("click", () => {
  fixCalendarModal.style.display = "block";
});

// انتخاب روز شروع هفته
weekdaySelectorButtons.forEach(button => {
  button.addEventListener("click", () => {
    const selectedDay = parseInt(button.getAttribute('data-day'));
    const monthKey = currentCalendarDate.format('jYYYY-jMM');
    
    calendarSettings[monthKey] = selectedDay;
    saveCalendarSettings();
    
    fixCalendarModal.style.display = "none";
    renderCalendar();
    
    if (taskSearch.value.trim()) {
      performSearch(taskSearch.value);
    }
  });
});

// بستن مودال‌ها
closeButtons.forEach(button => {
  button.addEventListener("click", () => {
    dayModal.style.display = "none";
    calendarModal.style.display = "none";
    editModal.style.display = "none";
    deleteModal.style.display = "none";
    fixCalendarModal.style.display = "none";
  });
});

// بستن مودال با دکمه انصراف
cancelButtons.forEach(button => {
  button.addEventListener("click", () => {
    const modalId = button.getAttribute("data-modal");
    document.getElementById(modalId).style.display = "none";
  });
});

// بستن مودال با کلیک خارج از آن
window.addEventListener("click", (e) => {
  if (e.target === dayModal) {
    dayModal.style.display = "none";
  }
  if (e.target === calendarModal) {
    calendarModal.style.display = "none";
  }
  if (e.target === editModal) {
    editModal.style.display = "none";
  }
  if (e.target === deleteModal) {
    deleteModal.style.display = "none";
  }
  if (e.target === fixCalendarModal) {
    fixCalendarModal.style.display = "none";
  }
});

// ---------- Initialize ----------
document.addEventListener("DOMContentLoaded", () => {
  renderCurrentDate();
  renderTasks();
  updateAllProgressCharts();
  setupDailyReminderCheck();
  createInstallButton();
  requestNotificationPermission();
  
  // نمایش پیام خوش‌آمدگویی
  setTimeout(() => {
    if (tasks.length === 0) {
      const welcomeMsg = document.createElement('div');
      welcomeMsg.innerHTML = `
        <div style="
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          padding: 20px;
          border-radius: 15px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
          z-index: 1001;
          max-width: 300px;
          text-align: center;
          font-family: 'DelbarBold', Arial, sans-serif;
        ">
          <h3 style="color: #521d67; margin-bottom: 10px;">به BulletJournal خوش آمدید! ✨</h3>
          <p style="font-size: 14px; color: #666; margin-bottom: 15px;">
            برای نصب برنامه روی دکمه نصب کلیک کنید
          </p>
          <button onclick="this.parentElement.style.display='none'" style="
            background: #4caf50;
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 10px;
            cursor: pointer;
            font-family: 'DelbarBold', Arial, sans-serif;
          ">
            فهمیدم
          </button>
        </div>
      `;
      document.body.appendChild(welcomeMsg);
      
      // خودکار بسته شدن بعد از 10 ثانیه
      setTimeout(() => {
        if (welcomeMsg.parentElement) {
          welcomeMsg.style.display = 'none';
        }
      }, 10000);
    }
  }, 1000);
});
