import express from "express"
import {z} from "zod"
import bcrypt from "bcryptjs";
import { permissionMiddleware } from "../middleware/auth.js";
import db from "../models/database.js";

const router = express.Router();
router.use(permissionMiddleware(['admin']))

const registerSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  role: z.enum(["viewer", "analyst", "admin"]),
});

//Only Admin can create new user account
router.post("/createAccount", async (req, res) => {
  const { username, password, role } = req.body;
  const isSafeParsed = registerSchema.safeParse(req.body);

  if (!isSafeParsed.success) {
    return res.status(400).json({
      message: "Invalid fields",
      errors: isSafeParsed.error.errors
    });
  }

  const userExists = db
    .prepare(`SELECT userId FROM users WHERE username=?`)
    .get(username);

  if (userExists) {
    return res.status(409).json({
      message: "Username already exists",
    });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

  const stmt = db.prepare(
    `INSERT INTO users (username,password,role) VALUES (?,?,?)`,
  );

  const result = stmt.run(username, hashedPassword, role);

    res.status(201).json({
      userId: result.lastInsertRowid,
      username,
      role,
      message: "User account created successfully"
    });
  } catch (err) {
    res.status(500).json({
      message: "Error creating user",
      error: err.message
    });
  }
});

const recordSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(['income', 'expense']),
  category: z.string(),
  description: z.string(),
});

// Add a new transaction record 
router.post("/record/add", (req,res)=>{
    const payload = req.body
    const isSafeParsed = recordSchema.safeParse(payload)
    if(!isSafeParsed.success){
        return res.status(400).json({
          message: "Invalid record fields",
          errors: isSafeParsed.error.errors
        });
    }

    const {amount,type,category,description} = payload
    const userId = req.userId; 
    const stmt = db.prepare(`
        INSERT INTO records (amount,type,category,description,userId) VALUES (?,?,?,?,?)
        `);

    try {
      const result = stmt.run(amount, type, category, description, userId);
      res.status(201).json({
          recordId: result.lastInsertRowid,
          message: "Record created successfully"
      })
    } catch (err) {
      res.status(500).json({message: "Error creating record", error: err.message})
    }
})  


// Update an existing record 
router.put("/record/update/:recordId",(req,res)=>{
    const payload = req.body
    const recordId = req.params.recordId

   const isSafeParsed = recordSchema.safeParse(payload);
   if (!isSafeParsed.success) {
     return res.status(400).json({
       message: "Invalid record fields",
       errors: isSafeParsed.error.errors
     });
   }

    // Verify record exists
    const recordExists = db.prepare(`SELECT recordId FROM records WHERE recordId = ?`).get(recordId);
    if (!recordExists) {
      return res.status(404).json({message: "Record not found"});
    }

    const {amount,type,category,description} = payload
    const stmt = db.prepare(`
        UPDATE records SET amount = ?, type = ?, category = ?, description = ? WHERE recordId = ?
        `);

    try {
      const result = stmt.run(amount, type, category, description, recordId);
      res.status(200).json({
          message: "Record updated successfully"
      })
    } catch (err) {
      res.status(500).json({message: "Error updating record", error: err.message})
    }
})  

// Delete a record 
router.delete("/record/delete/:recordId",(req,res)=>{
    const recordId = req.params.recordId

    const recordExists = db.prepare(`SELECT recordId FROM records WHERE recordId = ?`).get(recordId);
    if (!recordExists) {
      return res.status(404).json({message: "Record not found"});
    }

    try {
      const stmt = db.prepare(`DELETE FROM records WHERE recordId = ?`);
      const result = stmt.run(recordId);
      res.status(200).json({
          message: "Record deleted successfully"
      })
    } catch (err) {
      res.status(500).json({message: "Error deleting record", error: err.message})
    }
})

export default router