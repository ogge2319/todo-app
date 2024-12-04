import mongoose, {model, Schema} from "mongoose";

const todoSchema = new Schema ({
    text: {type: String, required: true},
    priority: {type: String, required: true, enum: ["low", "medium", "high"]},
    deadline: {type: String, required: true}
})

export const Todo = mongoose.models.todo || new model("Todo", todoSchema)