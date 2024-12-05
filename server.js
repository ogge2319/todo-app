import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectToDB from "./database/db.js";
import { Todo } from "./models/todo.model.js";
import jwt from "jsonwebtoken";

dotenv.config();
const app = express()
const port = 3000
const SECRET_KEY = process.env.SECRET_KEY;

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

//Middleware för att validera JWT token
const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Extrahera token från Authorization-headern

    if (!token) {
        return res.status(401).send({
            success: false,
            message: "Access denied. No token provided",
        });
    }
    try {
        const decoded = jwt.verify(token, SECRET_KEY);  //Validera token
        req.user = decoded;     //Fortsätt till nästa middleware
        next();
    } catch (error) {
        res.status(403).send({
            success: false,
            message: "Invalid token",
        });
    }
};


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


app.post("/create-todo", authenticateToken ,async (req, res) => {
    const todoDetails = req.body;
    console.log("Authenticated user:", req.user);
    console.log("Headers:", req.headers);
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

app.post("/login", (req, res) => {
    const { username, password } = req.body;

    //auth
    if (username === "admin" && password === "password") {
        const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" })     //Genererar JWT token
        res.send({
            success: true,
            message: "Login Successfull",
            token,
        });
    } else {
        res.status(401).send({
            success: false,
            message: "Invalid username or password",
        });
    }
});

app.get("/secret-data", authenticateToken, async (req, res) => {
    try {
        // Skapa "hemlig data" som kan returneras från databasen
        const secretData = [
            { id: 1, info: "This is top secret data 1." },
            { id: 2, info: "This is top secret data 2." },
            { id: 3, info: "This is classified information." },
        ];

        res.send({
            success: true,
            message: "Secret data retrieved successfully",
            data: secretData,
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Failed to retrieve secret data",
            error: error.message,
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