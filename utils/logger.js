const info= (...parameters)=>{
    if(process.env.NODE_ENV!='production')
    {
        console.log(parameters);
    }
}
const error= (...parameters)=>{
    if(process.env.NODE_ENV!='production')
    {
        console.log(parameters);
    }
}

module.exports={
    info,
    error
}