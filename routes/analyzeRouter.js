import express from "express"
import { permissionMiddleware } from "../middleware/auth.js";
import db from "../models/database.js";

const router = express.Router();

router.use(permissionMiddleware(['admin','analyst']))


router.get("/getSummary", (req,res)=>{
    try {
      const stmt = db.prepare(`
          SELECT type, SUM(amount) as total FROM records GROUP BY type
          `)

      const result = stmt.all()
      const summary = result.reduce((acc,row)=>{
          acc[row.type] = row.total || 0
          return acc
      }, { income: 0, expense: 0 }) 
      const net = (summary.income || 0) - (summary.expense || 0)
      res.status(200).json({
          income: summary.income,
          expense: summary.expense,
          net
      })
    } catch (err) {
      res.status(500).json({message: "Error fetching summary", error: err.message})
    }
})

router.get("/getCategorySummary", (req,res)=>{
    try {
      const stmt = db.prepare(`
          SELECT category, SUM(amount) as total FROM records GROUP BY category ORDER BY total DESC
          `)
      const result = stmt.all()
      res.status(200).json(result)
    } catch (err) {
      res.status(500).json({message: "Error fetching category summary", error: err.message})
    }
})

router.get("/getDateRangeSummary", (req,res)=>{
    const {startDateTime, endDateTime} = req.query
    if (!startDateTime || !endDateTime) {
      return res.status(400).json({
        message: "Start date and end date must be provided",
      });
    }
    try {
        const stmt = db.prepare(`
        SELECT type, SUM(amount) as total FROM records WHERE createdAt BETWEEN ? AND ? GROUP BY type
        `);
        const result = stmt.all(startDateTime, endDateTime);
        res.status(200).json(result);       
    } catch (err) {
        res.status(500).json({
            message:"Error fetching records",
            error:err.message
        })
    }
})


export default router