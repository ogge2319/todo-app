import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectToDB from "./database/db.js";
import { Todo } from "./models/todo.model.js";
dotenv.config();
const app = express()
const port = 3000

//middleware
app.use(express.json())
app.use(cors());
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({
        success: false,
        message: "An unexpected error occurred",
        error: err.message
    });
});


connectToDB()

//TODO API
app.get("/todos", async (req, res) => {
    try {
        const result = await Todo.find();
        res.send({
            success: true,
            message: "Todo Lists Retrieved",
            data: result
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Failed to retrieve todo lists",
            error: error.message
        });
    }
});


app.post("/create-todo", async (req, res) => {
    const todoDetails = req.body;
    try {
        const result = await Todo.create(todoDetails);
        res.send({
            success: true,
            message: "Todo is created successfully",
            data: result
        });
    } catch (error) {
        console.error(error);
        res.status(400).send({
            success: false,
            message: "Failed to create todo",
            error: error.message
        });
    }
});



app.get("/:todoid", async (req, res) => {
    const todoId = req.params.todoid;
    try {
        const result = await Todo.findById(todoId);
        if (!result) {
            return res.status(404).send({
                success: false,
                message: "Todo not found"
            });
        }
        res.send({
            success: true,
            message: "Todo is retrieved successfully",
            data: result
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Failed to retrieve todo",
            error: error.message
        });
    }
});


app.patch("/:todoid", async (req, res) => {
    const todoId = req.params.todoid;
    const updatedTodo = req.body;

    
    const validPriorities = ["low", "medium", "high"];
    if (!validPriorities.includes(updatedTodo.priority)) {
        return res.status(400).send({
            success: false,
            message: "Invalid priority. Priority must be 'low', 'medium', or 'high'.",
        });
    }

    try {
        const result = await Todo.findByIdAndUpdate(todoId, updatedTodo, {
            new: true
        });
        if (!result) {
            return res.status(404).send({
                success: false,
                message: "Todo not found"
            });
        }
        res.send({
            success: true,
            message: "Todo is updated successfully",
            data: result
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Failed to update todo",
            error: error.message
        });
    }
});



app.delete("/delete/:todoid", async (req, res) => {
    try {
        const result = await Todo.findByIdAndDelete(req.params.todoid);
        if (!result) {
            return res.status(404).send({
                success: false,
                message: "Todo not found"
            });
        }
        res.send({
            success: true,
            message: "Todo is deleted successfully"
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Failed to delete the todo",
            error: error.message
        });
    }
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})