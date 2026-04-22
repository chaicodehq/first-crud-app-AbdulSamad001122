import { Todo } from "../models/todo.model.js";

/**
 * TODO: Create a new todo
 * - Extract data from req.body
 * - Create todo in database
 * - Return 201 with created todo
 */
export async function createTodo(req, res, next) {
  try {
    const newTodo = new Todo(req.body);

    await newTodo.save();

    return res.status(201).json(newTodo);
  } catch (error) {
    next(error);
  }
}

/**
 * TODO: List todos with pagination and filters
 * - Support query params: page, limit, completed, priority, search
 * - Default: page=1, limit=10
 * - Return: { data: [...], meta: { total, page, limit, pages } }
 */
export async function listTodos(req, res, next) {
  try {
    const { page = 1, limit = 10, completed, priority, search } = req.query;

    const filter = {};

    if (completed !== undefined) {
      filter.completed = completed === "true";
    }

    if (priority) {
      filter.priority = priority;
    }

    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const todos = await Todo.find(filter)
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await Todo.countDocuments(filter);

    res.json({
      data: todos,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
}
/**
 * TODO: Get single todo by ID
 * - Return 404 if not found
 */
export async function getTodo(req, res, next) {
  try {
    const todoId = req.params.id;

    const todo = await Todo.findById(todoId);

    if (!todo) {
      return res.status(404).json({
        error: { message: "Todo not found" },
      });
    }

    res.json(todo);
  } catch (error) {
    next(error);
  }
}

/**
 * TODO: Update todo by ID
 * - Use findByIdAndUpdate with { new: true, runValidators: true }
 * - Return 404 if not found
 */
export async function updateTodo(req, res, next) {
  try {
    const todoId = req.params.id;

    const updatedTodo = await Todo.findByIdAndUpdate(todoId, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedTodo) {
      return res.status(404).json({
        error: { message: "Todo not found" },
      });
    }

    res.json(updatedTodo);
  } catch (error) {
    next(error);
  }
}
/**
 * TODO: Toggle completed status
 * - Find todo, flip completed, save
 * - Return 404 if not found
 */
export async function toggleTodo(req, res, next) {
  try {
    const todoId = req.params.id;

    const todo = await Todo.findById(todoId);

    if (!todo) {
      return res.status(404).json({
        error: { message: "Todo not found" },
      });
    }

    todo.completed = !todo.completed;

    await todo.save();

    res.json(todo);
  } catch (error) {
    next(error);
  }
}

/**
 * TODO: Delete todo by ID
 * - Return 204 (no content) on success
 * - Return 404 if not found
 */
export async function deleteTodo(req, res, next) {
  try {
    const todoId = req.params.id;

    const deletedTodo = await Todo.findByIdAndDelete(todoId);

    if (!deletedTodo) {
      return res.status(404).json({
        error: { message: "Todo not found" },
      });
    }

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}
