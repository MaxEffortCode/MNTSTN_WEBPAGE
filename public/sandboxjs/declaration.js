const { NodeVM } = require('vm2');

//Declaring functions to make inject them
//into the sandbox
const UtilFunctions = {
    callAPI: () => {
        //Code to call API and get data
        return {
            data: [{ id: 12342, name: "Utkarsh", city: "Pune" }, 
                   { id: 12343, name: "Yash", city: "Mumbai" }, 
                   { id: 12344, name: "Piyush", city: "Bengaluru" }]
        };
    },
    isHoliday: (date) => {
        //Code to check if its a holiday info from db
        return { holiday: true, name: "Diwali" };
    }
};