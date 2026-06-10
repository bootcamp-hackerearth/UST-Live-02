const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware')
const Node = require('../models/Node.model')

router.get("/list", authMiddleware, async (req, res) => {
    try {

//role comes from the decoded token 
const role=req.user.role;
console.log(role);


//fetch the nodes from the db s
res.set('Cache-Control', 'no-store');//to not to store on the database 
const nodes=await Node.find({role:role}).sort({order:1});
res.json({
    success:true,
    data:nodes
})
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });

    }
}
);

module.exports=router;