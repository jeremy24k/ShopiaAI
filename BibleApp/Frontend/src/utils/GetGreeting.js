function getGreeting() {
    const hour = new Date().getHours();
    
    if (hour >= 6 && hour < 12) {
        return "good_morning";
    } else if (hour >= 12 && hour < 18) {
        return "good_afternoon";
    } else {
        return "good_evening";
    }
}

export default getGreeting;
