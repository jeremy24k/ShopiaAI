function getGreeting(setGreeting) {
    const hour = new Date().getHours();
    
    if (hour >= 6 && hour < 12) {
        setGreeting("Good Morning");
    } else if (hour >= 12 && hour < 18) {
        setGreeting("Good Afternoon");
    } else {
        setGreeting("Good Evening");
    }

}

export default getGreeting;
