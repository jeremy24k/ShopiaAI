import Select, { components } from "react-select";
import Icon from "./Icon";

const CustomValueContainer = (props) => {
    const { children, selectProps } = props;
    const { prefixIcon, textPadding } = selectProps;

    return (
        <components.ValueContainer {...props}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: textPadding, width: '100%', overflow: 'hidden' }}>
                {prefixIcon && (
                    <div style={{ display: 'flex', flexShrink: 0 }}>
                        <Icon icon={prefixIcon} size="small" color={selectProps.variant === 'ghost' ? 'var(--black-color)' : 'inherit'} />
                    </div>
                )}
                {/* Renderizamos los hijos directamente para mantener el comportamiento de layout de React-Select */}
                {children}
            </div>
        </components.ValueContainer>
    );
};

function CustomSelect({ 
    prefixIcon, 
    arrowPadding, 
    textPadding, 
    generalPadding, 
    width,
    autoWidth = false,
    options,
    height,
    primaryColor = "var(--color-grey-500)",
    selectedTextColor = "var(--black-color)",
    optionTextColor = "var(--black-color)",
    customStyles,
    components: userComponents,
    variant = "default", // "default" | "ghost"
    fontSize = "16px",
    fixedMenuWidth = false, // Nueva prop
    ...props 
}) {
    
    // Si autoWidth está activado, calculamos un ancho aproximado basado en la opción más larga
    let calculatedWidth = width;
    if (autoWidth && options && options.length > 0) {
        const maxLabelLength = options.reduce((max, opt) => {
            const label = opt.label || '';
            return Math.max(max, label.length);
        }, 0);
        
        // Heurística: longitud + espacio para iconos/flechas/padding
        if (maxLabelLength > 0) {
            calculatedWidth = `${maxLabelLength}ch`;
        }
    }

    const styles = {
        ...customStyles, 
        container: (provided) => ({
            ...provided,
            width: calculatedWidth || provided.width,
            minWidth: calculatedWidth || provided.minWidth,
            fontSize: fontSize,
        }),
        control: (provided, state) => {
            const isGhost = variant === "ghost";
            const base = {
                ...provided,
                padding: generalPadding,
                minHeight: height,
                height: height, 
                fontSize: fontSize,
                // Estilos base vs Ghost
                backgroundColor: isGhost ? 'transparent' : provided.backgroundColor,
                border: isGhost ? '1px solid transparent' : provided.border,
                borderColor: state.isFocused ? primaryColor : (isGhost ? 'transparent' : provided.borderColor),
                boxShadow: state.isFocused ? `0 0 0 1px ${primaryColor}` : (isGhost ? 'none' : provided.boxShadow),
                
                "&:hover": {
                    borderColor: state.isFocused ? primaryColor : (isGhost ? 'transparent' : provided.borderColor),
                    backgroundColor: isGhost ? 'var(--color-grey-300)' : provided.backgroundColor
                }
            };
            return customStyles?.control ? customStyles.control(base, state) : base;
        },
        singleValue: (provided, state) => {
            const base = {
                ...provided,
                fontSize: fontSize,
                color: selectedTextColor,
                whiteSpace: 'nowrap',       // Mantener en una línea el valor seleccionado usualmente
                overflow: 'hidden',         
                textOverflow: 'ellipsis',   
                maxWidth: '100%',           
                textAlign: 'left',           
                
                // Flexbox properties para que funcione dentro de nuestro CustomValueContainer
                flex: '1 1 auto',
                minWidth: 0
            };
            return customStyles?.singleValue ? customStyles.singleValue(base, state) : base;
        },
        dropdownIndicator: (provided, state) => {
            const isGhost = variant === "ghost";
            const base = {
                ...provided,
                padding: arrowPadding,
                color: isGhost ? 'var(--black-color)' : provided.color,
                "&:hover": {
                    color: isGhost ? 'var(--black-color)' : provided.color
                }
            };
            return customStyles?.dropdownIndicator ? customStyles.dropdownIndicator(base, state) : base;
        },
        valueContainer: (provided, state) => {
            const base = {
                ...provided,
                padding: '0', 
            };
            return customStyles?.valueContainer ? customStyles.valueContainer(base, state) : base;
        },
        indicatorSeparator: (provided, state) => {
            const base = {
                display: 'none',
            };
            return customStyles?.indicatorSeparator ? customStyles.indicatorSeparator(base, state) : base;
        },
        menu: (provided, state) => {
            const base = {
                ...provided,
                marginTop: 4,
                marginBottom: 0,
                // LÓGICA DE ANCHO DEL MENÚ
                width: fixedMenuWidth ? '100%' : 'max-content',
                minWidth: '100%'
            };
            return customStyles?.menu ? customStyles.menu(base, state) : base;
        },
        menuList: (provided, state) => {
            const base = {
                ...provided,
                paddingTop: 0,
                paddingBottom: 0,
            };
            return customStyles?.menuList ? customStyles.menuList(base, state) : base;
        },
        option: (provided, state) => {
            const base = {
                ...provided,
                textAlign: 'left', 
                // LÓGICA DE TEXTO EN OPCIONES
                whiteSpace: fixedMenuWidth ? 'normal' : 'nowrap', // Wrap si el ancho es fijo
                wordWrap: fixedMenuWidth ? 'break-word' : 'normal',
                
                backgroundColor: state.isSelected 
                    ? primaryColor 
                    : state.isFocused 
                        ? "var(--color-grey-400)" 
                        : provided.backgroundColor,
                color: state.isSelected 
                    ? selectedTextColor 
                    : optionTextColor,
                ":active": {
                    ...provided[":active"],
                    backgroundColor: primaryColor,
                },
            };
            return customStyles?.option ? customStyles.option(base, state) : base;
        },
    };

    return (
        <Select 
            {...props}
            options={options}
            prefixIcon={prefixIcon}
            textPadding={textPadding}
            components={{ 
                ValueContainer: CustomValueContainer, 
                ...userComponents 
            }}
            styles={styles}
        />
    );
}

export default CustomSelect;