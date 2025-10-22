import { theme as baseTheme } from 'antd';

import type { ConfigProviderProps } from 'antd';

// Colors
const BORDER_COLOR = 'hsla(217, 16%, 84%, 1)';
const PRIMARY_COLOR = 'hsla(157, 100%, 37%, 1)';
export const SECONDARY_COLOR = 'hsla(60, 3%, 11%, 1)';
const TERTIARY_COLOR = 'hsla(0, 0%, 62%, 1)';

const PRIMARY_DARK_COLOR = 'hsla(94, 100%, 10%, 1)';
const PRIMARY_HOVER_COLOR = 'hsla(96, 57%, 49%, 1)';
const PRIMARY_TEXT_DARK_COLOR = 'hsla(93, 100%, 4%, 1)';

export const RED_ICON_COLOR = 'hsla(3, 89%, 58%, 1)';
export const GREEN_ICON_COLOR = 'hsla(113, 100%, 33%, 1)';
export const UNIVERSAL_COLOR = 'white';

const MESSAGE_COLOR_INFO = 'hsla(60, 1%, 51%, 1)';

export const FONT_FAMILY = "'Aeonik', sans-serif";

const buttonStyle = {
	borderColorDisabled: 'transparent',
	colorPrimary: PRIMARY_COLOR,
	colorLink: PRIMARY_COLOR,
	colorText: PRIMARY_DARK_COLOR,
	colorTextLightSolid: PRIMARY_DARK_COLOR,
	contentFontSize: 13,
	contentFontSizeLG: 14,
	contentFontSizeSM: 11,
	defaultBg: 'transparent',
	defaultBorderColor: BORDER_COLOR,
	defaultColor: SECONDARY_COLOR,
	defaultHoverBg: 'hsla(94, 100%, 10%, 0.05)',
	defaultHoverBorderColor: BORDER_COLOR,
	defaultHoverColor: SECONDARY_COLOR,
	defaultActiveColor: SECONDARY_COLOR,
};

const dateStyle = {
	borderRadius: 8,
	fontSize: 12,
	fontSizeSM: 10,
	fontSizeLG: 14,
	colorPrimary: PRIMARY_TEXT_DARK_COLOR,
	colorPrimaryHover: PRIMARY_TEXT_DARK_COLOR,
	colorBorder: TERTIARY_COLOR,
	paddingBlockLG: 8,
};

const inputStyle = {
	activeBorderColor: PRIMARY_TEXT_DARK_COLOR,
	borderRadius: 8,
	colorPrimary: PRIMARY_TEXT_DARK_COLOR,
	hoverBorderColor: PRIMARY_TEXT_DARK_COLOR,
	inputFontSize: 12,
	inputFontSizeSM: 10,
	inputFontSizeLG: 14,
	paddingBlockLG: 8,
};

const selectStyle = {
	activeBorderColor: PRIMARY_TEXT_DARK_COLOR,
	borderRadius: 8,
	colorPrimary: PRIMARY_TEXT_DARK_COLOR,
	colorPrimaryHover: PRIMARY_TEXT_DARK_COLOR,
	fontSize: 12,
	fontSizeSM: 10,
	fontSizeLG: 14,
	hoverBorderColor: PRIMARY_TEXT_DARK_COLOR,
	optionSelectedColor: SECONDARY_COLOR,
	optionSelectedFontWeight: 400,
};

const theme = ({ themeValue }: { themeValue?: 'dark' | 'light' }) => {
	const value: ConfigProviderProps['theme'] = {
		algorithm:
			themeValue === 'dark'
				? baseTheme.darkAlgorithm
				: baseTheme.defaultAlgorithm,
		components: {
			Button: buttonStyle,
			Checkbox: {
				colorPrimary: TERTIARY_COLOR,
				colorPrimaryHover: SECONDARY_COLOR,
			},
			DatePicker: dateStyle,
			Form: {
				margin: 8,
				marginLG: 8, // adjust this value to your liking
			},
			InputNumber: inputStyle,
			Input: inputStyle,
			Message: {
				colorPrimary: PRIMARY_COLOR,
				colorPrimaryHover: PRIMARY_HOVER_COLOR,
				colorInfo: MESSAGE_COLOR_INFO,
			},
			Select: selectStyle,
			Tabs: {
				itemColor: PRIMARY_TEXT_DARK_COLOR,
				inkBarColor: PRIMARY_TEXT_DARK_COLOR,
				itemActiveColor: PRIMARY_TEXT_DARK_COLOR,
				itemHoverColor: PRIMARY_TEXT_DARK_COLOR,
				itemSelectedColor: PRIMARY_TEXT_DARK_COLOR,
			},
			Upload: {
				colorPrimaryHover: PRIMARY_TEXT_DARK_COLOR,
			},
		},
		token: {
			colorPrimary: PRIMARY_COLOR,
			// colorBgBase: themeValue === 'dark' ? DARK_BG_BASE_COLOR : undefined,
			fontFamily: FONT_FAMILY,
		},
	};

	return value;
};

export default theme;
