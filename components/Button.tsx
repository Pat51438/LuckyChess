import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
    onPress: () => void;
    title: string;
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'small' | 'medium' | 'large';
    style?: ViewStyle;
    textStyle?: TextStyle;
    disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    onPress,
    title,
    variant = 'primary',
    size = 'medium',
    style,
    textStyle,
    disabled = false,
}) => {
    const getVariantStyle = () => {
        switch (variant) {
            case 'secondary':
                return styles.buttonSecondary;
            case 'danger':
                return styles.buttonDanger;
            default:
                return styles.buttonPrimary;
        }
    };

    const getSizeStyle = () => {
        switch (size) {
            case 'small':
                return styles.buttonSmall;
            case 'large':
                return styles.buttonLarge;
            default:
                return styles.buttonMedium;
        }
    };

    const getTextSizeStyle = () => {
        switch (size) {
            case 'small':
                return styles.textSmall;
            case 'large':
                return styles.textLarge;
            default:
                return styles.textMedium;
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.button,
                getVariantStyle(),
                getSizeStyle(),
                disabled && styles.buttonDisabled,
                style,
            ]}
            onPress={onPress}
            disabled={disabled}
        >
            <Text style={[
                styles.text,
                getTextSizeStyle(),
                disabled && styles.textDisabled,
                textStyle,
            ]}>
                {title}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    buttonPrimary: {
        backgroundColor: '#4CAF50',
    },
    buttonSecondary: {
        backgroundColor: '#757575',
    },
    buttonDanger: {
        backgroundColor: '#f44336',
    },
    buttonDisabled: {
        backgroundColor: '#cccccc',
        opacity: 0.7,
    },
    buttonSmall: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    buttonMedium: {
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    buttonLarge: {
        paddingVertical: 16,
        paddingHorizontal: 32,
    },
    text: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    textSmall: {
        fontSize: 12,
    },
    textMedium: {
        fontSize: 16,
    },
    textLarge: {
        fontSize: 18,
    },
    textDisabled: {
        color: '#666666',
    },
});

export default Button;