let categories = [];
let tasks = [];
let currentFilter = "all";
let filterDateStart = null;
let filterDateEnd = null;

const taskInput = document.querySelector("#taskInput");
const taskDate = document.querySelector("#taskDate");
const categorySelect = document.querySelector("#categorySelect");
const addBtn = document.querySelector("#addBtn");
const taskList = document.querySelector("#taskList");

const categoryName = document.querySelector("#categoryName");
const categoryColor = document.querySelector("#categoryColor");
const categoryIcon = document.querySelector("#categoryIcon");
const addCategoryBtn = document.querySelector("#addCategoryBtn");
const categoryList = document.querySelector("#categoryList");

const filterArea = document.querySelector("#filterArea");
const filterDateStartInput = document.querySelector("#filterDateStart");
const filterDateEndInput = document.querySelector("#filterDateEnd");
const clearDateFilterBtn = document.querySelector("#clearDateFilter");

const celebrationContainer = document.querySelector("#celebrationContainer");
const totalTasksEl = document.querySelector("#totalTasks");
const completedTasksEl = document.querySelector("#completedTasks");
const pendingTasksEl = document.querySelector("#pendingTasks");

const today = new Date().toISOString().split('T')[0];
taskDate.value = today;

function saveToLocalStorage() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    localStorage.setItem("categories", JSON.stringify(categories));
}

function loadFromLocalStorage() {
    const savedTasks = localStorage.getItem("tasks");
    const savedCategories = localStorage.getItem("categories");

    if (savedTasks) tasks = JSON.parse(savedTasks);
    if (savedCategories) categories = JSON.parse(savedCategories);
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = tasks.filter(t => !t.completed).length;

    totalTasksEl.textContent = total;
    completedTasksEl.textContent = completed;
    pendingTasksEl.textContent = pending;
}

function playCelebration(x, y) {
    for (let i = 0; i < 20; i++) {
        const confetti = document.createElement("div");
        confetti.className = "confetti color" + (Math.floor(Math.random() * 4) + 1);
        
        const angle = (Math.PI * 2 * i) / 20;
        const velocity = 3 + Math.random() * 3;
        const tx = Math.cos(angle) * velocity * 40;
        const ty = Math.sin(angle) * velocity * 40 - 80;
        
        confetti.style.left = x + "px";
        confetti.style.top = y + "px";
        confetti.style.setProperty("--tx", tx + "px");
        confetti.style.setProperty("--ty", ty + "px");
        
        celebrationContainer.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 3000);
    }

    const texts = ["✓ Selesai", "✓ Bagus", "✓ Mantap", "✓ Done"];
    const randomText = texts[Math.floor(Math.random() * texts.length)];
    
    const celebText = document.createElement("div");
    celebText.className = "celebration-text";
    celebText.textContent = randomText;
    celebText.style.left = x + "px";
    celebText.style.top = y + "px";
    
    celebrationContainer.appendChild(celebText);
    setTimeout(() => celebText.remove(), 1500);

    playSuccessSound();
}

function playSuccessSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const now = audioContext.currentTime;
        
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.1);
        osc.frequency.setValueAtTime(783.99, now + 0.2);
        
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        
        osc.start(now);
        osc.stop(now + 0.3);
    } catch (e) {
        console.log("Sound tidak bisa diputar");
    }
}

addCategoryBtn.addEventListener("click", function () {
    const name = categoryName.value.trim();
    const color = categoryColor.value;
    const icon = categoryIcon.value.trim();

    if (name === "") {
        alert("Nama kategori tidak boleh kosong!");
        return;
    }

    const newCategory = {
        id: Date.now(),
        name,
        color,
        icon
    };

    categories.push(newCategory);
    saveToLocalStorage();
    renderCategories();

    categoryName.value = "";
    categoryIcon.value = "📌";
    categoryColor.value = "#00d4ff";
});

addBtn.addEventListener("click", function () {
    const taskText = taskInput.value.trim();
    const categoryId = Number(categorySelect.value);
    const date = taskDate.value;

    if (taskText === "" || !categoryId) {
        alert("Task dan kategori tidak boleh kosong!");
        return;
    }

    const newTask = {
        id: Date.now(),
        text: taskText,
        categoryId,
        date: date,
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.push(newTask);
    saveToLocalStorage();
    renderTasks();

    taskInput.value = "";
    categorySelect.value = "";
    taskDate.value = today;
});

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveToLocalStorage();
    renderTasks();
    updateStats();
}

function setFilter(value) {
    currentFilter = value;
    
    document.querySelectorAll(".filter-area button").forEach(btn => {
        btn.classList.remove("active");
    });
    event.target.classList.add("active");
    
    renderTasks();
}

filterDateStartInput.addEventListener("change", function () {
    filterDateStart = this.value;
    renderTasks();
});

filterDateEndInput.addEventListener("change", function () {
    filterDateEnd = this.value;
    renderTasks();
});

