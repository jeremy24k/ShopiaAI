import { useNavigate, useLocation } from "react-router-dom";

function NavigateBack() {
    const navigate = useNavigate();
    const location = useLocation();

    const handleNavigateBack = () => {
        navigate(-1);
    };

    if (location.pathname === "/books") return;
    return (
        <button onClick={handleNavigateBack}>Back</button>
    );
}

export default NavigateBack;    