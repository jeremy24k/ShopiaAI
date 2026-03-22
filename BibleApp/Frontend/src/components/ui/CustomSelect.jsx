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
    // PERO solo si no se ha especificado un width explícito
    let calculatedWidth = width;
    if (autoWidth && !width && options && options.length > 0) {
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
            zIndex: 'var(--z-index-dropdown)',
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
                backgroundColor: isGhost ? 'transparent' : 'var(--white-color)',
                border: isGhost ? '1px solid transparent' : '1px solid var(--color-grey-300)',
                borderColor: state.isFocused ? primaryColor : (isGhost ? 'transparent' : 'var(--color-grey-300)'),
                boxShadow: state.isFocused ? `0 0 0 1px ${primaryColor}` : (isGhost ? 'none' : 'none'),
                
                "&:hover": {
                    borderColor: state.isFocused ? primaryColor : (isGhost ? 'transparent' : 'var(--color-grey-400)'),
                    backgroundColor: isGhost ? 'var(--color-grey-200)' : 'var(--white-color)'
                }
            };
            return customStyles?.control ? customStyles.control(base, state) : base;
        },
        singleValue: (provided, state) => {
            const base = {
                ...provided,
                fontSize: fontSize,
                color: 'var(--black-color)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',         
                textOverflow: 'ellipsis',   
                maxWidth: '100%',           
                textAlign: 'left',           
                
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
                color: 'var(--black-color)',
                "&:hover": {
                    color: 'var(--primary-color)'
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
        menuPortal: (provided) => ({
            ...provided,
            zIndex: 9999,
        }),
        menu: (provided, state) => {
            const base = {
                ...provided,
                marginTop: 4,
                marginBottom: 0,
                backgroundColor: 'var(--white-color)',
                border: '1px solid var(--color-grey-300)',
                boxShadow: 'var(--shadow-md)',
                width: fixedMenuWidth ? '100%' : 'max-content',
                minWidth: '100%',
            };
            return customStyles?.menu ? customStyles.menu(base, state) : base;
        },
        menuList: (provided, state) => {
            const base = {
                ...provided,
                paddingTop: 0,
                paddingBottom: 0,
                backgroundColor: 'var(--white-color)',
            };
            return customStyles?.menuList ? customStyles.menuList(base, state) : base;
        },
        option: (provided, state) => {
            const base = {
                ...provided,
                textAlign: 'left', 
                whiteSpace: fixedMenuWidth ? 'normal' : 'nowrap',
                wordWrap: fixedMenuWidth ? 'break-word' : 'normal',
                
                backgroundColor: state.isSelected 
                    ? primaryColor 
                    : state.isFocused 
                        ? "var(--color-grey-200)" 
                        : "transparent",
                color: state.isSelected 
                    ? 'var(--white-color)' 
                    : 'var(--black-color)',
                cursor: 'pointer',
                ":active": {
                    ...provided[":active"],
                    backgroundColor: primaryColor,
                    color: 'var(--white-color)',
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
            menuPortalTarget={document.body}
            menuShouldScrollIntoView={false}
        />
    );
}

export default CustomSelect;