import express from "express"
import db from "../models/database.js";
import { permissionMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.use(permissionMiddleware(['admin','viewer','analyst']));


router.get("/getRecords", (req,res)=>{
    const { type, minAmount, maxAmount, startDateTime, endDateTime, category } =
      req.query;
    console.log(req.query);

      let query = "SELECT * FROM records";
      let conditions = [];
      let values = [];

      if (type) {
        conditions.push("type = ?");
        values.push(type);
      }

      if (category) {
        conditions.push("category = ?");
        values.push(category);
      }

      if (startDate) {
        conditions.push("createdAt >= ?");
        values.push(startDateTime);
      }

      if (endDate) {
        conditions.push("createdAt <= ?");
        values.push(endDateTime);
      }
      if (minAmount) {
        conditions.push("amount >= ?");
        values.push(minAmount);
      }
      if (maxAmount) {
        conditions.push("amount <= ?");
        values.push(maxAmount);
      }

      if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
      }
      console.log(query);
      try {
        const records = db.prepare(query).all(values);
        res.json(records);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
})

router.get("/getAllRecords", (req,res)=>{
    const stmt = db.prepare(`
        SELECT * FROM records
        `)

    const result = stmt.all()
    console.log(result);
    res.status(200).json(result) 
})

router.get("/pageRecords",(req,res)=>{
  let {page=1,limit=10} = req.query

  page = parseInt(page, 10);
  limit = parseInt(limit, 10);

  // Checking for all edge cases for pagination
  if (isNaN(page) || page < 1) {
    return res.status(400).json({message: "Invalid page number. Must be a positive integer."})
  }
  if (isNaN(limit) || limit < 1) {
    return res.status(400).json({message: "Invalid limit. Must be a positive integer."})
  }

  const offset = (page-1)*limit

  const {total} = db.prepare(`SELECT count(*) as total FROM records`).get()
  const totalPages = Math.ceil(total / limit)

  if(offset >= total && total != 0){
    return res.status(400).json({
      message: "Page out of range. Maximum pages available: " + totalPages
    })
  }
  
  const stmt = db.prepare(`
    SELECT * FROM records
    ORDER BY createdAt DESC
    LIMIT ? OFFSET ? 
    `)
  
  const result = stmt.all(limit,offset)
  res.status(200).json({
    page,
    limit,
    totalRecords: total,
    totalPages,
    data: result
  })

})

export default router