clearDateFilterBtn.addEventListener("click", function () {
    filterDateStart = null;
    filterDateEnd = null;
    filterDateStartInput.value = "";
    filterDateEndInput.value = "";
    renderTasks();
});

function renderCategories() {
    categoryList.innerHTML = "";
    categorySelect.innerHTML = `<option value="">Pilih Kategori</option>`;
    filterArea.innerHTML = "";

    const filters = [
        { text: "Semua", value: "all" },
        { text: "Belum Selesai", value: "pending" },
        { text: "Selesai", value: "done" }
    ];

    filters.forEach((f, index) => {
        const btn = document.createElement("button");
        btn.textContent = f.text;
        btn.onclick = setFilter;
        btn.value = f.value;
        if (index === 0) btn.classList.add("active");
        filterArea.appendChild(btn);
    });

    categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat.id;
        option.textContent = `${cat.icon} ${cat.name}`;
        categorySelect.appendChild(option);

        const li = document.createElement("li");
        li.innerHTML = `
            <span style="color:${cat.color}; font-weight: bold;">
                ${cat.icon} ${cat.name}
            </span>
            <button onclick="deleteCategory(${cat.id})">Hapus</button>
        `;
        categoryList.appendChild(li);
    });
}

function deleteCategory(id) {
    categories = categories.filter(cat => cat.id !== id);
    tasks = tasks.filter(task => task.categoryId !== id);
    saveToLocalStorage();
    renderCategories();
    renderTasks();
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('id-ID', options);
}

function isOverdue(dateString) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = new Date(dateString + 'T00:00:00');
    return taskDate < today;
}

function renderTasks() {
    taskList.innerHTML = "";

    let filteredTasks;

    if (currentFilter === "all") {
        filteredTasks = tasks;
    } else if (currentFilter === "pending") {
        filteredTasks = tasks.filter(t => !t.completed);
    } else if (currentFilter === "done") {
        filteredTasks = tasks.filter(t => t.completed);
    }

    if (filterDateStart || filterDateEnd) {
        filteredTasks = filteredTasks.filter(task => {
            const taskDate = new Date(task.date + 'T00:00:00');
            
            if (filterDateStart) {
                const startDate = new Date(filterDateStart + 'T00:00:00');
                if (taskDate < startDate) return false;
            }
            
            if (filterDateEnd) {
                const endDate = new Date(filterDateEnd + 'T00:00:00');
                if (taskDate > endDate) return false;
            }
            
            return true;
        });
    }

    filteredTasks.sort((a, b) => new Date(a.date) - new Date(b.date));

    filteredTasks.forEach(task => {
        const category = categories.find(c => c.id === task.categoryId);
        const overdue = !task.completed && isOverdue(task.date);

        const li = document.createElement("li");
        if (task.completed) {
            li.classList.add("completed");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;

        checkbox.addEventListener("change", function (e) {
            const rect = e.target.getBoundingClientRect();
            task.completed = !task.completed;
            
            if (task.completed) {
                playCelebration(rect.left + rect.width / 2, rect.top + rect.height / 2);
            }
            
            saveToLocalStorage();
            renderTasks();
            updateStats();
        });

        const taskContent = document.createElement("div");
        taskContent.className = "task-content";

        const taskText = document.createElement("div");
        taskText.className = "task-text";
        if (task.completed) {
            taskText.classList.add("completed");
        }

        if (category) {
            taskText.innerHTML = `<span style="color:${category.color}; font-weight: bold;">${category.icon}</span> ${task.text}`;
        } else {
            taskText.textContent = task.text;
        }

        taskContent.appendChild(taskText);

        const taskMeta = document.createElement("div");
        taskMeta.className = "task-meta";

        const dateSpan = document.createElement("span");
        dateSpan.className = "task-date";
        dateSpan.innerHTML = `📅 ${formatDate(task.date)}`;
        if (overdue) {
            dateSpan.style.background = "rgba(255, 46, 99, 0.2)";
            dateSpan.style.borderColor = "#ff2e63";
            dateSpan.textContent = "⚠️ OVERDUE - " + formatDate(task.date);
        }

        const categorySpan = document.createElement("span");
        categorySpan.className = "task-category";
        if (category) {
            categorySpan.innerHTML = `${category.icon} ${category.name}`;
            categorySpan.style.color = category.color;
        }

        taskMeta.appendChild(dateSpan);
        if (category) taskMeta.appendChild(categorySpan);

        taskContent.appendChild(taskMeta);

        li.appendChild(checkbox);
        li.appendChild(taskContent);

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "🗑️";
        deleteBtn.style.fontSize = "10px";
        deleteBtn.style.padding = "8px 10px";
        deleteBtn.onclick = () => deleteTask(task.id);
        li.appendChild(deleteBtn);

        taskList.appendChild(li);
    });

    updateStats();
}

window.addEventListener("load", function () {
    loadFromLocalStorage();
    renderCategories();
    renderTasks();
});

document.addEventListener("click", function (e) {
    if (e.target.matches(".filter-area button")) {
        setFilter(e.target.value);
    }
});
