function FetchError() {
    return (
        <div className="error-message">
            <h3>A problem occurred while loading the data.</h3>
            <p>Please check your internet connection or try again later.</p>
            <button onClick={() => window.location.reload()}>Retry</button>
        </div>
    );
}

export default FetchError;