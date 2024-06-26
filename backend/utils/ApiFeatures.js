class ApiFeatures{
    constructor(query, queryStr){
        this.query = query;
        this.queryStr = queryStr;
    }

    search(){
        const keyword = this.queryStr.keyword ?{
            name:{
                $regex: this.queryStr.keyword,
                $options:"i"
            }
        }:{}
        this.query = this.query.find({...keyword});
        return this;
    }

    // filter
    filter(){
        const queryCopy = {...this.queryStr};
        // Removing some field for category
        const removeFields = ["keyword","page","limit"];
        removeFields.forEach(key=>delete queryCopy[key]);
        
        this.query = this.query.find(queryCopy);
        return this;
    }

   



} 

export {ApiFeatures};