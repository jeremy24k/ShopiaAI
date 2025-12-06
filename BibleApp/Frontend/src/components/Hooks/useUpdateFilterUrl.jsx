// useUpdateFilterUrl.jsx
import { useNavigate } from "react-router-dom";
function useUpdateFilterUrl() {
    const navigate = useNavigate();
    // Retorna una función que puede ser llamada en event handlers
    const updateFilter = (key, value, reset = false) => {
      const searchParams = new URLSearchParams(window.location.search);
      
      if (value) {
          searchParams.set(key, value); 
      } else {
          searchParams.delete(key); 
      }
      
      const newUrl = `/books?${searchParams.toString()}`;
      
      // Guardar en localStorage
      localStorage.setItem('lastBooksFilters', searchParams.toString());
      
      navigate(newUrl);
  };


    return updateFilter; // Retorna la función, no la ejecuta
}
export default useUpdateFilterUrl;