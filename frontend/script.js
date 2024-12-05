const apiUrl = "http://localhost:3000"; // Backend URL

// Fetch ToDos
async function fetchTodos() {
    const todoList = document.getElementById("todo-list");
    todoList.innerHTML = ""; 

    const response = await fetch(`${apiUrl}/todos`);
    const data = await response.json();

    if (data.success) {
        data.data.forEach(todo => {
            const li = document.createElement("li");
            li.textContent = `${todo.text} - ${todo.priority} - ${todo.deadline}`;

            // Create edit button
            const editButton = document.createElement("button");
            editButton.textContent = "Edit";
            editButton.addEventListener("click", () => editTodo(todo));

            // Create delete button
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.addEventListener("click", () => deleteTodo(todo._id));

            // Add buttons to li element
            li.appendChild(editButton);
            li.appendChild(deleteButton);

            // Add li element to todo list
            todoList.appendChild(li);
        });
    } else {
        console.error("Failed to fetch todos");
    }
}

// Fetch todos on page load
window.addEventListener("DOMContentLoaded", async () => {
    await fetchTodos();
});

// Add new ToDo
document.getElementById("todo-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const text = document.getElementById("todo-text").value;
    const priority = document.getElementById("todo-priority").value;
    const deadline = document.getElementById("todo-deadline").value;

    const newTodo = { text, priority, deadline };

    const response = await fetch(`${apiUrl}/create-todo`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(newTodo),
    });

    const data = await response.json();
    if (data.success) {
        location.reload(); // Refresh the list
    } else {
        alert("Failed to create todo");
    }
});

// Edit a todo
async function editTodo(todo) {
    const newText = prompt("Enter new text:", todo.text);
    const newPriority = prompt("Enter new priority (low, medium, high):", todo.priority);
    const newDeadline = prompt("Enter new deadline (yyyy-mm-dd):", todo.deadline);

     // Validation
     const validPriorities = ["low", "medium", "high"];
     if (!validPriorities.includes(newPriority)) {
         alert("Invalid priority! Priority must be 'low', 'medium', or 'high'.");
         return;
     }

    if (newText && newPriority && newDeadline) {
        const updatedTodo = { text: newText, priority: newPriority, deadline: newDeadline };

        const response = await fetch(`${apiUrl}/${todo._id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedTodo),
        });

        const data = await response.json();
        if (data.success) {
            await fetchTodos(); // Refresh the list
        } else {
            alert("Failed to update todo");
        }
    }
}

// Delete a todo
async function deleteTodo(todoId) {
    const confirmed = confirm("Are you sure you want to delete this todo?");
    if (confirmed) {
        const response = await fetch(`${apiUrl}/delete/${todoId}`, {
            method: "DELETE",
        });

        const data = await response.json();
        if (data.success) {
            await fetchTodos(); // Refresh the list
        } else {
            alert("Failed to delete todo");
        }
    }
}
