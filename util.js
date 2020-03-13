const debounce = (callback, delay = 1000)=>{
    let timeoutID;
    return (...args)=>{
        if(timeoutID){
            clearTimeout(timeoutID);
        };
        timeoutID = setTimeout(()=>{
                        //this, args
            callback.apply(null, args);
        }, delay);
    };
    
};
