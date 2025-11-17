module.exports = (funct) => {
    return function(req , res , next){
        funct(req , res , next).catch(next);
    }
}