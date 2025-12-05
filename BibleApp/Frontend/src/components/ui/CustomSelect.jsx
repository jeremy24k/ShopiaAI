import Select, { components } from "react-select";
import Icon from "./Icon";

const CustomValueContainer = (props) => {
    const { children, selectProps } = props;
    const { prefixIcon, textPadding } = selectProps;

    return (
        <components.ValueContainer {...props}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: textPadding }}>
                {prefixIcon && <Icon icon={prefixIcon} size="small" color="black" />}
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
    height,
    primaryColor = "var(--color-grey-500)",
    selectedTextColor = "var(--black-color)",
    optionTextColor = "var(--black-color)",
    customStyles,
    components: userComponents,
    ...props 
}) {
    
    const styles = {
        ...customStyles, 
        control: (provided, state) => {
            const base = {
                ...provided,
                padding: generalPadding,
                minHeight: height,
                height: height,
                borderColor: state.isFocused ? primaryColor : provided.borderColor,
                boxShadow: state.isFocused ? `0 0 0 1px ${primaryColor}` : provided.boxShadow,
                "&:hover": {
                    borderColor: state.isFocused ? primaryColor : provided.borderColor
                }
            };
            return customStyles?.control ? customStyles.control(base, state) : base;
        },
        dropdownIndicator: (provided, state) => {
            const base = {
                ...provided,
                padding: arrowPadding,
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
                marginTop: 0,
                marginBottom: 0,
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