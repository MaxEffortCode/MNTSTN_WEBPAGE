const test = async () => {
    try {
        const code = `
            if (!context.day || !context.date) {
                throw new Error('Day and Date both are required!');
            }
            let holidayInfo = utils.isHoliday({ date: context.date });
            if(holidayInfo.holiday) {
                context.plan = 'Happy ' + holidayInfo.name;
            } else if (context.day.toLowerCase() == 'sunday' || context.day.toLowerCase() == 'saturday') {
                context.plan = 'Its Weekend! Go out!';
            } else {
                context.plan = 'Work!';
            }
        `;
        const ctx = {
            day: "Saturday",
            date: "14-Nov-20",

        };
        let output = await executeJS(code, ctx);
        console.log(output);
    } catch (ex) {
        console.log(ex);
    }
};

test();