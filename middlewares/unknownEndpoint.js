
module.exports=(req,res)=>{
    res.status(404).send({
        error:"unknown endpoint"
    });
}