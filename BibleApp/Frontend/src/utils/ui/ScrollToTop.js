const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    const mainContainer = document.querySelector('main');
    if (mainContainer) {
        mainContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

export default scrollToTop;