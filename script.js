// ---------------------------
// ✅ Registration
// ---------------------------
function registerUser(event) {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  if (password !== confirmPassword) {
    alert("Passwords do not match.");
    return;
  }

  let users = JSON.parse(localStorage.getItem("fitnessUsers")) || [];
  // Check for duplicate email
  if (users.some(u => u.email === email)) {
    alert("An account with this email already exists.");
    return;
  }
  users.push({ name, email, password });
  localStorage.setItem("fitnessUsers", JSON.stringify(users));

  alert("Registration successful! Please login.");
  window.location.href = "login.html";
}

// ---------------------------
// ✅ Login
// ---------------------------
function loginUser(event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  const users = JSON.parse(localStorage.getItem("fitnessUsers")) || [];
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    alert("Invalid email or password.");
    return;
  }

  // Optionally, save the logged-in user for session management
  localStorage.setItem("fitnessUser", JSON.stringify(user));

  alert("Login successful!");
  window.location.href = "dashboard.html";
}

// ---------------------------
// ✅ Add Exercise to List (before saving plan)
// ---------------------------
let exerciseArray = [];

function addExercise() {
  const name = document.getElementById("exercise-name").value.trim();
  const sets = document.getElementById("exercise-sets").value;
  const reps = document.getElementById("exercise-reps").value;

  if (!name || !sets || !reps) {
    alert("Please fill all exercise fields.");
    return;
  }

  exerciseArray.push({ name, sets, reps });

  // Clear inputs
  document.getElementById("exercise-name").value = "";
  document.getElementById("exercise-sets").value = "";
  document.getElementById("exercise-reps").value = "";

  updateExerciseList();
}

function updateExerciseList() {
  const list = document.getElementById("exercise-list");
  list.innerHTML = "";
  exerciseArray.forEach((ex, index) => {
    const li = document.createElement("li");
    li.textContent = `${ex.name} — ${ex.sets} sets x ${ex.reps} reps`;
    list.appendChild(li);
  });
}

// ---------------------------
// ✅ Save Workout Plan
// ---------------------------
function saveWorkoutPlan(event) {
  event.preventDefault();

  const planName = document.getElementById("plan-name").value.trim();
  const notes = document.getElementById("notes").value.trim();

  if (!planName) {
    alert("Plan name is required.");
    return;
  }

  if (exerciseArray.length === 0) {
    alert("Add at least one exercise.");
    return;
  }

  const workout = {
    id: Date.now(), // ✅ Unique ID for edit/delete
    planName,
    notes,
    date: new Date().toLocaleDateString(),
    exercises: exerciseArray
  };

  // Get current user's email
  const currentUser = JSON.parse(localStorage.getItem("fitnessUser"));
  if (!currentUser || !currentUser.email) {
    alert("User not logged in.");
    return;
  }
  const key = `fitnessWorkouts_${currentUser.email}`;
  let workouts = JSON.parse(localStorage.getItem(key)) || [];
  workouts.push(workout);
  localStorage.setItem(key, JSON.stringify(workouts));

  alert("Workout plan saved!");
  exerciseArray = []; // reset
  window.location.href = "dashboard.html";
}

// ---------------------------
// ✅ Delete Workout
// ---------------------------
function deleteWorkout(id) {
  const currentUser = JSON.parse(localStorage.getItem("fitnessUser"));
  if (!currentUser || !currentUser.email) {
    alert("User not logged in.");
    window.location.href = "login.html";
    return;
  }
  const key = `fitnessWorkouts_${currentUser.email}`;
  let workouts = JSON.parse(localStorage.getItem(key)) || [];
  workouts = workouts.filter(w => w.id !== id);
  localStorage.setItem(key, JSON.stringify(workouts));
  location.reload();
}

// ---------------------------
// ✅ Edit Workout - redirect to edit page with ID
// ---------------------------
function editWorkout(id) {
  localStorage.setItem("editWorkoutId", id);
  window.location.href = "edit-workout.html";
}
let editExercises = [];

function loadWorkoutForEditing() {
  const editId = parseInt(localStorage.getItem("editWorkoutId"));
  const currentUser = JSON.parse(localStorage.getItem("fitnessUser"));
  if (!currentUser || !currentUser.email) {
    alert("User not logged in.");
    window.location.href = "login.html";
    return;
  }
  const key = `fitnessWorkouts_${currentUser.email}`;
  const workouts = JSON.parse(localStorage.getItem(key)) || [];
  const workout = workouts.find(w => w.id === editId);

  if (!workout) {
    alert("Workout not found.");
    window.location.href = "dashboard.html";
    return;
  }

  document.getElementById("edit-plan-name").value = workout.planName;
  document.getElementById("edit-notes").value = workout.notes;
  editExercises = [...workout.exercises]; // clone
  updateEditExerciseList();

  document.getElementById("edit-workout-form").addEventListener("submit", function (e) {
    e.preventDefault();

    const updatedPlan = {
      id: workout.id,
      planName: document.getElementById("edit-plan-name").value.trim(),
      notes: document.getElementById("edit-notes").value.trim(),
      date: new Date().toLocaleDateString(),
      exercises: editExercises
    };

    const updatedWorkouts = workouts.map(w => w.id === workout.id ? updatedPlan : w);
    localStorage.setItem(key, JSON.stringify(updatedWorkouts));

    alert("Workout updated!");
    localStorage.removeItem("editWorkoutId");
    window.location.href = "dashboard.html";
  });
}

function updateEditExerciseList() {
  const container = document.getElementById("edit-exercise-list");
  container.innerHTML = "";

  editExercises.forEach((ex, index) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <p>${ex.name} — ${ex.sets} sets x ${ex.reps} reps 
      <button onclick="removeEditExercise(${index})">❌</button></p>
    `;
    container.appendChild(div);
  });
}

function addNewEditExercise() {
  const name = document.getElementById("new-exercise-name").value.trim();
  const sets = document.getElementById("new-exercise-sets").value;
  const reps = document.getElementById("new-exercise-reps").value;

  if (!name || !sets || !reps) {
    alert("Fill all exercise fields.");
    return;
  }

  editExercises.push({ name, sets, reps });
  document.getElementById("new-exercise-name").value = "";
  document.getElementById("new-exercise-sets").value = "";
  document.getElementById("new-exercise-reps").value = "";
  updateEditExerciseList();
}

function removeEditExercise(index) {
  editExercises.splice(index, 1);
  updateEditExerciseList();
}
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}
function goToDashboard() {
  window.location.href = "dashboard.html";
}

function logout() {
  localStorage.removeItem("fitnessUser");
  window.location.href = "login.html";
}
